import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

interface CustomerStripe {
  name: string;
  email: string;
  description?: string;
}

export const createPaymentMethod = async (customerId: string) => {
  try {

    const invoices = await stripe.paymentMethods.create({ customer: customerId, card: {

    }});

    console.log(invoices);

    return invoices;
  } catch (error) {
    console.error(error)
    return
  }
};


export const createPaymentIntent = async () => {
  try {

    const intent = await stripe.paymentIntents.create({ amount: 1000, currency: 'brl'});

    console.log(intent);

    return intent;
  } catch (error) {
    console.error(error)
    return
  }
};

