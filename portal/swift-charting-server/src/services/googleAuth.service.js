const { GoogleAuth } = require('google-auth-library');
const config = require('../config/config');

async function getAccessToken() {
  const { googleServiceAccount } = config;

  if (!googleServiceAccount?.client_email || !googleServiceAccount?.private_key) {
    throw new Error('Google service account credentials are not configured');
  }

  const auth = new GoogleAuth({
    credentials: googleServiceAccount,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken;
}

module.exports = { getAccessToken };
