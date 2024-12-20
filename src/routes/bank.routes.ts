
import Router from 'express';
import BankController from '@src/app/controllers/BankController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';


const routes = Router();

routes.get('/banks/:id', BankController.findAll);
routes.get('/:id', BankController.findById);
routes.post('/import/:id', BankController.import);
routes.post('/:id', BankController.create);
routes.put('/:id', BankController.update);
routes.delete('/:id', BankController.delete);


export default routes;
