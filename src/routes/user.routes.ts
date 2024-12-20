import Router from 'express';
import UserController from '@src/app/controllers/UserController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';
import { ensureProfile } from '@middlewares/ensureProfile';

const routes = Router();

routes.get('/users/:id', ensureAuthenticated, UserController.findUsers);
routes.get('/accesses/:id', ensureAuthenticated, UserController.getAccesses);
routes.get('/:id/:userId', ensureAuthenticated, UserController.findUserById);
routes.put('/:id/:userId', ensureAuthenticated, UserController.update);
routes.put('/picture/:id/:userId', ensureAuthenticated, UserController.updatePicture);
routes.get('/permissions/:id/:workspaceId', UserController.getPermission);
routes.get('/notify/:id/:workspaceId', UserController.getNotifications);
routes.post('/:id', UserController.create);
routes.post('/invite/:id', UserController.inviteWorkspace);
routes.delete('/:id/:userId', ensureAuthenticated, UserController.delete);
routes.put('/update-password/:id', ensureAuthenticated, ensureProfile, UserController.passwordUpdate);

export default routes;

