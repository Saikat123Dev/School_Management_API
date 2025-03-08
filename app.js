const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const schoolRoutes = require('./routes/school.routes');
const errorHandler = require('./middleware/errorHandler');
const validator = require('./middleware/validator');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use('/api', apiLimiter);

app.use('/api', schoolRoutes);
app.use(validator.validateSchool);
app.use(validator.validateCoordinates);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to School Management System API'
  });
});

app.use(errorHandler);

module.exports = app;
