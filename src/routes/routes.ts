import Router from 'express';
import AuthRoutes from './auth.routes';
import CustometAuthRoutes from './authcustomer.routes';
import OpenAIRoutes from './openai.routes';
import PlanRoutes from './plan.routes';
import WorkspaceRoutes from './workspace.routes';
import ThreadRoutes from './thread.routes';
import OpenRoutes from './open.routes';
import PipelineRoutes from './pipeline.routes';
import ProductRoutes from './product.routes';
import DealRoutes from './deal.routes';
import FunnelRoutes from './funnel.routes';
import CustomerRoutes from './customer.routes';
import MessageRoutes from './message.routes';
import GroupRoutes from './group.routes';
import ProfileRoutes from './profile.routes';
import PartnerRoutes from './partner.routes';
import VectorRoutes from './vector.routes';
import AssistantRoutes from './assistant.routes';
import BankRoutes from './bank.routes';
import CommissionRoutes from './commission.routes';
import GoalRoutes from './goal.routes';
import SellRoutes from './sale.routes';
import OriginRoutes from './origin.routes';
import DashboardRoutes from './dashboard.routes';
import LandingPagesRoutes from './landingpage.routes';
import PlaygroundRoutes from './playground.routes';
import UserRoutes from './user.routes';
import ApiRoutes from './api.routes';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';

const routes = Router();

const env = process.env.TEST_BASE;

const dev = env === 'DEV';

const base = dev ? { 'Softspace Development': 'Online' } : { 'Softspace Platform': 'Online' };

routes.get('/', (req, res) => {
  res.json(base);
});

routes.use('/auth', AuthRoutes);
routes.use('/customer-auth', CustometAuthRoutes);
routes.use('/user/:userId', ensureAuthenticated, UserRoutes);
routes.use('/workspace/:userId', ensureAuthenticated, WorkspaceRoutes);
routes.use('/ai/:userId', ensureAuthenticated, OpenAIRoutes);
routes.use('/pipeline/:userId', ensureAuthenticated, PipelineRoutes);
routes.use('/product/:userId', ensureAuthenticated, ProductRoutes);
routes.use('/deal/:userId', ensureAuthenticated, DealRoutes);
routes.use('/sale/:userId', ensureAuthenticated, SellRoutes);
routes.use('/funnel/:userId', ensureAuthenticated, FunnelRoutes);
routes.use('/customer/:userId', ensureAuthenticated, CustomerRoutes);
routes.use('/message/:userId', ensureAuthenticated, MessageRoutes);
routes.use('/plan/:userId', ensureAuthenticated, PlanRoutes);
routes.use('/group/:userId', ensureAuthenticated, GroupRoutes);
routes.use('/profile/:userId', ensureAuthenticated, ProfileRoutes);
routes.use('/partner/:userId', ensureAuthenticated, PartnerRoutes);
routes.use('/assistant/:userId', ensureAuthenticated, AssistantRoutes);
routes.use('/vector/:userId', ensureAuthenticated, VectorRoutes);
routes.use('/origin/:userId', ensureAuthenticated, OriginRoutes);
routes.use('/landingpage/:userId', ensureAuthenticated, LandingPagesRoutes);
routes.use('/bank/:userId', ensureAuthenticated, BankRoutes);
routes.use('/commission/:userId', ensureAuthenticated, CommissionRoutes);
routes.use('/goal/:userId', ensureAuthenticated, GoalRoutes);
routes.use('/dashboard/:userId', ensureAuthenticated, DashboardRoutes);
routes.use('/playground/:userId', ensureAuthenticated, PlaygroundRoutes);
routes.use('/softspace', OpenRoutes);
routes.use('/api', ApiRoutes);
routes.use('/chat', OpenRoutes);
routes.use('/thread', ThreadRoutes);

export default routes;

