const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const cookieParser = require('cookie-parser');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { seClinicContext } = require('./middlewares/clinicContext');
const cronStart = require('./cron');
const networkSecurityHandler = require('./middlewares/networkSecurityHandler');
const { configure, configureMessage } = require('./socket');
const http = require('http');
const path = require('path')
const webhookRoute = require('./routes/v1/webhook.route');

const app = express();

app.set('trust proxy', true);

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP
    hsts: false, // Disable HSTS
    // Add other helmet options as needed
  })
);

// Or selectively apply helmet modules
app.use(helmet.noSniff()); // Enable only the X-Content-Type-Options header

// Mount webhook BEFORE json parser
app.use('/api/v1/webhook', webhookRoute);

// parse json request body
app.use(express.json());

let server = app;
if (config.socket) {
  server = http.createServer(app);
  configure(server, app);
  configureMessage(server, app);
}

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');
  next();
});

app.use(
  cors("*")
);
// app.use(cors());
app.use(networkSecurityHandler);

// jwt authentication
app.use(cookieParser());
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/api/v1/auth', authLimiter);
}

// v1 api routes
app.use('/api/v1', seClinicContext, routes);


if (config.cron) {
  cronStart();
}

app.use('/landing-site', express.static(path.join(__dirname, '../../../build')));
app.get('/landing-site', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../build/index.html'));
});
app.get('/landing-site/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../build/index.html'));
});

app.use('/', express.static(path.join(__dirname, '../../swift-charting-portal/build')));
app.get('/', function (req, res) {
  return res.sendFile(path.join(__dirname, '../../swift-charting-portal/build/index.html'))
})
app.get('/*', function (req, res) {

  return res.sendFile(path.join(__dirname, '../../swift-charting-portal/build/index.html'))
})

app.use((req, res, next) => {
  res.removeHeader('Strict-Transport-Security');
  next();
});
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = server;
