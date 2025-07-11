import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://couchdb.am19139.me/', // Cambia si usas otro host o puerto
  auth: {
    username: 'cimu2025', // tu usuario de CouchDB
    password: 'dbcimu%%2025', // tu contraseña
  },
  headers: {
    'Content-Type': 'application/json',
  },
});