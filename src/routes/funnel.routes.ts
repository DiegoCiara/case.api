
import Router from 'express';
import FunnelController from '@src/app/controllers/FunnelController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';

const routes = Router();

routes.get('/funnels/:id', ensureAuthenticated, FunnelController.findAll);
routes.get('/pipeline/funnels/:id', ensureAuthenticated, FunnelController.findAllActive);
routes.get('/activeFunnels/:id', ensureAuthenticated, FunnelController.findAllActive);
routes.get('/isActive/:id', ensureAuthenticated, FunnelController.findFunnelActive);
routes.get('/:id', ensureAuthenticated, FunnelController.findById);
routes.post('/:id', ensureAuthenticated, FunnelController.create);
routes.put('/:id', ensureAuthenticated, FunnelController.update);
routes.put('/duplicate/:id', ensureAuthenticated, FunnelController.duplicate);
routes.delete('/:id', ensureAuthenticated, FunnelController.delete);

export default routes;
