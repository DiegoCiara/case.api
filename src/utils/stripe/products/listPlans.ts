import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const listPlans = async () => {
  try {
    const products: any = await stripe.products.list();

    const plans: any = await Promise.all(
      products.data.map(async (e: any) => {
        const price = await stripe.prices.retrieve(e?.default_price);
        return {
          ...e,
          price
        }
      })
    );


    return plans;
  } catch (error) {
    console.error(error);
    return;
  }
};

