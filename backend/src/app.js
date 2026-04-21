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
const companyBoxRoutes   = require('./routes/companyBox.routes');
const chatRoutes         = require('./routes/chat.routes');
const savedJobsRoutes    = require('./routes/savedJobs.routes');
const { errorHandler }   = require('./middleware/error.middleware');
const { expandAssetUrlsInJson, defaultBase } = require('./utils/publicUrl');

const app = express();

const publicOrigin = defaultBase();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', publicOrigin],
    },
  },
}));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  const send = res.json.bind(res);
  res.json = (body) => send(expandAssetUrlsInJson(body));
  next();
});
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',          authRoutes);
app.use('/api/jobs',          jobRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/profiles',      profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/company-boxes', companyBoxRoutes);
app.use('/api/chat',         chatRoutes);
app.use('/api/saved-jobs',  savedJobsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

module.exports = app;