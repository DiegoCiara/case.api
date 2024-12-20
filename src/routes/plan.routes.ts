import Router from 'express';
import PlanController from '@src/app/controllers/PlanController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';
import { ensureProfile } from '@middlewares/ensureProfile';


const routes = Router();

routes.get('/', ensureAuthenticated, PlanController.findPlans);
// routes.get('/:id', ensureAuthenticated, PlanController.findUserById);
// routes.put('/:id', ensureAuthenticated, PlanController.update);
// routes.post('/', PlanController.create);
// routes.delete('/:id', ensureAuthenticated, PlanController.delete);

export default routes;
