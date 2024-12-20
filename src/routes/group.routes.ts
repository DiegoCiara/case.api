
import Router from 'express';
import GroupController from '@src/app/controllers/GroupController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';


const routes = Router();

routes.get('/groups/:id', GroupController.findAll);
routes.get('/:id', GroupController.findById);
routes.post('/import/:id', GroupController.import);
routes.post('/:id', GroupController.create);
routes.put('/:id', GroupController.update);
routes.delete('/:id', GroupController.delete);


export default routes;
