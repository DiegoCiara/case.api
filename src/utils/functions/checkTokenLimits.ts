import Token from "@entities/Token";
import { findSubscription } from "@utils/stripe/products/findSubscription";

export async function checkTokenLimitsThread(workspaceId: string, threadId: string, subscriptionId: string): Promise<boolean> {
  try {

    const plan = await findSubscription(subscriptionId);

    console.log(plan);

    // Realiza uma query agregada para somar os tokens
    const result = await Token.createQueryBuilder("token")
      .select("SUM(token.prompt_tokens)", "totalPromptTokens")
      .addSelect("SUM(token.completion_tokens)", "totalCompletionTokens")
      .where("token.workspaceId = :workspaceId", { workspaceId })
      .andWhere("token.threadId = :threadId", { threadId })
      .getRawOne();

    // Extrai os valores da query
    const totalPromptTokens = result?.totalPromptTokens || 0;
    const totalCompletionTokens = result?.totalCompletionTokens || 0;

    // Verifica os limites
    // Verifica os limites
    if (totalPromptTokens > plan.metadata.prompt_tokens || totalCompletionTokens > plan.metadata.completion_tokens) {
      console.log('Limite de tokens excedido.');
      return false; // Retorna false se os limites forem excedidos
    }


    return true; // Retorna true se os limites estiverem dentro do permitido
  } catch (error) {
    console.error('Erro ao verificar os limites de tokens:', error);
    throw error; // Lança o erro para ser tratado no chamador
  }
}


export async function checkTokenLimitsWorkspace(workspaceId: string, subscriptionId: string): Promise<boolean> {
  try {

    const plan = await findSubscription(subscriptionId);

    console.log(plan);

    // Realiza uma query agregada para somar os tokens
    const result = await Token.createQueryBuilder("token")
      .select("SUM(token.prompt_tokens)", "totalPromptTokens")
      .addSelect("SUM(token.completion_tokens)", "totalCompletionTokens")
      .where("token.workspaceId = :workspaceId", { workspaceId })
      .getRawOne();

    // Extrai os valores da query
    const totalPromptTokens = result?.totalPromptTokens || 0;
    const totalCompletionTokens = result?.totalCompletionTokens || 0;

    // Verifica os limites
    if (totalPromptTokens > plan.metadata.prompt_tokens || totalCompletionTokens > plan.metadata.completion_tokens) {
      console.log('Limite de tokens excedido.');
      return false; // Retorna false se os limites forem excedidos
    }

    return true; // Retorna true se os limites estiverem dentro do permitido
  } catch (error) {
    console.error('Erro ao verificar os limites de tokens:', error);
    throw error; // Lança o erro para ser tratado no chamador
  }
}
