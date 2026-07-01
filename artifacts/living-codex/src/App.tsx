import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";
import { SubscriptionGate } from "@/components/subscription-gate";

import Dashboard from "@/pages/dashboard";
import Leads from "@/pages/leads";
import LeadDetail from "@/pages/lead-detail";
import Companies from "@/pages/companies";
import Deals from "@/pages/deals";
import Comms from "@/pages/comms";
import Transactions from "@/pages/transactions";
import Proposals from "@/pages/proposals";
import Activities from "@/pages/activities";
import Setup from "@/pages/setup";
import Billing from "@/pages/billing";
import CampaignSms from "@/pages/campaign-sms";
import NotFound from "@/pages/not-found";

import Home from "@/pages/marketing/Home";
import Founder from "@/pages/marketing/Founder";
import About from "@/pages/marketing/About";
import Mission from "@/pages/marketing/Mission";
import Platform from "@/pages/marketing/Platform";
import Pricing from "@/pages/marketing/Pricing";

const queryClient = new QueryClient();

function AppRouter() {
  return (
    <AppLayout>
      <Switch>
        {/* Always accessible — no gate */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/setup" component={Setup} />
        <Route path="/billing" component={Billing} />

        {/* Subscription-gated — only locks when Stripe is configured + no active sub */}
        <Route path="/leads">
          <SubscriptionGate><Leads /></SubscriptionGate>
        </Route>
        <Route path="/leads/:id" component={LeadDetail} />
        <Route path="/campaigns/sms">
          <SubscriptionGate><CampaignSms /></SubscriptionGate>
        </Route>
        <Route path="/companies" component={Companies} />
        <Route path="/deals">
          <SubscriptionGate><Deals /></SubscriptionGate>
        </Route>
        <Route path="/comms">
          <SubscriptionGate><Comms /></SubscriptionGate>
        </Route>
        <Route path="/transactions">
          <SubscriptionGate><Transactions /></SubscriptionGate>
        </Route>
        <Route path="/proposals" component={Proposals} />
        <Route path="/activities" component={Activities} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            {/* ── Public marketing site (no dashboard chrome) ── */}
            <Route path="/" component={Home} />
            <Route path="/founder" component={Founder} />
            <Route path="/about" component={About} />
            <Route path="/mission" component={Mission} />
            <Route path="/platform" component={Platform} />
            <Route path="/pricing" component={Pricing} />

            {/* Handle /living-codex base path (old URL) → redirect to dashboard */}
            <Route path="/living-codex"><Redirect to="/dashboard" /></Route>
            <Route path="/living-codex/:rest*"><Redirect to="/dashboard" /></Route>

            {/* ── Product application ── */}
            <Route component={AppRouter} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
