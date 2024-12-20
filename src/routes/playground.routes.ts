import Router from 'express';
import PlaygroundController from '@src/app/controllers/PlaygroundController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';
import { ensureProfile } from '@middlewares/ensureProfile';

const routes = Router();

routes.post('/authenticate', PlaygroundController.authenticate);
routes.get('/playgrounds/:id', ensureAuthenticated, PlaygroundController.findAll);
routes.post('/create/:id', ensureAuthenticated, PlaygroundController.create);
routes.post('/messages/:id', ensureAuthenticated, PlaygroundController.findById);
routes.get('/workspaces/:id', ensureAuthenticated, PlaygroundController.findByIdUser);


export default routes;

