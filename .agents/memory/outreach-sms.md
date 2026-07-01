---
name: Outreach SMS — what actually sends
description: How SMS body is chosen, the Twilio delivery blocker, and Stripe sandbox note for the Autonomous Revenue OS project.
---

# SMS body: owner's campaign message is the source of truth
- SMS body resolution order is: explicit per-send body -> saved campaign message -> built-in luxury default. There is deliberately NO AI generation or generic fallback for SMS — an earlier version auto-wrote generic B2B copy that got sent under the owner's persona, which the owner considered a serious failure.
- **Why:** the operator (Elizabeth Rothchild persona, luxury real-estate outreach to personal/consented contacts) needs what-you-see-is-what-sends. Silent AI substitution is unacceptable here.
- **How to apply:** never reintroduce AI/auto-generated SMS copy. If adding an SMS path, route it through the saved campaign message and personalization tokens ({name}/{firstName}/{fullName}).

# Twilio delivery blocker (user-only fix)
- Real SMS delivery fails while the Twilio account is in Trial (error 21608) and/or the from-number is an unverified toll-free (30032). Only the account owner can resolve this in the Twilio console (upgrade + verify number). Code cannot fix deliverability.

# Stripe
- No-code Stripe Payment Links are the chosen approach (owner pastes buy.stripe.com links per tier). Live charges require the owner's activated/live Stripe account; test/sandbox keys won't take real money.
