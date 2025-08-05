import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const couch = axios.create({
  baseURL: 'http://68.183.19.227:5984',
  auth: {
    username: 'admin',
    password: 'paginawebcimu',
  },
  headers: {
    'Content-Type': 'application/json',
  },
});
