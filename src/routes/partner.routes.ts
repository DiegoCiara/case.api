
import Router from 'express';
import PartnerController from '@src/app/controllers/PartnerController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';


const routes = Router();

routes.get('/partners/:id', PartnerController.findAll);
routes.get('/:id', PartnerController.findById);
routes.post('/import/:id', PartnerController.import);
routes.post('/:id', PartnerController.create);
routes.put('/:id', PartnerController.update);
routes.delete('/:id', PartnerController.delete);


export default routes;
