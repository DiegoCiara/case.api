import Router from 'express';
import AuthRoutes from './auth.routes';
import WorkspaceRoutes from './workspace.routes';
import SubscriptionRoutes from './subscription.routes';
import IntegrationRoutes from './integration.routes';
import AssistantRoutes from './assistant.routes';
import ThreadRoutes from './thread.routes';
import VectorRoutes from './vector.routes';
import UserRoutes from './user.routes';
import PlaygroundRoutes from './playground.routes'
import DocumentRoutes from './document.routes'
import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';

const routes = Router();

const env = process.env.TEST_BASE;

const dev = env === 'DEV';

const base = dev ? { 'Softspace Development': 'Online' } : { 'Softspace Platform': 'Online' };

routes.get('/', (req, res) => {
  res.json(base);
});

routes.use('/auth', AuthRoutes);
routes.use('/user/', ensureAuthenticated, UserRoutes);
routes.use('/workspace/', ensureAuthenticated, WorkspaceRoutes);
routes.use('/playground/', ensureAuthenticated, PlaygroundRoutes);
routes.use('/assistant/', ensureAuthenticated, AssistantRoutes);
routes.use('/document/', ensureAuthenticated, DocumentRoutes);
routes.use('/subscription/', ensureAuthenticated, SubscriptionRoutes);
routes.use('/integration/', ensureAuthenticated, IntegrationRoutes);
routes.use('/vector/', ensureAuthenticated, VectorRoutes);
routes.use('/thread', ThreadRoutes);

export default routes;

