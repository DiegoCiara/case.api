import Router from 'express';
import SubscriptionController from '@controllers/SubscriptionController';

const routes = Router();
routes.get('/price/:priceId', SubscriptionController.findPlan);
routes.put('/price/', SubscriptionController.upgradePlan);
routes.get('/plans/', SubscriptionController.listPlans);
routes.get('/subscription/', SubscriptionController.findSubscription);
routes.get('/invoices/', SubscriptionController.listInvoices);
routes.delete('/payment-methods/:id', SubscriptionController.deletePaymentMethod);
routes.get('/payment-methods/', SubscriptionController.listPaymentMethods);
routes.get('/payment-intent/', SubscriptionController.createPaymentIntent);
routes.post('/payment-default/', SubscriptionController.setPaymentAsDefault);

export default routes;

