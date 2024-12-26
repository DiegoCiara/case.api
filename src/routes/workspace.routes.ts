import Router from 'express';
import WorkspaceController from '@controllers/WorkspaceController';

const routes = Router();
routes.get('/', WorkspaceController.findWorkspace);
routes.put('/', WorkspaceController.updateWorkspace);
routes.get('/plans/', WorkspaceController.listPlans);
routes.get('/subscription/', WorkspaceController.findSubscription);
routes.get('/invoices/', WorkspaceController.listInvoices);
routes.delete('/payment-methods/:id', WorkspaceController.deletePaymentMethod);
routes.get('/payment-methods/', WorkspaceController.listPaymentMethods);
routes.get('/payment-intent/', WorkspaceController.createPaymentIntent);
routes.post('/payment-default/', WorkspaceController.setPaymentAsDefault);
routes.post('/method/', WorkspaceController.generateCreditCardToken);

export default routes;

