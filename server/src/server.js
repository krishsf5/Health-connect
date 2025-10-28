require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const initSocket = require('./socket');

const authRoutes = require('./routes/authRoutes');
const apptRoutes = require('./routes/appointmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const patientNoteRoutes = require('./routes/patientNoteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
// Increase body size limit for file uploads (base64 encoded files can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const corsOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin }));

// HTTP + Socket.IO
const server = http.createServer(app);
const io = initSocket(server, corsOrigin);

// expose io to routes
app.use((req, _res, next) => { req.io = io; next(); });

app.get('/', (_req, res) => res.send('API OK'));

app.use('/api/auth', authRoutes);
app.use('/api/appointments', apptRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/patient-notes', patientNoteRoutes);
app.use('/api/notifications', notificationRoutes);

// DB + start
const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI).then(() => {
  server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
});
