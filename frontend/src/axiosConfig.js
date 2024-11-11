import axios from 'axios';

axios.defaults.baseURL = 
  process.env.NODE_ENV === 'production'
    ? '/'       // This will use the same origin as the deployed app
    : 'http://localhost:5000'; // for local development
