const express = require('express');
const authenticate = require('../middleware/authenticate');
const Appointment = require('../models/appointment');
const User = require('../models/user');

const router = express.Router();

router.get('/doctors', async (req, res) => {
  try {
      const doctors = await User.find({ role: 'DOCTOR' }).select('id name email');

      if (doctors.length === 0) {
          return res.status(404).json({ error: 'No doctors found.' });
      }

      res.status(200).json({ doctors });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

router.post('/appointments', authenticate, async (req, res) => {
    const { doctorId, date, time, notes } = req.body;

    try {
        if (req.user.role !== 'PATIENT') {
            return res.status(403).json({ error: 'Only patients can book appointments.' });
        }

        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'DOCTOR') {
            return res.status(404).json({ error: 'Doctor not found.' });
        }

        const appointment = new Appointment({
            patient: req.user.id,
            doctor: doctorId,
            date,
            time,
            notes,
        });
        await appointment.save();

        res.status(201).json({ message: 'Appointment booked successfully.', appointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/appointments/:id/status', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
      if (req.user.role !== 'DOCTOR') {
          return res.status(403).json({ error: 'Only doctors can accept or decline appointments.' });
      }

      if (!['ACCEPTED', 'DECLINED'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status. Use ACCEPTED or DECLINED.' });
      }

      const appointment = await Appointment.findById(id).populate('patient doctor');
      if (!appointment) {
          return res.status(404).json({ error: 'Appointment not found.' });
      }

      if (appointment.doctor._id.toString() !== req.user.id) {
          return res.status(403).json({ error: 'You can only update your own appointments.' });
      }

      appointment.status = status;
      await appointment.save();

      res.status(200).json({ message: `Appointment ${status.toLowerCase()} successfully.`, appointment });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

module.exports = router;