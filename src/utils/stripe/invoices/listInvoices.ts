import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const listInvoices = async (subscriptionId: string) => {
  try {
    const invoices = await stripe.invoices.list({ subscription: subscriptionId});

    return invoices;
  } catch (error) {
    console.error(error)
    return
  }
};

