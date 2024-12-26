import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

interface CustomerStripe {
  name: string;
  email: string;
  description?: string;
}

export const setPaymentMethodAsDefault = async (customerId: string, paymentMethodId: string) => {

  console.log(customerId, paymentMethodId)
  try {
    const method = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return method;
  } catch (error) {
    console.error(error)
    return
  }
};


export const createPaymentIntent = async (customerId: string) => {
  try {

    const intent = await stripe.setupIntents.create({ customer: customerId, payment_method_types: ['card']});

    return intent;
  } catch (error) {
    console.error(error)
    return
  }
};

