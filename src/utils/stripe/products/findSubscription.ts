import Stripe from 'stripe';
import dotenv from 'dotenv';
import { findPlan } from './findPlan';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const findSubscription = async (id: string) => {
  try {
    const subscription: any = await stripe.subscriptions.retrieve(id);

    const { plan } = subscription;

    const product = await findPlan(plan.product)

    return product
  } catch (error) {
    console.error(error);
    return;
  }
};

