import Workspace from '@entities/Workspace';
import { decrypt } from './encrypt';

export default async function compareApiKey(apiKey: string) {
  try {
    const decryptKey = await decrypt(apiKey);

    const parseKey = JSON.parse(decryptKey);

    const workspace = await Workspace.findOne(parseKey.workspaceId);

    if (!workspace) return false;

    const currentApiKey = await decrypt(workspace.apiKey);

    const parseCurrentKey = JSON.parse(currentApiKey);

    if (parseKey.id === parseCurrentKey.id && parseKey.workspaceId === parseCurrentKey.workspaceId) {
      console.log('autorizado');
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

