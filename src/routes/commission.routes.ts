
import Router from 'express';
import CommissionController from '@src/app/controllers/CommissionController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';


const routes = Router();

routes.get('/commissions/:id', CommissionController.findAll);
routes.get('/:id', CommissionController.findById);
routes.post('/:id', CommissionController.create);
routes.post('/import/:id', CommissionController.import);
routes.put('/:id', CommissionController.update);
routes.delete('/:id', CommissionController.delete);


export default routes;
