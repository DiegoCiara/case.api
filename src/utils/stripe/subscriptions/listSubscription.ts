import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const listSubscription = async (subsctiptionId: string) => {
  try {
    const subcription: any = await stripe.subscriptions.retrieve(subsctiptionId);

    const product = await stripe.products.retrieve(subcription?.plan?.product);

    return { ...product, plan: subcription.plan};
  } catch (error) {
    console.error(error)
    return
  }
};

