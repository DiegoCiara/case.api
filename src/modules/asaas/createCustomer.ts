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
const createCustomer = async (data: any) => {
    try {
        const response = await axios.post(`${ASAAS_API}/customers`, data, {
            headers: { 'access_token': ASAAS_API_KEY }
        });
        return response.data.id;
    } catch (error) {
        console.error(`Erro no cliente`, error)
    }
};

export default createCustomer;