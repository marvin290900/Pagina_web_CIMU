import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
console.log(process.env.COUCHDB_URL)

export const couch = axios.create({
  baseURL: process.env.COUCHDB_URL, 
  auth: {
    username: process.env.COUCHDB_USER,
    password: process.env.COUCHDB_PASSWORD,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});
