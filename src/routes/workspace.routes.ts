import Router from 'express';
import WorkspaceController from '@controllers/WorkspaceController';

const routes = Router();
routes.get('/', WorkspaceController.findWorkspace);
routes.put('/:workspaceId', WorkspaceController.updateWorkspace);
routes.get('/invoices/', WorkspaceController.listInvoices);
routes.post('/method/', WorkspaceController.generateCreditCardToken);

export default routes;

