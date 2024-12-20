
import Router from 'express';
import DashboardController from '@src/app/controllers/DashboardController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';


const routes = Router();

routes.get('/:id/:userId/:date', DashboardController.getDashboardAdmin);
// routes.get('/:id', DashboardController.findById);
// routes.post('/:id', DashboardController.create);
// routes.post('/import/:id', DashboardController.import);
// routes.put('/:id', DashboardController.update);
// routes.delete('/:id', DashboardController.delete);


export default routes;
