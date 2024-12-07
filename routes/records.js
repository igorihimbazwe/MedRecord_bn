const express = require('express');
const authenticate = require('../middleware/authenticate');
const PatientRecord = require('../models/patientRecord');
const Appointment = require('../models/appointment');
const User = require('../models/user');
const router = express.Router();

const isDoctor = (req, res, next) => {
    if (req.user.role !== 'DOCTOR') {
        return res.status(403).json({ error: 'Only doctors can record patient data.' });
    }
    next();
};

router.post('/records', authenticate, isDoctor, async (req, res) => {
    const { patientId, appointmentId, diagnosis, treatment, notes } = req.body;

    try {
        const patient = await User.findById(patientId);
        console.log(patientId)
        console.log(patient)
        const appointment = await Appointment.findById(appointmentId);
        if (!patient || patient.role !== 'PATIENT') {
            return res.status(404).json({ error: 'Patient not found.' });
        }

        if (!appointment || appointment.patient.toString() !== patientId) {
            return res.status(404).json({ error: 'Appointment not found or does not belong to this patient.' });
        }

        const record = new PatientRecord({
            patient: patientId,
            doctor: req.user.id,
            appointment: appointmentId,
            diagnosis,
            treatment,
            notes,
        });

        await record.save();

        res.status(201).json({ message: 'Patient record created successfully.', record });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/records', authenticate, async (req, res) => {
  try {
      if (req.user.role !== 'PATIENT') {
          return res.status(403).json({ error: 'Only patients can view their records.' });
      }

      const records = await PatientRecord.find({ patient: req.user.id })
          .populate('doctor', 'first_name last_name')
          .populate('appointment', 'date time')
          .sort({ createdAt: -1 });

      res.status(200).json({ records });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


module.exports = router;
