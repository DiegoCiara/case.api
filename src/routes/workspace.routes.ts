import Router from 'express';
import WorkspaceController from '@controllers/WorkspaceController';

const routes = Router();
routes.get('/', WorkspaceController.findWorkspace);
routes.put('/', WorkspaceController.updateWorkspace);
routes.delete('/:id', WorkspaceController.delete);

export default routes;

