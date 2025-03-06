import Token from '@entities/Token';
import { findProductOfSubscription } from '@utils/stripe/products/findProductOfSubscription';


export async function checkTokenLimitsWorkspace(workspaceId: string, subscriptionId: string): Promise<boolean> {
  try {
    const plan = await findProductOfSubscription(subscriptionId);

    console.log(plan);

    // Obtém a data de início e fim do mês atual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(1);
    endOfMonth.setHours(0, 0, 0, 0);

    const result = await Token.createQueryBuilder('token')
      .select('SUM(token.prompt_tokens)', 'totalPromptTokens')
      .addSelect('SUM(token.completion_tokens)', 'totalCompletionTokens')
      .where('token.workspace = :workspaceId', { workspaceId })
      .andWhere('token.createdAt BETWEEN :startOfMonth AND :endOfMonth', {
        startOfMonth,
        endOfMonth,
      })
      .getRawOne();

    const totalPromptTokens = result?.totalPromptTokens || 0;
    const totalCompletionTokens = result?.totalCompletionTokens || 0;

    const planPromptTokens = Number(plan.metadata.prompt_tokens);
    const planCompletionTokens = Number(plan.metadata.completion_tokens) || 0;

    console.log('Tokens analytics. =====================================>', totalPromptTokens, totalCompletionTokens, planPromptTokens, planCompletionTokens);


    if (totalPromptTokens > planPromptTokens || totalCompletionTokens > planCompletionTokens) {
      console.log('Limite de tokens excedido.', totalPromptTokens, totalCompletionTokens, planPromptTokens, planCompletionTokens);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao verificar os limites de tokens:', error);
    throw error;
  }
}
