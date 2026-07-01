import { useState, useEffect } from "react";
import { useGetSetup, useSaveSetup, useGenerateLeads } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Sparkles, CheckCircle, Loader2, ArrowRight, Building2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const SMS_PRESETS = [
  {
    id: "systems",
    label: "Autopilot Systems",
    tag: "Default · Warm",
    message: "{name}, the clients I work with don't chase income — they build systems that create it. If you're ready to put your business on autopilot, reply YES. — Elizabeth Rothchild",
  },
  {
    id: "curiosity",
    label: "Curiosity Hook",
    tag: "Cold War Method · High open rate",
    message: "{name}, I found something about your business that most owners miss. It's costing you quietly every month. 90 seconds of your time? Reply CURIOUS. — Elizabeth Rothchild",
  },
  {
    id: "hardclose",
    label: "Hard Close",
    tag: "Urgency · Scarcity",
    message: "{name}, I only take on 3 new clients per month. One spot just opened. If revenue growth is a real priority right now — reply READY. If not, no hard feelings. — Elizabeth Rothchild",
  },
  {
    id: "proof",
    label: "Social Proof",
    tag: "Results-first · Trust builder",
    message: "{name}, one of my clients added $47k in new revenue last month without hiring anyone new. Same system. Different company. Want to hear how? Reply YES. — Elizabeth Rothchild",
  },
  {
    id: "pain",
    label: "Pain Point",
    tag: "Problem-aware · Empathy",
    message: "{name}, most founders I talk to are working 60-hour weeks and still missing their numbers. There's a better way. Reply OPEN if you want to hear it. — Elizabeth Rothchild",
  },
  {
    id: "custom",
    label: "Custom Message",
    tag: "Write your own",
    message: "",
  },
];

export default function Setup() {
  const { data: profile, isLoading } = useGetSetup();
  const { mutateAsync: saveProfile, isPending: saving } = useSaveSetup();
  const { mutateAsync: generateLeads, isPending: generating } = useGenerateLeads();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    targetMarket: "",
    description: "",
    valueProp: "",
    icp: "",
    website: "",
    linkedinUrl: "",
    smsCampaignMessage: "",
  });
  const [saved, setSaved] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("systems");
  const [showSms, setShowSms] = useState(true);

  useEffect(() => {
    if (profile) {
      const savedMsg = profile.smsCampaignMessage || "";
      const matchedPreset = SMS_PRESETS.find(
        (p) => p.id !== "custom" && p.message === savedMsg
      );
      const presetId = matchedPreset ? matchedPreset.id : savedMsg ? "custom" : "systems";
      setSelectedPreset(presetId);
      setForm({
        companyName: profile.companyName || "",
        industry: profile.industry || "",
        targetMarket: profile.targetMarket || "",
        description: profile.description || "",
        valueProp: profile.valueProp || "",
        icp: profile.icp || "",
        website: profile.website || "",
        linkedinUrl: profile.linkedinUrl || "",
        smsCampaignMessage: savedMsg,
      });
    }
  }, [profile]);

  const activeSmsMessage =
    selectedPreset === "custom"
      ? form.smsCampaignMessage
      : SMS_PRESETS.find((p) => p.id === selectedPreset)?.message || "";

  const handleSave = async () => {
    try {
      await saveProfile({ data: { ...form, smsCampaignMessage: activeSmsMessage } });
      setSaved(true);
      queryClient.invalidateQueries();
      toast({ title: "Profile saved", description: "Your company profile and SMS campaign are active." });
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
    }
  };

  const handleGenerateLeads = async () => {
    try {
      const result = await generateLeads({ data: { count: 5 } });
      queryClient.invalidateQueries();
      toast({
        title: `${result.generated} leads generated`,
        description: "AI agents found new prospects for your pipeline.",
      });
    } catch {
      toast({ title: "Error", description: "Lead generation failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasProfile = !!profile;

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif italic text-3xl font-bold tracking-tight text-white">Company Setup</h1>
            <p className="text-sm text-muted-foreground">
              Tell the AI agents about your company — they use this to generate leads and write personalized outreach.
            </p>
          </div>
        </div>

        {hasProfile && (
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-2.5 mt-4">
            <CheckCircle className="w-4 h-4" />
            Profile active — agents are using your company context
          </div>
        )}
      </div>

      {/* Company Form */}
      <div className="bg-card border border-border rounded-xl p-8 space-y-6">
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label>Company Name</Label>
            <Input
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="Your company name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Industry</Label>
            <Input
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              placeholder="AI / SaaS / Fintech…"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Target Market</Label>
          <Input
            value={form.targetMarket}
            onChange={(e) => setForm({ ...form, targetMarket: e.target.value })}
            placeholder="Series A–C startups in the US that need revenue automation"
          />
        </div>

        <div className="space-y-1.5">
          <Label>What does your company do?</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="We build AI agents that automate B2B sales and outreach, replacing expensive SDR teams with intelligent automation."
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Value Proposition</Label>
          <Textarea
            value={form.valueProp}
            onChange={(e) => setForm({ ...form, valueProp: e.target.value })}
            placeholder="10x your outbound pipeline with autonomous AI agents that prospect, write personalized emails, and book meetings — for 90% less than a human SDR team."
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Ideal Customer Profile (ICP)</Label>
          <Textarea
            value={form.icp}
            onChange={(e) => setForm({ ...form, icp: e.target.value })}
            placeholder="B2B SaaS companies with 10–200 employees, $1M–$50M ARR, active sales team, using HubSpot or Salesforce. Decision makers: VP Sales, CRO, CEO."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label>Website (optional)</Label>
            <Input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://yourcompany.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>LinkedIn (optional)</Label>
            <Input
              value={form.linkedinUrl}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            {saved ? "Saved!" : "Save Profile"}
          </Button>
        </div>
      </div>

      {/* SMS Campaign Selector */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-8 py-5 hover:bg-white/2 transition-colors"
          onClick={() => setShowSms(!showSms)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">SMS Campaign — Elizabeth Rothchild</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {SMS_PRESETS.find((p) => p.id === selectedPreset)?.label} · Autopilot sends this every 2 hours
              </p>
            </div>
          </div>
          {showSms ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {showSms && (
          <div className="px-8 pb-8 space-y-5 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Pick a battle-tested pitch or write your own. <code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded">{"{name}"}</code> personalizes to each lead's first name.
            </p>

            {/* Preset cards */}
            <div className="space-y-3">
              {SMS_PRESETS.map((preset) => {
                const active = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-white/20 hover:bg-white/2"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${active ? "text-primary" : "text-white"}`}>
                        {preset.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                        {preset.tag}
                      </span>
                    </div>
                    {preset.id !== "custom" && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {preset.message}
                      </p>
                    )}
                    {preset.id === "custom" && (
                      <p className="text-xs text-muted-foreground italic">Write your own message below</p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom textarea */}
            {selectedPreset === "custom" && (
              <div className="space-y-1.5">
                <Label>Your Custom Message</Label>
                <Textarea
                  value={form.smsCampaignMessage}
                  onChange={(e) => setForm({ ...form, smsCampaignMessage: e.target.value })}
                  placeholder={`{name}, [your message here] — Elizabeth Rothchild`}
                  rows={4}
                />
              </div>
            )}

            {/* Live preview */}
            <div className="rounded-lg border border-white/8 bg-black/30 p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Live Preview</p>
              <p className="text-sm text-white/80 leading-relaxed italic">
                {(activeSmsMessage || "").replace(/\{name\}/gi, "Sarah") || "Select a campaign above…"}
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              {saved ? "Campaign Saved!" : "Save Campaign"}
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {hasProfile && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-semibold">Quick Actions</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Use your profile to power AI actions immediately.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGenerateLeads}
              disabled={generating}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
            >
              <div>
                <p className="font-medium text-sm">Generate 5 Leads</p>
                <p className="text-xs text-muted-foreground mt-0.5">AI finds prospects matching your ICP</p>
              </div>
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              )}
            </button>

            <a
              href="/comms"
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
            >
              <div>
                <p className="font-medium text-sm">Open Comms Center</p>
                <p className="text-xs text-muted-foreground mt-0.5">Send email and SMS to your leads</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
