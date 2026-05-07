const router = require('express').Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const mentorMapRoutes = require('./mentorMapRoutes');
const quarterRoutes = require('./quarterRoutes');
const mboFormRoutes = require('./mboFormRoutes');
const notificationRoutes = require('./notificationRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/mentor-map', mentorMapRoutes);
router.use('/quarters', quarterRoutes);
router.use('/mbo', mboFormRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
