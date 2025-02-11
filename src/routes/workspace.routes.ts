import Router from 'express';
import WorkspaceController from '@controllers/WorkspaceController';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';

const routes = Router();
routes.get('/workspaces', ensureAuthenticated, WorkspaceController.findWorkspaces);
routes.get('/', ensureAuthenticated, WorkspaceController.findWorkspace);
routes.put('/', ensureAuthenticated, WorkspaceController.updateWorkspace);
routes.post('/', ensureAuthenticated, WorkspaceController.createWorkspace);

export default routes;

