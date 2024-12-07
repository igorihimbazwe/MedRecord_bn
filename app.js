const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const recordRoutes = require('./routes/records');
const authenticate = require('./middleware/authenticate');
const cookieParser = require('cookie-parser');


dotenv.config();

connectDB();

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', authenticate, recordRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
