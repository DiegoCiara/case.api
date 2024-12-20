
import Router from 'express';
import MessageController from '@src/app/controllers/MessageController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';

const routes = Router();

routes.post('/whatsapp/', ensureAuthenticated, MessageController.sendMessageWhatsApp);
routes.post('/widget/', ensureAuthenticated, MessageController.sendMessageWidget);
routes.get('/:id', ensureAuthenticated, MessageController.findByThread);

export default routes;
