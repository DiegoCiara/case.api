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

    return invoices;
  } catch (error) {
    console.error(error)
    return
  }
};


export const createPaymentIntent = async (customerId: string) => {
  try {

    const intent = await stripe.setupIntents.create({ customer: customerId, payment_method_types: ['card']});

    console.log(intent);

    return intent;
  } catch (error) {
    console.error(error)
    return
  }
};

