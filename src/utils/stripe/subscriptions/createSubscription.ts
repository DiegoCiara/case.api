import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

interface CustomerStripe {
  name: string;
  email: string;
  description?: string;
}

export const createSubscription = async () => {
  try {
    // const params: Stripe.Invoi = {
    //   ...data,
    // };

    const invoices = await stripe.subscriptions.create({
      customer: '',
    });

    console.log(invoices);

    return invoices;
  } catch (error) {
    console.error(error)
    return
  }
};

