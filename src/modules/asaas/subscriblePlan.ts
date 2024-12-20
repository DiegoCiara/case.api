// app.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


const ASAAS_API = 'https://www.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

// Cadastrar Cliente
const createCustomer = async ( customerId: string, planId: string ) => {
    try {
      // Você deve validar os dados de entrada
      const subscriptionResponse = await axios.post(`${ASAAS_API}/subscriptions`, {
          customer: customerId,
          plan: planId,
      }, {
          headers: { 'access_token': ASAAS_API_KEY }
      });
    } catch (error) {
        console.error(`Erro no cliente`, error)
    }
};

export default createCustomer;