import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

interface CustomerStripe {
  name: string;
  email: string;
  description?: string;
}

export const listPaymentMethods = async (customerId: string) => {
  try {
    
    const invoices = await stripe.paymentMethods.list({ customer: customerId});

    console.log(invoices);

    return invoices;
  } catch (error) {
    console.error(error)
    return
  }
};

