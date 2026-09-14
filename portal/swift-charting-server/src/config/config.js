const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');
const { defaultOrganizationLogo } = require('./upload');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    JWT_GENERATE_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which generate password token expires'),
    MAIL_SERVER: Joi.string()
      .uppercase()
      .valid('SMTP', 'SENDGRID')
      .default('SENDGRID')
      .description('mail provider to use for outgoing emails'),
    SMTP_HOST: Joi.when('MAIL_SERVER', {
      is: 'SMTP',
      then: Joi.string().trim().required(),
      otherwise: Joi.string().trim().allow('').optional(),
    }).description('server that will send the emails'),
    SMTP_PORT: Joi.when('MAIL_SERVER', {
      is: 'SMTP',
      then: Joi.number().required(),
      otherwise: Joi.number().empty('').optional(),
    }).description('port to connect to the email server'),
    SMTP_USERNAME: Joi.when('MAIL_SERVER', {
      is: 'SMTP',
      then: Joi.string().trim().required(),
      otherwise: Joi.string().trim().allow('').optional(),
    }).description('username for email server'),
    SMTP_PASSWORD: Joi.when('MAIL_SERVER', {
      is: 'SMTP',
      then: Joi.string().trim().required(),
      otherwise: Joi.string().trim().allow('').optional(),
    }).description('password for email server'),
    SENDGRID_API_KEY: Joi.when('MAIL_SERVER', {
      is: 'SENDGRID',
      then: Joi.string().trim().required(),
      otherwise: Joi.string().trim().allow('').optional(),
    }).description('SendGrid API key'),
    SENDGRID_HOST: Joi.string().trim().allow('').optional().description('SendGrid SMTP relay host'),
    SENDGRID_PORT: Joi.number().empty('').optional().description('SendGrid SMTP relay port'),
    SENDGRID_EMAIL: Joi.string().trim().allow('').optional().description('verified sender email for SendGrid'),
    SENDGRID_NAME: Joi.string().trim().allow('').optional().description('verified sender name for SendGrid'),
    EMAIL_FROM: Joi.string().trim().allow('').optional().description('the from field in the emails sent by the app'),
    SEQUELIZE_USER: Joi.string().description('sequlize username '),
    SEQUELIZE_PASSWORD: Joi.string().description('sequlize password '),
    SEQUELIZE_DATABASE: Joi.string().description('sequlize database '),
    SEQUELIZE_HOST: Joi.string().description('sequlize host '),
    SEQUELIZE_DIALECT: Joi.string().description('sequlize dailect '),
    SEQUELIZE_PORT: Joi.string().description('sequlize port '),
    CRON: Joi.string().description('Run server as Cron'),
    SERVER_URL: Joi.string().description('Server End Point'),
    SECRET_KEY: Joi.string().description('Encryption key for url'),
    SOCKET_URL: Joi.string().description('Socket Server End Point'),
    ZOOM_SDK_KEY:Joi.string().description('Zoom SDK Key'),
    ZOOM_SDK_SECRET:Joi.string().description('Zoom SDK Secret'),
    GOOGLE_MEET_CLIENT_ID: Joi.string().allow('').optional(),
    GOOGLE_MEET_CLIENT_SECRET: Joi.string().allow('').optional(),
    GOOGLE_SERVICE_ACCOUNT_PROJECT_ID: Joi.string().allow('').optional(),
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID: Joi.string().allow('').optional(),
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: Joi.string().allow('').optional(),
    GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL: Joi.string().allow('').optional(),
    GOOGLE_SERVICE_ACCOUNT_CLIENT_ID: Joi.string().allow('').optional(),

    IS_STRIPE_LIVE: Joi.boolean()
      .truthy('true')
      .falsy('false')
      .default(false)
      .description('Live Stripe'),

    STRIPE_WEBHOOK_SECRET: Joi.string().required().description('Live Stripe Webhook Key'),
    SUBSCRIPTION_BASE_PRICE_ID: Joi.string().required().description('Live Subscription Base Price ID'),
    SUBSCRIPTION_PER_PRACTITIONER_PRICE_ID: Joi.string().required().description('Live Subscription Per Practitioner Price ID'),
    SUBSCRIPTION_PER_CLINIC_STAFF: Joi.string().required().description('Live Subscription Per Clinic Staff Price ID'),
    SUBSCRIPTION_PER_PRESCRIBER: Joi.string().required().description('Live Subscription Per Prescriber Price ID'),
    STRIPE_SECRET_KEY: Joi.string().required().description('Live Stripe Secret key'),

    DEVELOPMENT_STRIPE_WEBHOOK_SECRET: Joi.string().required().description('Stripe Webhook Key'),
    DEVELOPMENT_SUBSCRIPTION_BASE_PRICE_ID: Joi.string().required().description('Subscription Base Price ID'),
    DEVELOPMENT_SUBSCRIPTION_PER_PRACTITIONER_PRICE_ID: Joi.string().required().description('Subscription Per Practitioner Price ID'),
    DEVELOPMENT_SUBSCRIPTION_PER_CLINIC_STAFF: Joi.string().required().description('Subscription Per Clinic Staff Price ID'),
    DEVELOPMENT_SUBSCRIPTION_PER_PRESCRIBER: Joi.string().required().description('Subscription Per Prescriber Price ID'),
    DEVELOPMENT_STRIPE_SECRET_KEY: Joi.string().required().description('Stripe Secret key'),

  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const mailServer = envVars.MAIL_SERVER;

module.exports = {
  env: 'development',
  port: envVars.PORT,
  clientURL: envVars.CLIENT_URL,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  sequelize: {
    username: envVars.SEQUELIZE_USER,
    password: envVars.SEQUELIZE_PASSWORD,
    database: envVars.SEQUELIZE_DATABASE,
    host: envVars.SEQUELIZE_HOST,
    dialect: envVars.SEQUELIZE_DIALECT,
    port: envVars.SEQUELIZE_PORT,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    generatePasswordExpirationMinutes: envVars.JWT_GENERATE_PASSWORD_EXPIRATION_MINUTES,
  },
  email: {
    mailServer,
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
      from: envVars.EMAIL_FROM,
    },
    sendgrid: {
      apiKey: envVars.SENDGRID_API_KEY || envVars.APP_SENDGRID_KEY,
      host: envVars.SENDGRID_HOST,
      port: envVars.SENDGRID_PORT,
      from: envVars.SENDGRID_EMAIL || envVars.EMAIL_FROM,
      fromName: envVars.SENDGRID_NAME,
    },
    from: mailServer === 'SMTP' ? envVars.EMAIL_FROM : envVars.SENDGRID_EMAIL || envVars.EMAIL_FROM,
    fromName: mailServer === 'SENDGRID' ? envVars.SENDGRID_NAME : undefined,
    sendgridKey: envVars.SENDGRID_API_KEY || envVars.APP_SENDGRID_KEY,
    applicationDeveloper: ['piyushdhodiyal@gmail.com'],
  },
  staticPath: envVars.STATIC_PATH || 'localFiles',
  whitelistedURL: envVars.WHITELISTED_URL ? envVars.WHITELISTED_URL.split(',') : [envVars.CLIENT_URL],
  cron:envVars.CRON,
  clientLogo: defaultOrganizationLogo ||  envVars.CLIENT_LOGO,
  serverURL: envVars.SERVER_URL,
  srFaxConfig: {
    srFaxUrl: envVars.SRFAX_BASE_URL,
    accessId: envVars.SRFAX_ACCESS_ID,
    accessPwd: envVars.SRFAX_PASSWORD,
    srFaxSenderEmail: envVars.SRFAX_SENDER_EMAIL,
    srFaxSenderMobile: envVars.SRFAX_SENDER_NUMBER,
  },
  secretKey:envVars.SECRET_KEY,
  decryption: {
    request: {
      key: envVars.P_12?.replace(/\\n/g, '\n'),
    },
  },
  encryption: {
    response: {
      key: envVars.P_21?.replace(/\\n/g, '\n'),
    },
  },
  socketURL:envVars.SOCKET_URL || "http://ec2-54-241-211-218.us-west-1.compute.amazonaws.com:5002",
  notificationConfig: {
    client_url: envVars.CLIENT_URL,
    leagecy_server_key: envVars.NOTIFICATION_LEAGECY_SERVER_KEY,
  },
  socket:envVars.SOCKET,
  zoom:{
    sdkKey:envVars.ZOOM_SDK_KEY,
    sdkSecret:envVars.ZOOM_SDK_SECRET,
  },
  googleMeet: {
    clientId: envVars.GOOGLE_MEET_CLIENT_ID,
    clientSecret: envVars.GOOGLE_MEET_CLIENT_SECRET,
  },
  googleServiceAccount: {
    type: 'service_account',
    project_id: envVars.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
    private_key_id: envVars.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    private_key: envVars.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: envVars.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    client_id: envVars.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
    token_uri: 'https://oauth2.googleapis.com/token',
  },
  stripe: {
    webhookKey: envVars.IS_STRIPE_LIVE
      ? envVars.STRIPE_WEBHOOK_SECRET
                : envVars.DEVELOPMENT_STRIPE_WEBHOOK_SECRET ,
    basePriceId: envVars.IS_STRIPE_LIVE
      ? envVars.SUBSCRIPTION_BASE_PRICE_ID
                : envVars.DEVELOPMENT_SUBSCRIPTION_BASE_PRICE_ID ,
    perPractitionerPriceId: envVars.IS_STRIPE_LIVE
      ? envVars.SUBSCRIPTION_PER_PRACTITIONER_PRICE_ID
      : envVars.DEVELOPMENT_SUBSCRIPTION_PER_PRACTITIONER_PRICE_ID,
    perClinicStaffPriceId:envVars.IS_STRIPE_LIVE 
      ? envVars.SUBSCRIPTION_PER_CLINIC_STAFF
      : envVars.DEVELOPMENT_SUBSCRIPTION_PER_CLINIC_STAFF,
    perPrescriberPriceId:envVars.IS_STRIPE_LIVE 
      ? envVars.SUBSCRIPTION_PER_PRESCRIBER
      : envVars.DEVELOPMENT_SUBSCRIPTION_PER_PRESCRIBER,
    stripeSecretKey:envVars.IS_STRIPE_LIVE 
      ? envVars.STRIPE_SECRET_KEY
      : envVars.DEVELOPMENT_STRIPE_SECRET_KEY,
  }
};
