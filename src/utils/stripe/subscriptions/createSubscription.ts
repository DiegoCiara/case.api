import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

interface CustomerStripe {
  name: string;
  email: string;
  description?: string;
}

export const createSubscription = async (customerId: string, priceId: string) => {
  try {
    // const params: Stripe.Invoi = {
    //   ...data,
    // };

    const invoices = await stripe.subscriptions.create({
      customer: customerId,

      add_invoice_items: [
        {
          price: priceId,
        },
      ],
    });

    console.log(invoices);

    return invoices;
  } catch (error) {
    console.error(error);
    return;
  }
};

