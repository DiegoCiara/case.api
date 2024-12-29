import Router from 'express';
import WorkspaceController from '@controllers/WorkspaceController';

const routes = Router();
routes.get('/', WorkspaceController.findWorkspace);
routes.put('/', WorkspaceController.updateWorkspace);

export default routes;

