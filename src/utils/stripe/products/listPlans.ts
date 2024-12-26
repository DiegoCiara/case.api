import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const listPlans = async (subsctiptionId: string) => {
  try {
    const subcription: any = await stripe.subscriptions.retrieve(subsctiptionId);

    const product = await stripe.products.list();

    return { ...product, plan: subcription.plan};
  } catch (error) {
    console.error(error)
    return
  }
};

