import Access from "@entities/Access";
import Sale from "@entities/Sale";
import User from "@entities/User";
import Workspace from "@entities/Workspace";
import { getRepository } from "typeorm";

export async function usersWorkspace(workspace: Workspace) {
  try {

    const access = await Access.find({ where: { workspace }, relations:['user']})

    const usersFromWorkspace = access.map((e) => {
      return `ID: ${e.user.id}\nNome: ${e.user.name}\nE-mail: ${e.user.email}\nPerfil de acesso: ${e.role}\n\n`
    })
    // Retorna o total calculado
    return `Usuários do Workspace: \n\n${usersFromWorkspace}`
  } catch (error) {
    console.error(error);
    return 'Não foi possível trazer usuários do workspace';
  }
}
