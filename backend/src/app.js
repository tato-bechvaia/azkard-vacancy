const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');

const authRoutes         = require('./routes/auth.routes');
const jobRoutes          = require('./routes/job.routes');
const applicationRoutes  = require('./routes/application.routes');
const profileRoutes      = require('./routes/profile.routes');
const notificationRoutes = require('./routes/notification.routes');
const { errorHandler }   = require('./middleware/error.middleware');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'http://localhost:5000'],
    },
  },
}));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',          authRoutes);
app.use('/api/jobs',          jobRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/profiles',      profileRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

module.exports = app;