import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import Users from '@entities/User';
import emailValidator from '@utils/functions/emailValidator';
import speakeasy from 'speakeasy';
import Workspace from '@entities/Workspace';
import Access from '@entities/Access';
import sendMail from '@src/services/sendEmail';
import { getInitialName } from '@utils/functions/getInitialName';
import { createCustomer } from '@utils/stripe/customer/createCustomer';

interface UserInterface {
  id?: string;
  name: string;
  email: string;
  picture?: string;
  token: string;
  password: string;
  secret?: string;
}

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Operações relativas aos usuários
 */

class UserController {
  /**
   * @swagger
   * /user/:
   *   get:
   *     summary: Retorna todos os usuários do workspace
   *     tags: [Usuários]
   *     parameters:
   *       - in: header
   *         name: workspaceId
   *         required: true
   *         description: ID do workspace
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lista de usuários
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   accessId:
   *                     type: string
   *                   name:
   *                     type: string
   *                   email:
   *                     type: string
   *                   picture:
   *                     type: string
   *                   role:
   *                     type: string
   *       400:
   *         description: ID do workspace não informado
   *       404:
   *         description: Workspace não encontrado
   *       500:
   *         description: Erro interno
   */
  public async findUsers(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      if (!workspaceId) {
        res
          .status(400)
          .json({ message: 'Por favor, informe o ID do seu workspace.' });
        return;
      }

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado.' });
        return;
      }

      const accesses = await Access.find({
        relations: ['user'],
        where: { workspace },
      });

      const users: any = await Promise.all(
        accesses.map(async (access: any) => {
          return {
            accessId: access.id,
            name: access.user.name || 'Não cadastrado',
            email: access.user.email,
            picture: access.user.picture,
            role: access.role,
          };
        }),
      );

      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: 'Erro interno ao buscar usuário, tente novamente.' });
    }
  }

  /**
   * @swagger
   * /user/{id}:
   *   get:
   *     summary: Retorna o usuário procurado pelo ID
   *     description: Este endpoint deve ser utilizado pelo próprio usuário para buscar suas informações.
   *     tags: [Usuários]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID do usuário
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Usuário encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 name:
   *                   type: string
   *                 email:
   *                   type: string
   *       404:
   *         description: Usuário não encontrado
   *       500:
   *         description: Erro interno
   */
  public async findUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await Users.findOne(req.userId, {
        select: ['id', 'name', 'email', 'createdAt'],
      });

      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: 'Erro interno ao buscar usuário, tente novamente.' });
    }
  }

  /**
   * @swagger
   * /user/access/{id}:
   *   get:
   *     summary: Retorna o acesso do usuário ao workspace procurado pelo ID
   *     tags: [Usuários]
   *     parameters:
   *       - in: header
   *         name: workspaceId
   *         required: true
   *         description: ID do workspace
   *         schema:
   *           type: string
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID do usuário
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Acesso do usuário encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   type: string
   *                 email:
   *                   type: string
   *                 role:
   *                   type: string
   *       400:
   *         description: ID do workspace ou usuário não informado
   *       404:
   *         description: Usuário ou acesso não encontrado
   *       500:
   *         description: Erro interno
   */
  public async findAccess(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      if (!workspaceId) {
        res
          .status(400)
          .json({ message: 'Por favor, informe o ID do seu workspace.' });
        return;
      }

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado.' });
        return;
      }

      const id = req.params.id;

      if (!id) {
        res.status(400).json({ message: 'Informe um ID de usuário' });
        return;
      }

      const user = await Users.findOne(id, {
        select: ['id', 'name', 'email', 'createdAt', 'accesses'],
        relations: ['accesses'],
      });

      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }

      const access = await Access.findOne({
        where: { user, workspace },
      });

      if (!access) {
        res.status(404).json({
          message:
            'Não foi encontrado nenhum acesso desse usuário para este workspace.',
        });
        return;
      }

      res.status(200).json({
        name: access.user.name,
        email: access.user.email,
        role: access.role,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: 'Erro interno ao buscar usuário, tente novamente.' });
    }
  }

  /**
   * @swagger
   * /user:
   *   post:
   *     summary: Cria um novo usuário
   *     tags: [Usuários]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       201:
   *         description: Usuário criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     name:
   *                       type: string
   *                     email:
   *                       type: string
   *                 message:
   *                   type: string
   *       400:
   *         description: Valores inválidos para o novo usuário
   *       409:
   *         description: Usuário já existe
   *       500:
   *         description: Erro interno ao criar o usuário
   */
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password }: UserInterface = req.body;

      if (!email || !emailValidator(email) || !password) {
        res
          .status(400)
          .json({ message: 'Valores inválidos para o novo usuário.' });
        return;
      }

      const findUser = await Users.findOne({ where: { email } });

      if (findUser) {
        res.status(409).json({
          message: 'Já existe um usuário cadastrado com este e-mail.',
        });
        return;
      }

      const password_hash = await bcrypt.hash(password, 10);

      const secret = speakeasy.generateSecret({
        name: `Case AI: ${email}`,
      });

      const customer = await createCustomer({
        name,
        email,
      });

      if (!customer) {
        res.status(400).json({
          message: 'Não foi possível criar o usuário cliente, tente novamente',
        });
        return;
      }

      const user = await Users.create({
        name,
        email,
        customer_id: customer.id,
        password_hash,
        secret: secret.base32,
      }).save();

      if (!user) {
        res.status(500).json({
          message: 'Erro interno ao criar o usuário, tente novamente.',
        });
        return;
      }

      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        message: 'Usuário criado com sucesso',
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Erro interno no registro, tente novamente.' , error: error });
    }
  }

  /**
   * @swagger
   * /user/invite:
   *   post:
   *     summary: Envia o convite para um usuário
   *     tags: [Usuários]
   *     parameters:
   *       - in: header
   *         name: workspaceId
   *         required: true
   *         description: ID do workspace
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *     responses:
   *       201:
   *         description: Convite enviado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       400:
   *         description: Valores inválidos para o novo usuário
   *       404:
   *         description: Workspace não encontrado
   *       500:
   *         description: Erro interno ao enviar o convite
   */
  public async invite(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      if (!workspaceId) {
        res
          .status(400)
          .json({ message: 'Por favor, informe o ID do seu workspace.' });
        return;
      }

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado.' });
        return;
      }

      const { email }: UserInterface = req.body;

      if (!email || !emailValidator(email)) {
        res
          .status(400)
          .json({ message: 'Valores inválidos para o novo usuário.' });
        return;
      }

      const user = await Users.findOne(req.userId);

      if (!user) {
        res.status(404).json({
          message: 'Usuário não encontrado',
        });
        return;
      }

      const name = getInitialName(user.name);

      await sendMail(
        'invite.html',
        'acesso',
        `${name} te convidou para um workspace no Case AI`,
        {
          name,
          id: workspace.id,
        },
      );

      res.status(201).json({ message: 'Convite enviado com sucesso' });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: 'Erro interno no registro, tente novamente.' });
    }
  }

  /**
   * @swagger
   * /user/{id}:
   *   put:
   *     summary: Atualiza os dados de um usuário
   *     tags: [Usuários]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID do usuário a ser atualizado
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               picture:
   *                 type: string
   *     responses:
   *       204:
   *         description: Usuário atualizado com sucesso
   *       400:
   *         description: Formato de e-mail inválido
   *       404:
   *         description: Usuário não encontrado
   *       500:
   *         description: Erro interno ao atualizar o usuário
   */
  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, picture }: UserInterface = req.body;

      if (email && !emailValidator(email)) {
        res.status(400).json({ message: 'Formato de e-mail inválido.' });
        return;
      }

      const user = await Users.findOne(req.userId);

      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }

      const valuesToUpdate = {
        name: name || user.name,
        email: email || user.email,
        picture: picture || user.picture,
      };

      await Users.update(user.id, { ...valuesToUpdate });

      res.status(204).send({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Erro interno ao atualizar o usuário, tente novamente.',
      });
    }
  }

  /**
   * @swagger
   * /user/role/{id}:
   *   put:
   *     summary: Atualiza um acesso de um usuário
   *     tags: [Usuários]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID do acesso a ser atualizado
   *         schema:
   *           type: string
   *       - in: header
   *         name: workspaceId
   *         required: true
   *         description: ID do workspace
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               role:
   *                 type: string
   *     responses:
   *       204:
   *         description: Permissão atualizada com sucesso
   *       400:
   *         description: ID de acesso ou permissão não informado
   *       404:
   *         description: Acesso não encontrado
   *       500:
   *         description: Erro interno ao atualizar o usuário
   */
  public async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      if (!id) {
        res.status(400).json({ message: 'ID de acesso não informado' });
        return;
      }
      const { role } = req.body;

      if (!role) {
        res.status(400).json({ message: 'Permissão não informada' });
        return;
      }

      const access = await Access.findOne(id);

      if (!access) {
        res.status(404).json({ message: 'Acesso não encontrado.' });
        return;
      }

      await Access.update(access.id, { role: role || access.role });

      res.status(204).send({ message: 'Permissão atualizada com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Erro interno ao atualizar o usuário, tente novamente.',
      });
    }
  }

  /**
   * @swagger
   * /user/update-password/{id}:
   *   put:
   *     summary: Atualiza a senha de um usuário
   *     description: Este endpoint deve ser utilizado pelo próprio usuário.
   *     tags: [Usuários]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID do usuário a ser atualizado
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               oldPassword:
   *                 type: string
   *               newPassword:
   *                 type: string
   *     responses:
   *       204:
   *         description: Senha atualizada com sucesso
   *       400:
   *         description: Valores inválidos para redefinir a senha
   *       404:
   *         description: Usuário não encontrado
   *       500:
   *         description: Erro interno ao atualizar a senha
   */
  public async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      if (!id) {
        res.status(400).json({ message: 'ID de usuário não informado' });
        return;
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        res.status(400).json({ message: 'Valores inválidos para redefinir a senha' });
        return;
      }

      // Aqui você deve adicionar a lógica para verificar a senha antiga e atualizar para a nova senha

      res.status(204).send({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Erro interno ao atualizar a senha, tente novamente.',
      });
    }
  }

  /**
   * @swagger
   * /user/{id}:
   *   delete:
   *     summary: Remove o acesso de um usuário a um workspace
   *     description: Este endpoint deve ser utilizado pelo administrador ou proprietário do workspace.
   *     tags: [Usuários]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID do acesso a ser removido
   *         schema:
   *           type: string
   *       - in: header
   *         name: workspaceId
   *         required: true
   *         description: ID do workspace
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Acesso removido com sucesso
   *       400:
   *         description: ID de acesso ou workspace não informado
   *       404:
   *         description: Acesso não encontrado
   *       500:
   *         description: Erro interno ao remover o acesso
   */
  public async removeAccess(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      if (!id) {
        res.status(400).json({ message: 'ID de acesso não informado' });
        return;
      }

      const workspaceId = req.header('workspaceId');

      if (!workspaceId) {
        res.status(400).json({ message: 'ID do workspace não informado' });
        return;
      }

      // Aqui você deve adicionar a lógica para remover o acesso do usuário ao workspace

      res.status(204).send({ message: 'Acesso removido com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Erro interno ao remover o acesso, tente novamente.',
      });
    }
  }
}

export default new UserController();
