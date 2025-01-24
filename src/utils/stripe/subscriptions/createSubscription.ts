import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const createSubscription = async (customerId: string, priceId: string, paymentMethodId:string) => {
  try {
    const invoices = await stripe.subscriptions.create({
      customer: customerId,
      default_payment_method: paymentMethodId,
      items:[
        {
          price: priceId,
        }
      ],
      // trial_period_days: 7
    });

    console.log(invoices);

    return invoices;
  } catch (error) {
    console.error(error);
    return;
  }
};

