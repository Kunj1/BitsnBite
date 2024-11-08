const dotenv =require ('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  saltRounds: parseInt(process.env.SALT_ROUNDS) || 10,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    fromEmail: process.env.MAILGUN_FROM_EMAIL || 'noreply@yourapp.com'
  },
  // Add other configuration variables as needed
  database: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery'
  }
};