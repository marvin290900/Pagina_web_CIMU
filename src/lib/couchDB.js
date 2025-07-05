import axios from 'axios';

export const couch = axios.create({
  baseURL: 'http://localhost:5984', // Cambia si usas otro host o puerto
  auth: {
    username: 'admin', // tu usuario de CouchDB
    password: 'admin', // tu contraseña
  },
  headers: {
    'Content-Type': 'application/json',
  },
});