import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { leadsRouter } from "./leads";
import { companiesRouter } from "./companies";
import { dealsRouter } from "./deals";
import { messagesRouter } from "./messages";
import { proposalsRouter } from "./proposals";
import { activitiesRouter } from "./activities";
import { dashboardRouter } from "./dashboard";
import { agentsRouter } from "./agents";
import { setupRouter } from "./setup";
import { transactionsRouter } from "./transactions";
import { billingRouter } from "./billing";
import { campaignsRouter } from "./campaigns";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/campaigns", campaignsRouter);
router.use("/leads", leadsRouter);
router.use("/companies", companiesRouter);
router.use("/deals", dealsRouter);
router.use("/messages", messagesRouter);
router.use("/proposals", proposalsRouter);
router.use("/activities", activitiesRouter);
router.use("/dashboard", dashboardRouter);
router.use("/agents", agentsRouter);
router.use("/setup", setupRouter);
router.use("/transactions", transactionsRouter);
router.use("/billing", billingRouter);

export default router;
