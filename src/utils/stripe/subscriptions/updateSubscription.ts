import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const updateSubscription = async (
  subscriptionId: string,
  priceId: string,
  paymentMethodId: string
) => {
  try {
    // 1. Recupera a assinatura atual
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription) {
      throw new Error('Assinatura não encontrada.');
    }

    const currentItem = subscription.items.data[0]; // Assume que há apenas um item na assinatura

    // 2. Atualiza a assinatura com o novo preço e comportamento de rateio
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      default_payment_method: paymentMethodId,
      items: [
        {
          id: currentItem.id,
          price: priceId,
        },
      ],
      proration_behavior: "always_invoice", // Gera uma fatura para os ajustes proporcionais
    });

    console.log(updatedSubscription)
    return updatedSubscription;
  } catch (error) {
    console.error('Erro ao atualizar a assinatura:', error);
    throw error;
  }
};