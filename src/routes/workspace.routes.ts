import Router from 'express';
import WorkspaceController from '@controllers/WorkspaceController';

const routes = Router();
routes.get('/', WorkspaceController.findWorkspace);
routes.put('/:workspaceId', WorkspaceController.updateWorkspace);
routes.get('/invoices/', WorkspaceController.listInvoices);
routes.get('/payment-methods/', WorkspaceController.listPaymentMethods);
routes.get('/payment-intent/', WorkspaceController.createPaymentIntent);
routes.post('/method/', WorkspaceController.generateCreditCardToken);

export default routes;

