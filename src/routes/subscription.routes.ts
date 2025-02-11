import Router from 'express';
import SubscriptionController from '@controllers/SubscriptionController';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';

const routes = Router();
routes.get('/price/:priceId', ensureAuthenticated, SubscriptionController.findPlan);
routes.put('/price/', ensureAuthenticated, SubscriptionController.upgradePlan);
routes.get('/plans/', ensureAuthenticated, SubscriptionController.listPlans);
routes.get('/subscription/', ensureAuthenticated, SubscriptionController.findSubscription);
routes.get('/invoices/', ensureAuthenticated, SubscriptionController.listInvoices);
routes.delete('/payment-methods/:id', ensureAuthenticated, SubscriptionController.deletePaymentMethod);
routes.get('/payment-methods/', ensureAuthenticated, SubscriptionController.listPaymentMethods);
routes.get('/payment-intent/', ensureAuthenticated, SubscriptionController.createPaymentIntent);
routes.post('/payment-default/', ensureAuthenticated, SubscriptionController.setPaymentAsDefault);

export default routes;

