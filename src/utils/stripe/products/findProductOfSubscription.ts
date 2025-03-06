import Stripe from 'stripe';
import dotenv from 'dotenv';
import { findProduct } from './findProduct';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const findProductOfSubscription = async (id: string) => {
  try {
    const subscription: any = await stripe.subscriptions.retrieve(id);

    const { plan } = subscription;

    const product = await findProduct(plan.product)

    console.log(product)
    return product
  } catch (error) {
    console.error(error);
    return;
  }
};

