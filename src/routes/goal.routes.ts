
import Router from 'express';
import GoalController from '@src/app/controllers/GoalController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';


const routes = Router();

routes.get('/goals/:id', GoalController.findAll);
routes.get('/:id', GoalController.findById);
routes.post('/:id', GoalController.create);
routes.post('/import/:id', GoalController.import);
routes.put('/:id', GoalController.update);
routes.delete('/:id', GoalController.delete);


export default routes;
