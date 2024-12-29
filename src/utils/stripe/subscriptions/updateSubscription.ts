import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const updateSubscription = async (subscriptionId: string, priceId: string, paymentMethodId:string) => {
  try {
    // 1. Recupera os itens da assinatura
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription) {
      throw new Error('Assinatura não encontrada.');
    }

    const currentItem = subscription.items.data[0]; // Assume que há apenas um item na assinatura

    const invoices = await stripe.subscriptions.update(subscriptionId, {
      default_payment_method: paymentMethodId,
      items: [
        {
          id: currentItem.id,
          price: priceId,
        },
      ],
      proration_behavior: 'create_prorations',

    });

    console.log(invoices);

    return invoices;
  } catch (error) {
    console.error(error);
    return; 
  }
};

