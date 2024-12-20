import User from '@entities/User';
import CreditCard from '@entities/CreditCard';
import axios from 'axios';
import Softspacer from '@entities/Softspacer';
import Plan from '@entities/Plan';
require('dotenv').config();

const devEnviroment = process.env.ENVIROMENT === 'DEV';

// const api = devEnviroment ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/';
const api = 'https://sandbox.asaas.com/api/v3';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

export async function createAsaasClient(name: string, cpfCnpj: string, phone: string, email: string, company: string, cep: string) {
  // https://docs.asaas.com/reference/criar-novo-cliente

  try {
    // const customer = await Softspacer.findOne(customerId);

    // if (customer?.asaasCustomerId) return { id: customer?.asaasCustomerId };

    const response = await axios.post(
      `${api}/customers`,
      {
        name: name,
        cpfCnpj: cpfCnpj,
        // externalReference: customerId,
        mobilePhone: phone,
        notificationDisabled: true,
        email: email,
        company: company,
        postalCode: cep,
      },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: ASAAS_API_KEY,
        },
      }
    );

    // const customerWithAsaas = await Softspacer.update(customerId, { asaasCustomerId: response.data.id });

    // if (!customerWithAsaas) return { message: 'Não foi possível criar asaasCustomerId' };
    console.log(response.data)
    return response?.data;
  } catch (error: any) {
    console.error(error?.response.data);
  }
}



export async function updateAsaasClient(id: string, name: string, cpfCnpj: string, phone: string) {
  // https://docs.asaas.com/reference/criar-novo-cliente

  try {
    // const customer = await Softspacer.findOne(customerId);

    if (!id) return null;

    const response = await axios.put(
      `${api}/customers/${id}`,
      {
        name: name,
        cpfCnpj: cpfCnpj,
        // externalReference: customerId,
        mobilePhone: phone,
        notificationDisabled: true,
      },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: ASAAS_API_KEY,
        },
      }
    );

    // const customerWithAsaas = await Softspacer.update(customerId, { asaasCustomerId: response.data.id });

    // if (!customerWithAsaas) return { message: 'Não foi possível criar asaasCustomerId' };
    console.log(response.data)
    return response?.data;
  } catch (error: any) {
    console.error(error?.response.data);
  }
}

export async function updateAsaasSoftspaceId(id: string, softspacerId: string) {
  // https://docs.asaas.com/reference/criar-novo-cliente

  try {
    // const customer = await Softspacer.findOne(customerId);

    if (!id) return null;

    const response = await axios.put(
      `${api}/customers/${id}`,
      {
        externalReference: `softspacerId:${softspacerId}`,
      },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: ASAAS_API_KEY,
        },
      }
    );

    // const customerWithAsaas = await Softspacer.update(customerId, { asaasCustomerId: response.data.id });

    // if (!customerWithAsaas) return { message: 'Não foi possível criar asaasCustomerId' };
    console.log(`Softspace Id Updated in Asaas ${response.data}`)
    return response?.data;
  } catch (error: any) {
    console.error(error?.response.data);
  }
}

export async function createAsaasSubscription(asaasCustomerId: string, body: object, workspaceId: string) {
  // https://docs.asaas.com/reference/criar-assinatura-com-cartao-de-credito\
  const { softspacer, creditCard, billingType, plan }: any = body;

  const { holderName, cpfCnpj, phone, postalCode, addressNumber, address, number, expiryMonth, expiryYear, ccv, ip } = creditCard;

  const date = new Date().toISOString().split('T')[0]; // Obtém a data no formato AAAA-MM-DD



  try {
    // const clientAsaas = await createAsaasClient(holderName, cpfCnpj, phone);

    // const payload = ;
    let response = null

    if(billingType === 'CREDIT_CARD'){
      response = await axios.post(
        `${api}/subscriptions`,
        {
          customer: asaasCustomerId, //cus_283923929
          billingType: billingType,
          value: plan.value,
          nextDueDate: date,
          cycle: 'MONTHLY',
          externalReference: `workspaceId:${workspaceId}`,
          description: `${plan.name}: ${plan.description}`,
          // callback: {successUrl: 'https://app.softspace.com.br/login'},
          remoteIp: ip,
          creditCard: {
            holderName: holderName,
            number: number,
            expiryMonth: expiryMonth,
            expiryYear: expiryYear,
            ccv: ccv,
          },
          creditCardHolderInfo: {
            name: holderName,
            email: softspacer.responsibleEmail,
            cpfCnpj: cpfCnpj,
            postalCode: postalCode,
            address: address,
            addressNumber: addressNumber,
            phone: phone,
          },
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            access_token: ASAAS_API_KEY,
          },
        }
      );
    } else {
      response = await axios.post(
        `${api}/subscriptions`,
        {
          customer: asaasCustomerId, //cus_283923929
          billingType: 'PIX',
          value: plan.value,
          nextDueDate: date,
          cycle: 'MONTHLY',
          externalReference: `workspaceId:${workspaceId}`,
          description: `${plan.name}: ${plan.description}`,
          // callback: {successUrl: 'https://app.softspace.com.br/login'},
          remoteIp: ip,
          creditCard: {
            holderName: holderName,
            number: number,
            expiryMonth: expiryMonth,
            expiryYear: expiryYear,
            ccv: ccv,
          },
          creditCardHolderInfo: {
            name: holderName,
            email: softspacer.responsibleEmail,
            cpfCnpj: cpfCnpj,
            postalCode: postalCode,
            address: address,
            addressNumber: addressNumber,
            phone: phone,
          },
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            access_token: ASAAS_API_KEY,
          },
        }
      );
    }


    const { creditCardNumber, creditCardBrand, creditCardToken } = response?.data.creditCard;

    const creditCardCreated = await CreditCard.create({ creditCardNumber, creditCardBrand, creditCardToken, softspacer }).save();

    const signature = {
      // asaasCustomerId: clientAsaas.id,
      subscriptionId: response?.data.id,
      creditCard: response?.data.creditCard,
      creditCardCreated,
    };
    return signature;
  } catch (error: any) {
    console.error(error);
  }
}

export async function createAsaasSubscriptionPix(asaasCustomerId: string, plan: Plan) {
  // https://docs.asaas.com/reference/criar-assinatura-com-cartao-de-credito\

  const date = new Date().toISOString().split('T')[0]; // Obtém a data no formato AAAA-MM-DD
  try {
      const response = await axios.post(
        `${api}/subscriptions`,
        {
          customer: asaasCustomerId, //cus_283923929
          billingType: 'PIX',
          value: plan.value,
          nextDueDate: date,
          cycle: 'MONTHLY',
          description: `${plan.name}: ${plan.description}`,
          // callback: {successUrl: 'https://app.softspace.com.br/login'},
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            access_token: ASAAS_API_KEY,
          },
        }
      );



    const signature = {
      // asaasCustomerId: clientAsaas.id,
      subscriptionId: response?.data.id,
    };
    return signature;
  } catch (error: any) {
    console.error(error);
  }
}


export async function updateAsaasSubscriptionId(id: string, workspaceId: string) {
  // https://docs.asaas.com/reference/criar-novo-cliente

  try {
    // const customer = await Softspacer.findOne(customerId);

    if (!id) return null;

    const response = await axios.put(
      `${api}/subscriptions/${id}`,
      {
        externalReference: `workspaceId:${workspaceId}`,
      },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: ASAAS_API_KEY,
        },
      }
    );

    // const customerWithAsaas = await Softspacer.update(customerId, { asaasCustomerId: response.data.id });

    // if (!customerWithAsaas) return { message: 'Não foi possível criar asaasCustomerId' };
    console.log(`Softspace Id Updated in Asaas ${response.data}`)
    return response?.data;
  } catch (error: any) {
    console.error(error?.response.data);
  }
}