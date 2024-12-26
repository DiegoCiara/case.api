import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

interface CustomerStripe {
  name: string;
  email: string;
  description?: string;
}

// Função para deletar o método de pagamento
export const deleteMethod = async ( paymentMethodId: string) => {
  try {
    // Detach (remover) o método de pagamento
    const detachedMethod = await stripe.paymentMethods.detach(paymentMethodId);

    // Caso o cliente tenha o método de pagamento como o método de pagamento padrão, remova-o
    if (detachedMethod.card) {
      console.log('Método de pagamento removido com sucesso:', detachedMethod);
      return detachedMethod;
    }
  } catch (error) {
    console.error('Erro ao remover o método de pagamento:', error);
    return;
  }
};
