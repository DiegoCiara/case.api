import Router from 'express';
import PlanController from '@controllers/PlanController';

const routes = Router();
routes.get('/', PlanController.findPlans);
routes.get('/:id', PlanController.findPlanById);

export default routes;

