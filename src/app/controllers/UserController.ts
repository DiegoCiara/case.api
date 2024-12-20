import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import Users from '@entities/User';
import queryBuilder from '@utils/queryBuilder';
import emailValidator from '@utils/emailValidator';
import generatePassword from '@utils/generatePassword';
import transport from '@src/modules/mailer';
import { firstName } from '@utils/format';
import sendMail from '@src/services/sendEmail';
import crypto from 'crypto';
import Workspace from '@entities/Workspace';
import Access from '@entities/Access';
import User from '@entities/User';
import Notification from '@entities/Notification';
import eventEmitter from '@utils/emitter';
import { notify } from '@utils/createNotifications';
import { In } from 'typeorm';
import { s3 } from '@utils/s3';
import { log } from '@utils/createLog';
import { ioSocket } from '@src/socket';

interface UserInterface {
  name?: string;
  role?: string;
  token?: string;
  picture?: string;
  email?: string;
  notifyEnabled?: boolean;
  password?: string;
}

class UserController {
  public async findUsers(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      const accesses = await Access.find({ where: { workspace: workspace }, relations: ['user'] });

      const users: any = await Promise.all(
        accesses.map(async (access: any) => {
          return {
            ...access.user,
            passwordHash: undefined,
            role: access.role,
          };
        })
      );
      // const users = await Users.find({ where: { accesses: In(accesses)}});
      // users.map((user: { passwordHash: undefined }) => (user.passwordHash = undefined));
      await log('users', req, 'findUsers', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(users);
    } catch (error) {
      await log('users', req, 'findUsers', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Find users failed, try again' });
    }
  }
  public async getPermission(req: Request, res: Response): Promise<Response> {
    try {
      const { id, workspaceId } = req.params;

      if (!id || !workspaceId) return res.status(400).json({ message: 'Invalid values for User' });

      const user = await User.findOne(id, {
        select: ['id', 'email', 'name', 'passwordResetToken', 'passwordHash', 'picture'],
      });

      const workspace = await Workspace.findOne(workspaceId);
      const access = await Access.findOne({ where: { user, workspace } });
      if (!access) return res.status(404).json({ error: 'Authenticate failed, try again' });

      await log('users', req, 'getPermission', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json({ role: access.role });
    } catch (error) {
      console.error(error);
      await log('users', req, 'getPermission', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Authenticate failed, try again' });
    }
  }
  public async getAccesses(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if ( !id) return res.status(400).json({ message: 'Invalid values for User' });

      const workspace = await Workspace.findOne(id, { relations: [ 'accesses', 'accesses.user']});

      if (!workspace) return res.status(404).json({ error: 'Authenticate failed, try again' });

      await log('users', req, 'accesses', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(workspace.accesses);
    } catch (error) {
      console.error(error);
      await log('users', req, 'accesses', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Authenticate failed, try again' });
    }
  }

  public async getNotifications(req: Request, res: Response): Promise<Response> {
    try {
      const { id, workspaceId } = req.params;
      if (!id || !workspaceId) return res.status(400).json({ message: 'Invalid values for User' });

      const user = await User.findOne(id, {
        select: ['id', 'email', 'name', 'passwordResetToken', 'passwordHash', 'picture'],
      });

      const workspace = await Workspace.findOne(workspaceId);

      const access = await Access.findOne({ where: { user, workspace } });

      if (!access) return res.status(404).json({ error: 'Authenticate failed, try again' });

      if (access.role === 'SELLER') {
        const notifications = await Notification.find({ where: { user, workspace, role: access.role } });
        for (const notification of notifications) {
          if (!notification.viewed) {
            await Notification.update(notification.id, { viewed: !notification.viewed });
          }
        }
        await eventEmitter.emit('notify', user?.id, workspace!.id);

        return res.status(200).json({ notifications: notifications.reverse() });
      } else {
        const notifications = await Notification.find({ where: { user, workspace } });
        for (const notification of notifications) {
          if (!notification.viewed) {
            await Notification.update(notification.id, { viewed: !notification.viewed });
          }
        }
        await eventEmitter.emit('notify', user?.id, workspace!.id);

        await log('users', req, 'getNotifications', 'success', JSON.stringify({ id: id }), id);
        return res.status(200).json({ notifications: notifications.reverse() });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Authenticate failed, try again' });
    }
  }

  public async findUsersOfWorkspace(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      const access = await Access.find({ where: { workspace: workspace } });

      const users = await Users.find(queryBuilder(req.query));

      users.map((user: { passwordHash: undefined }) => (user.passwordHash = undefined));

      await log('users', req, 'findUsersOfWorkspace', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(users);
    } catch (error) {
      await log('users', req, 'findUsersOfWorkspace', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Find users failed, try again' });
    }
  }

  public async findUserById(req: Request, res: Response): Promise<Response> {
    try {
      const { id, userId } = req.params;

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Users not exist' });

      const user = await Users.findOne(userId);

      if (!user) return res.status(404).json({ message: 'Users not exist' });

      const access = await Access.findOne({ where: { user, workspace } });

      if (!access) return res.status(404).json({ message: 'Access not exist' });

      await log('users', req, 'findUserById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json({ ...user, role: access.role });
    } catch (error) {
      console.log(error)
      await log('users', req, 'findUserById', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Find user failed, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email }: UserInterface = req.body;

      if (!name || !email || !emailValidator(email)) return res.status(400).json({ message: 'Invalid values for new Users!' });

      // Users.findOne({ email }, { withDeleted: true });

      const findUser = await Users.findOne({ email });

      if (findUser) return res.status(400).json({ message: 'Users already exists' });

      const password = generatePassword();

      const userName = firstName(name);

      const client = process.env.CLIENT_CONNECTION;

      const token = crypto.randomBytes(20).toString('hex'); // token que será enviado via email.

      sendMail('newUser.html', 'acesso', `Bem vindo ${userName}`, { client, name, email, password });

      const passwordHash = await bcrypt.hash(password, 10);

      const now = new Date();
      now.setHours(now.getHours() + 1);
      // const passwordHash = "password";

      const user = await Users.create({
        name,
        email,
        passwordHash,
        passwordResetToken: token,
        passwordResetExpires: now,
      }).save();

      if (!user) return res.status(400).json({ message: 'Cannot create user' });

      // user.passwordHash = undefined;
      await log('users', req, 'create', 'success', JSON.stringify({ ...req.body }), user);

      return res.status(201).json(user.id);
    } catch (error) {
      console.error(error);
      await log('users', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Registration failed, try again' });
    }
  }

  public async inviteWorkspace(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const { name, email, role }: UserInterface = req.body;

      if (!id || !name || !email || !emailValidator(email)) return res.status(400).json({ message: 'Invalid values for new Users!' });

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Cannot find Workspace' });

      const findUser = await Users.findOne({ email });

      const password = generatePassword();

      const userName = firstName(name);

      const client = process.env.CLIENT_CONNECTION;

      const token = crypto.randomBytes(20).toString('hex'); // token que será enviado via email.

      const passwordHash = await bcrypt.hash(password, 10);

      const now = new Date();
      now.setHours(now.getHours() + 1);
      // const passwordHash = "password";

      if (findUser) {
        const findWorkspace = await Access.findOne({ where: { user: findUser, workspace: workspace } });

        if (findWorkspace) {
          return res.status(413).json({ message: 'Cannot find Workspace' });
        } else {
          const access = await Access.create({
            user: findUser,
            role,
            workspace,
          }).save();


      eventEmitter.emit(`accessPlayground`, findUser.id)

          await sendMail('inviteUser.html', 'acesso', `Bem vindo ${userName}`, { client, name, email, password, id });
          return res.status(201).json(findUser.id);
        }
      } else {
        const user = await Users.create({
          name,
          email,
          passwordHash,
          passwordResetToken: token,
          passwordResetExpires: now,
        }).save();

        if (!user) return res.status(400).json({ message: 'Cannot create user' });

        const access = await Access.create({
          user,
          role,
          workspace,
        }).save();

        // user.passwordHash = undefined;
        await sendMail('newUser.html', 'acesso', `Bem vindo ${userName}`, { client, name, email, password });

        await log('users', req, 'inviteWorkspace', 'success', JSON.stringify({ id: id }), user);

        eventEmitter.emit(`accessPlayground`, user.id)

        return res.status(201).json(user.id);
      }
    } catch (error) {
      console.error(error);
      await log('users', req, 'inviteWorkspace', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Registration failed, try again' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id, userId } = req.params;

      const { name, email, role, picture, notifyEnabled }: UserInterface = req.body;

      if (email && !emailValidator(email)) return res.status(400).json({ message: 'Invalid email for Users!' });

      const user = await Users.findOne(userId);

      if (!user) return res.status(404).json({ message: 'Cannot find user' });

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Cannot find user' });

      let valuesToUpdate: UserInterface;

      const shouldUpdatenotifyEnabled = user.notifyEnabled !== notifyEnabled;
      const updatednotifyEnabled = shouldUpdatenotifyEnabled ? notifyEnabled : user.notifyEnabled;

      valuesToUpdate = {
        name: name || user.name,
        email: email || user.email,
        picture: picture || user.picture,
        notifyEnabled: updatednotifyEnabled,
      };
      await Users.update(userId, { ...valuesToUpdate });

      const access = await Access.findOne({ where: { workspace, user } });

      if (!access) return res.status(404).json({ message: 'Este usuário não faz parte deste workspace' });

      await Access.update(access.id, { role: role || access!.role });

      await log('users', req, 'update', 'success', JSON.stringify({ id: id }), valuesToUpdate);

      eventEmitter.emit(`accessPlayground`, user.id)

      return res.status(200).json();
    } catch (error) {
      console.error(error);
      await log('users', req, 'update', 'failed', JSON.stringify(error), null);

      return res.status(400).json({ error: 'Update failed, try again' });
    }
  }
  public async updatePicture(req: Request, res: Response): Promise<Response> {
    try {
      const { id, userId } = req.params;


      const { picture }: UserInterface = req.body;
      const user = await Users.findOne(userId);

      if (!user) return res.status(404).json({ message: 'Cannot find user' });

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Cannot find workspace' });

      const buffer = await Buffer.from(picture!.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const fileType = await picture!.split(';')[0].split('/')[1]; // extraindo o tipo de arquivo (png, jpeg, etc.)

      const location = await s3(buffer!, workspace, 'users', user, 'image', fileType);


      if (!location) return res.status(404).json({ message: 'Cannot find workspace' });

      await Users.update(userId, { picture: location });
      await log('users', req, 'updatePicture', 'success', JSON.stringify({ id: id }), location);

      return res.status(200).json();
    } catch (error) {
      console.error(error);
      await log('users', req, 'updatePicture', 'failed', JSON.stringify(error), null);

      return res.status(400).json({ error: 'Update failed, try again' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id, userId } = req.params;

      const user = await Users.findOne(userId);

      if (!user) return res.status(404).json({ message: 'Cannot find user' });

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Cannot find workspace' });

      const access = await Access.findOne({ where: { user, workspace } });

      if (!access) return res.status(404).json({ message: 'Cannot find access' });

      await Access.softRemove(access);
      await log('users', req, 'delete', 'success', JSON.stringify({ id: id }), access);

      return res.status(200).json();
    } catch (error) {
      await log('users', req, 'delete', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Remove failed, try again' });
    }
  }

  public async passwordUpdate(req: Request, res: Response): Promise<Response> {
    try {
      const { oldPassword, newPassword } = req.body;
      const id = req.params.id;

      if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Invalid values for update password' });

      const user = await Users.findOneOrFail(id);

      if (!(await bcrypt.compare(oldPassword, user.passwordHash))) return res.status(404).json({ message: 'Invalid password' });

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await Users.update(id, { passwordHash });

      await log('users', req, 'passwordUpdate', 'success', JSON.stringify({ id: id }), user);

      return res.status(200).json();
    } catch (error) {
      await log('users', req, 'passwordUpdate', 'failed', JSON.stringify(error), null);

      return res.status(400).json({ error: 'Update password failed, ckeck values and try again' });
    }
  }
}

export default new UserController();

