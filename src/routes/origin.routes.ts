
import Router from 'express';
import OriginController from '@src/app/controllers/OriginController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';


const routes = Router();

routes.get('/origins/:id', OriginController.findAll);
routes.get('/:id', OriginController.findById);
routes.post('/import/:id', OriginController.import);
routes.post('/:id', OriginController.create);
routes.put('/:id', OriginController.update);
routes.delete('/:id', OriginController.delete);


export default routes;
