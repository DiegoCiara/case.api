import AuthController from '../app/controllers/AuthController';
import PlaygroundController from '../app/controllers/PlaygroundController';
import { ensureAuthenticated } from '../app/middlewares/ensureAuthenticated';
import Router from 'express';

const routes = Router();

routes.post('/playground/authenticate', PlaygroundController.authenticate);
routes.post('/authenticate', AuthController.authenticate);
routes.post('/forgot-password', AuthController.forgotPassword);
routes.put('/reset-password', AuthController.resetPassword);

routes.get('/faw1efawe3f14aw8es3v6awer51xx3/check', ensureAuthenticated, (req,res) => res.status(200).send());

export default routes;
