import axios from 'axios';
//import dotenv from 'dotenv';

const URL = process.env.COUCHDB_URL || import.meta.env.COUCHDB_URL;
const USER = process.env.COUCHDB_USER || import.meta.env.COUCHDB_USER;
const PASS = process.env.COUCHDB_PASSWORD || import.meta.env.COUCHDB_PASSWORD;


export const couch = axios.create({
  baseURL: URL,
  auth: {
    username: USER,
    password: PASS,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});
