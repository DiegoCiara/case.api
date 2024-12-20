
import Router from 'express';
import ProfileController from '@src/app/controllers/ProfileController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';


const routes = Router();

routes.get('/profiles/:id', ProfileController.findAll);
routes.get('/:id', ProfileController.findById);
routes.post('/:id', ProfileController.create);
routes.put('/:id', ProfileController.update);
routes.delete('/:id', ProfileController.delete);


export default routes;
