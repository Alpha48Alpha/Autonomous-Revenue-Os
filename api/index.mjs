// Vercel serverless entry for the API.
//
// This is a plain .mjs (not .ts) on purpose: it imports the pre-built esbuild
// bundle of the Express app, so Vercel's @vercel/node runtime never type-checks
// the whole server (which is written for esbuild bundling, not strict tsc).
//
// The bundle is produced by `pnpm --filter @workspace/api-server run build`
// during the Vercel build step (see vercel.json buildCommand).
import app from "../artifacts/api-server/dist/app.mjs";

export default app;
