import Workspace from '@entities/Workspace';
import User from '@entities/User';
import transport from '@src/modules/mailer';
import sendMail from '@src/services/sendEmail';
import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Access from '@entities/Access';
import { decrypt } from '@utils/encrypt/encrypt';
import dotenv from 'dotenv'
dotenv.config();

interface UserInterface {
  name?: string;
  role?: string;
  token?: string;
  picture?: string;
  email: string;
  password: string;
  client: string;
}

function generateToken(params = {}) {
  return jwt.sign(params, `${process.env.SECRET}`, { expiresIn: 84600 });
}

class AuthController {
  public async authenticate(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password }: UserInterface = req.body;
      if (!email || !password) return res.status(400).json({ message: 'Invalid values for User' });

      const user = await User.findOne(
        { email },
        {
          select: ['id', 'email', 'name', 'passwordResetToken', 'passwordHash', 'picture'],
        }
      );

      if (!user) return res.status(404).json({ message: 'E-mail inválido!' });

      if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(404).json({ message: 'Senha inválida!' });

      const accesses = await Access.find({ where: { user: user }, relations: ['workspace', 'workspace.tokens'] });

      const workspacesWorkspace = await Promise.all(
        accesses.map(async (access) => {
          const workspace = access.workspace;
          return {
            id: workspace.id,
            color: workspace.color,
            role: access.role,
          };
        })
      );

      const flattenedAssistants = workspacesWorkspace.flat();

      return res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        notifyEnabled: user.notifyEnabled,
        token: generateToken({ id: user.id }),
        passwordResetToken: user.passwordResetToken,
        workspaces: flattenedAssistants,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Authenticate failed, try again' });
    }
  }
  public async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      if (!email) return res.status(400).json({ message: 'Invalid values for forgot password' });

      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ message: 'No user found' });

      const token = crypto.randomBytes(20).toString('hex'); // token que será enviado via email.

      const now = new Date();
      now.setHours(now.getHours() + 1);

      await User.update(user.id, {
        passwordResetToken: token,
        passwordResetExpires: now,
      });

      const client = process.env.CLIENT_CONNECTION;

      // Envie o email e aguarde a conclusão antes de enviar a resposta
      await sendMail('forgotPassword.html', 'contato', 'Recuperação de Senha', { client, name: user.name, token, email: user.email });

      // Envie a resposta após o envio do email
      return res.status(200).json({ message: 'Password reset sent' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Forgot password failed, try again' });
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, token }: UserInterface = req.body;

      if (!email || !password || !token) return res.status(400).json({ message: 'Invalid values for User reset password' });

      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ message: 'Invalid values for User reset password' });

      if (token !== user.passwordResetToken) return res.status(400).json({ message: 'Token is invalid' });

      const now = new Date();
      if (now > user.passwordResetExpires) return res.status(400).json({ message: 'Token expired' });

      const passwordHash = await bcrypt.hash(password, 10);

      await User.update(user.id, { passwordHash, passwordResetExpires: undefined, passwordResetToken: undefined });

      return res.status(200).json();
    } catch (error) {
      return res.status(400).json({ error: 'Cannot reset password, try again' });
    }
  }
}

export default new AuthController();

