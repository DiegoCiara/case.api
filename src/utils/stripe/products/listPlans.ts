import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const listPlans = async () => {
  try {
    const products = await stripe.products.list();
    return products;
  } catch (error) {
    console.error(error);
    return;
  }
};

