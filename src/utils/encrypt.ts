import CryptoJS from 'crypto-js';
import dotenv from 'dotenv'
dotenv.config();

const pass = process.env.DB_PASSWORD

export async function encrypt(apiKey: string) {
    try {
        const encrypted = await CryptoJS.AES.encrypt(apiKey, pass as string).toString();
        return encrypted;

    } catch (error) {
        console.log(error)
    }
}

export async function decrypt(encrypted: string) {
  const bytes = await CryptoJS.AES.decrypt(encrypted, pass);
  const decryptedString = await bytes.toString(CryptoJS.enc.Utf8);
  return decryptedString;
}