
import Router from 'express';
import DealController from '@src/app/controllers/DealController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';

const routes = Router();

routes.get('/deals/:id', ensureAuthenticated, DealController.findAll);
routes.get('/:id', ensureAuthenticated, DealController.findById);
// routes.get('/chat/:id', ensureAuthenticated, DealController.findChatOfDeal);
routes.post('/:id', ensureAuthenticated, DealController.create);
routes.post('/sale/:id', ensureAuthenticated, DealController.createSale);
routes.get('/sale/:id', ensureAuthenticated, DealController.getSale);
routes.put('/sale/:id', ensureAuthenticated, DealController.updateSale);
routes.delete('/sale/:id', ensureAuthenticated, DealController.deleteSale);
routes.post('/task/:id', ensureAuthenticated, DealController.createTask);
routes.put('/update/task/:id', ensureAuthenticated, DealController.updateTask);
routes.delete('/delete/task/:id', ensureAuthenticated, DealController.deleteTask);
routes.put('/:id', ensureAuthenticated, DealController.update);
routes.put('/pipeline/:id', ensureAuthenticated, DealController.updatePipeline);
routes.delete('/:id', ensureAuthenticated, DealController.delete);

export default routes;
