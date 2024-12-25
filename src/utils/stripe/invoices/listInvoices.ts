import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

interface CustomerStripe {
  name: string;
  email: string;
  description?: string;
}

export const listInvoices = async (subscriptionId: string) => {
  try {
    // const params: Stripe.Invoi = {
    //   ...data,
    // };

    const invoices = await stripe.invoices.list({ subscription: subscriptionId});

    console.log(invoices);

    return invoices;
  } catch (error) {
    console.error(error)
    return
  }
};

