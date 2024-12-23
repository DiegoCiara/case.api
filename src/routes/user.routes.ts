import Router from 'express';
import UserController from '@src/app/controllers/UserController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';
import { ensureProfile } from '@middlewares/ensureProfile';

const routes = Router();

routes.get('/', UserController.findUsers);
routes.post('/invite', UserController.inviteWorkspace);



routes.get('/accesses/:id', ensureAuthenticated, UserController.getAccesses);
routes.get('/access/:id', ensureAuthenticated, UserController.findAccessById);
routes.get('/:id', ensureAuthenticated, UserController.findUserById);
routes.put('/access/:id', ensureAuthenticated, UserController.update);
routes.put('/:id', ensureAuthenticated, UserController.updateUser);
routes.put('/picture/:id/:userId', ensureAuthenticated, UserController.updatePicture);
routes.get('/permissions/:id/:workspaceId', UserController.getPermission);
routes.get('/notify/:id/:workspaceId', UserController.getNotifications);
routes.post('/:id', UserController.create);
routes.delete('/:id/:userId', ensureAuthenticated, UserController.delete);
routes.put('/update-password/:id', ensureAuthenticated, ensureProfile, UserController.passwordUpdate);

export default routes;

