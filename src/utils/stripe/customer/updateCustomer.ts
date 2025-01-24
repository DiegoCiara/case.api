import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

interface CustomerStripe {
  name: string;
  email: string;
  description?: string;
}

export const updateCustomer = async (customerId:string, data: CustomerStripe): Promise<Stripe.Customer | undefined> => {
  try {

    const { name, email } = data;

    const customer: Stripe.Customer = await stripe.customers.update(customerId, { name, email });

    console.log(customer)
    
    return customer;
  } catch (error) {
    console.error(error)
    return
  }
};

