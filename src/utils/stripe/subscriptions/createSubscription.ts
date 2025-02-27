import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const createSubscription = async (customerId: string, priceId: string, paymentMethodId:string) => {
  try {

    const price = await stripe.prices.retrieve(priceId)

    const product = await stripe.products.retrieve(price.product as string)

    const invoices = await stripe.subscriptions.create({
      customer: customerId,
      default_payment_method: paymentMethodId,
      items:[
        {
          price: priceId,
        }
      ],
      metadata: product.metadata
      // trial_period_days: 7
    });

    // console.log(invoices);

    return invoices;
  } catch (error) {
    console.error(error);
    return;
  }
};

