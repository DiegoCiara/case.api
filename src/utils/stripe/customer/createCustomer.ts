import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

interface CustomerStripe {
  name: string;
  email: string;
  description?: string;
}

export const createCustomer = async (data: CustomerStripe): Promise<Stripe.Customer | undefined> => {
  try {
    const params: Stripe.CustomerCreateParams = {
      ...data,
    };

    const customer: Stripe.Customer = await stripe.customers.create(params);
    return customer;
  } catch (error) {
    console.error(error)
    return
  }
};

