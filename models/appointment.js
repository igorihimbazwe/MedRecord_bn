const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
            default: 'PENDING',
        },
        notes: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
