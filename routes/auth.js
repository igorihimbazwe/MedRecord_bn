const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.use(cookieParser());

router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        const user = new User({ name, email, password, role });
        await user.save();

        res.status(201).json({
            message: 'User successfully created.',
            user: { id: user._id, name, email, role },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: '2h',
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 60 * 60 * 1000,
            sameSite: 'Strict',
        });

        res.status(200).json({
            message: 'Login successful.',
            user: { id: user._id, name: user.name, email, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully.' });
});

module.exports = router;
