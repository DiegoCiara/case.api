import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);


export const listPaymentMethods = async (customerId: string) => {
  try {

    const methods = await stripe.paymentMethods.list({ customer: customerId});

    return methods;
  } catch (error) {
    console.error(error)
    return
  }
};

