import User from '@entities/User';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { generateToken } from '@utils/functions/generateToken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import emailValidator from '@utils/functions/emailValidator';
import jwt from 'jsonwebtoken';

dotenv.config();

interface UserInterface {
  name: string;
  email: string;
  token: string;
  password: string;
  secret?: string;
  tempToken?: string
}
/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Operações relativas à autenticação
 */

class AuthController {
  /**
   * @swagger
   * /auth/:
   *   post:
   *     summary: Autentica um usuário
   *     tags: [Autenticação]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Autenticação bem-sucedida
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 email:
   *                   type: string
   *                 name:
   *                   type: string
   *                 has_configured:
   *                   type: boolean
   *       400:
   *         description: Valores inválidos para o usuário
   *       404:
   *         description: Usuário não encontrado
   *       401:
   *         description: Senha inválida
   *       500:
   *         description: Erro interno na autenticação
   */
  public async authenticate(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: UserInterface = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Valores inválidos para o usuário.' });
        return;
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }

      if (!(await bcrypt.compare(password, user.password_hash))) {
        res.status(401).json({ message: 'Senha inválida.' });
        return;
      }

      const jwtSecret = process.env.SECRET;
      // Gerar um token de autenticação  temporário que expira em 5 minutos
      const tempToken = jwt.sign({ email: user.email }, jwtSecret!, {
        expiresIn: '5m',
      });

      await User.update(user.id, { token_auth_secret: tempToken, has_configured_2fa: true });

      res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        has_configured_2fa: user.has_configured_2fa,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno na autenticação.' });
    }
  }

  /**
   * @swagger
   * /auth/2fa/{email}:
   *   get:
   *     summary: Gera o QR Code para configuração de autenticação de dois fatores
   *     tags: [Autenticação]
   *     parameters:
   *       - in: path
   *         name: email
   *         required: true
   *         description: Email do usuário
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: QR Code gerado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: string
   *       404:
   *         description: Usuário não encontrado
   *       500:
   *         description: Erro ao gerar o QR Code
   */
  public async get2FaQrCode(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        res.status(404).json({
          message: 'Usuário não encontrado.',
        });
        return;
      }

      if (!user.token_auth_secret) {
        res.status(404).json({
          message: 'Token de autenticação de 2 fatores não encontrado, faça o login e tente novamente.',
        });
        return;
      }
      const jwtSecret = process.env.SECRET;
      // Verificar o token temporário
      try {
        jwt.verify(user.token_auth_secret, jwtSecret!);
      } catch (err) {
        res.status(401).json({ message: 'Token de autenticação de 2 fatores expirado ou inválido, faça o login novamente.' });
        return;
      }

      const secret = speakeasy.otpauthURL({
        secret: user.secret,
        label: `IR Simulator: ${user.email}`,
        encoding: 'base32',
      });

      const data = await qrcode.toDataURL(secret!);

      res.status(200).json({ qr_code: data, message: 'Este QR code expira em 5 minutos' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao gerar o QR Code.' });
    }
  }
  /**
   * @swagger
   * /auth/2fa/verify:
   *   post:
   *     summary: Verifica o token da autenticação de dois fatores e retorna o token da sessão (Aqui obtém o token de autenticação da sessão)
   *     tags: [Autenticação]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               secret:
   *                 type: string
   *     responses:
   *       200:
   *         description: Verificação bem-sucedida
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                 token:
   *                   type: string
   *       400:
   *         description: Valores inválidos para verificação
   *       404:
   *         description: Usuário não encontrado
   *       401:
   *         description: Falha na verificação, tente novamente
   *       500:
   *         description: Erro interno na verificação
   */

  public async verifySecret(req: Request, res: Response): Promise<void> {
    try {
      const { email, secret }: UserInterface = req.body;

      if (!email || !emailValidator(email) || !secret) {
        res
          .status(400)
          .json({ message: 'Valores inválidos para verificação.' });
        return;
      }

      const user = await User.findOne({ where: { email }, relations: ['accesses'] });

      if (!user) {
        res.status(404).json({
          message: 'Usuário não encontrado.',
        });
        return;
      }

      const jwtSecret = process.env.SECRET;
      // Verificar o token temporário
      try {
        jwt.verify(user.token_auth_secret, jwtSecret!);
      } catch (err) {
        res.status(401).json({ message: 'Token de autenticação de 2 fatores expirado ou inválido, faça o login novamente.' });
        return;
      }


      const verified = speakeasy.totp.verify({
        secret: user.secret,
        encoding: 'base32',
        token: secret,
        window: 1,
      });

      if (verified) {
        const token = generateToken({ id: user.id });
        await User.update(user.id, { has_configured_2fa: true, token_auth_secret: undefined });
        res.status(200).json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            has_configured: user.has_configured_2fa,
            workspaces_count: user.accesses.length
          },
          token: token,
        });
      } else {
        res
          .status(401)
          .json({ message: 'Código inválido, verifique o código informado.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno na verificação.' });
    }
  }
}

export default new AuthController();
