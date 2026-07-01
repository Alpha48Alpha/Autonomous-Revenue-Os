/**
 * Dev launcher for Expo in Replit.
 *
 * Binds $PORT immediately so Replit's health check passes, then starts Metro
 * on port 8081 and proxies traffic. If a previous instance is still holding
 * $PORT (pnpm doesn't always SIGTERM grandchildren), we force-kill it first.
 */
"use strict";

const http  = require("http");
const net   = require("net");
const { spawn, execSync } = require("child_process");
const path  = require("path");

const PORT        = parseInt(process.env.PORT || "23668", 10);
const METRO_PORT  = 9091; // Far from other services; 8081 is used by mockup-sandbox
const PROJECT_ROOT = path.resolve(__dirname, "..");

// ── Step 1: free the port if something is already holding it ─────────────────
function freePort(p) {
  try {
    // Works on Linux (NixOS); swallow errors silently
    execSync(`fuser -k ${p}/tcp 2>/dev/null || true`, { stdio: "ignore" });
  } catch (_) {}
  try {
    execSync(
      `node -e "const n=require('net');const c=n.connect(${p},'127.0.0.1',()=>{c.destroy()});c.on('error',()=>{});" 2>/dev/null`,
      { stdio: "ignore", timeout: 500 }
    );
  } catch (_) {}
}

freePort(PORT);

// ── Step 2: bind $PORT ────────────────────────────────────────────────────────
const server = http.createServer(handleReq);
server.on("upgrade", handleUpgrade);
server.on("error", (err) => {
  console.error(`[dev] server error: ${err.code} ${err.message}`);
  if (err.code === "EADDRINUSE") {
    console.log(`[dev] Port ${PORT} still busy, retrying in 1 s…`);
    setTimeout(() => server.listen(PORT, "0.0.0.0"), 1000);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[dev] Listening on 0.0.0.0:${PORT} ✓`);
  launchMetro();
});

// ── HTTP proxy ────────────────────────────────────────────────────────────────
function handleReq(req, res) {
  const url = req.url || "/";

  // Health-check endpoint — always 200 immediately
  if (url === "/status" || url.startsWith("/status?")) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "packager-status:running" }));
    return;
  }

  const opts = {
    hostname: "127.0.0.1",
    port: METRO_PORT,
    path: url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${METRO_PORT}` },
  };
  const pr = http.request(opts, (up) => {
    res.writeHead(up.statusCode, up.headers);
    up.pipe(res);
  });
  pr.on("error", () => {
    if (!res.headersSent) { res.writeHead(200, { "content-type": "text/plain" }); }
    res.end("Metro is starting — please wait and refresh.");
  });
  req.pipe(pr);
}

// ── WebSocket proxy (Metro HMR) ───────────────────────────────────────────────
function handleUpgrade(req, socket, head) {
  const c = net.connect(METRO_PORT, "127.0.0.1", () => {
    let h = `${req.method} ${req.url} HTTP/1.1\r\n`;
    for (const [k, v] of Object.entries(req.headers)) h += `${k}: ${v}\r\n`;
    c.write(h + "\r\n");
    if (head.length) c.write(head);
    c.pipe(socket); socket.pipe(c);
  });
  c.on("error", () => socket.destroy());
  socket.on("error", () => c.destroy());
}

// ── Metro ─────────────────────────────────────────────────────────────────────
function launchMetro() {
  const env = {
    ...process.env,
    EXPO_PACKAGER_PROXY_URL: process.env.REPLIT_EXPO_DEV_DOMAIN
      ? `https://${process.env.REPLIT_EXPO_DEV_DOMAIN}` : "",
    EXPO_PUBLIC_DOMAIN: process.env.REPLIT_DEV_DOMAIN || "",
    EXPO_PUBLIC_REPL_ID: process.env.REPL_ID || "",
    REACT_NATIVE_PACKAGER_HOSTNAME: process.env.REPLIT_DEV_DOMAIN || "",
  };
  const metro = spawn(
    "pnpm", ["exec", "expo", "start", "--localhost", "--port", String(METRO_PORT)],
    { env, cwd: PROJECT_ROOT, stdio: "inherit" }
  );
  metro.on("error", (e) => console.error("[dev] Metro spawn error:", e.message));
  metro.on("exit", (code, sig) => {
    if (code !== 0 && sig !== "SIGTERM" && sig !== "SIGINT") {
      console.warn(`[dev] Metro exited (${code}/${sig}), restarting in 4 s…`);
      setTimeout(launchMetro, 4000);
    }
  });

  process.on("SIGTERM", () => { metro.kill("SIGTERM"); server.close(); process.exit(0); });
  process.on("SIGINT",  () => { metro.kill("SIGINT");  server.close(); process.exit(0); });
}

process.on("uncaughtException", (e) => console.error("[dev] Uncaught:", e.message));
