import Router from 'express';
import WorkspaceController from '@controllers/WorkspaceController';

const routes = Router();
routes.get('/workspaces', WorkspaceController.findWorkspaces);
routes.get('/', WorkspaceController.findWorkspace);
routes.put('/', WorkspaceController.updateWorkspace);
routes.post('/', WorkspaceController.createWorkspace);

export default routes;

