const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const authRoutes        = require('./routes/auth.routes');
const jobRoutes         = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const { errorHandler }  = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth',         authRoutes);
app.use('/api/jobs',         jobRoutes);
app.use('/api/applications', applicationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

module.exports = app;