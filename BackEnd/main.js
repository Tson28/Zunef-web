const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authenticator = require('./src/routes/auth.routes');
const accountRouter = require('./src/routes/account.routes');
const userRouter = require('./src/routes/user.routes');
const categoryRouter = require('./src/routes/category.routes');
const sourceCodeRouter = require('./src/routes/sourceCode.routes');
const paymentRouter = require('./src/routes/payment.routes');
const downloadRouter = require('./src/routes/download.routes');
const accountInfoRouter = require('./src/routes/account-info.routes');
const adminAccountRouter = require('./src/routes/admin-account.routes');
const adminAccountInfoRouter = require('./src/routes/admin-account-info.routes');
const orderRouter = require('./src/routes/order.routes');
const { swaggerUi, specs } = require('./src/config/swagger');

const connectDB = require('./src/config/database');
const path = require('path');
dotenv.config();
connectDB();
const PORT = process.env.PORT;
const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://192.168.1.166:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
// Explicitly handle preflight requests for all routes
app.options('*', cors(corsOptions));

app.use('/public',express.static(path.join(__dirname,'public')));

// Body parser configuration with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ZuneF API Documentation'
}));

app.use('/api/auth',authenticator);
app.use('/api/account',accountRouter);
app.use('/api/user',userRouter);
app.use('/api/category',categoryRouter);
app.use('/api/sourcecode',sourceCodeRouter);
app.use('/api/payment',paymentRouter);
app.use('/api/download',downloadRouter);
app.use('/api/account-info',accountInfoRouter);
app.use('/api/admin/accounts',adminAccountRouter);
app.use('/api/admin/account-info',adminAccountInfoRouter);
app.use('/api/orders',orderRouter);
app.use('/api/files', require('./src/routes/file.routes'));

// Default route to redirect to API documentation
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
  console.log(`API Documentation available at: http://localhost:${PORT}/api-docs`);
});