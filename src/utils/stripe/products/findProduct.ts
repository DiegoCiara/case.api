import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const findProduct = async (id: string) => {
  try {
    const product: any = await stripe.products.retrieve(id);

    const price = await stripe.prices.retrieve(product?.default_price);

    return {...product, price};
  } catch (error) {
    console.error(error);
    return;
  }
};

