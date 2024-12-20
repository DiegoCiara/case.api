import CustomerController from '../app/controllers/CustomerController';
import PlaygroundController from '../app/controllers/PlaygroundController';
import { ensureCustomerAuthenticated } from '../app/middlewares/ensureCustomerAuthenticated';
import Router from 'express';

const routes = Router();



routes.post('/auth', CustomerController.authenticate);
routes.post('/forgot-password', CustomerController.forgotPassword);
routes.put('/reset-password', CustomerController.resetPassword);

//Chat External
routes.post('/create/:id', ensureCustomerAuthenticated, CustomerController.createThread);
routes.get('/messages/:id', ensureCustomerAuthenticated, CustomerController.findThreadMessages);
routes.get('/threads/:id', ensureCustomerAuthenticated, CustomerController.findThreads);

routes.get('/faw1efawe3f14aw8es3v6awer51xx3/check', ensureCustomerAuthenticated, (req,res) => res.status(200).send());

export default routes;
