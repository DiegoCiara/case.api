import Router from 'express';
import WorkspaceController from '@controllers/WorkspaceController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';

const routes = Router();

routes.get('/', WorkspaceController.findAll);
// routes.post('/login/:id', WorkspaceController.conectionWhatsApp);
routes.put('/access/:id', WorkspaceController.updateWorkspace);
routes.put('/openaiapikey/:id', WorkspaceController.updateOpenaiApiKey);
// routes.put('/check-whatsapp/:id', WorkspaceController.CheckConectionWhatsApp);
routes.delete('/:id', WorkspaceController.delete);

export default routes;

