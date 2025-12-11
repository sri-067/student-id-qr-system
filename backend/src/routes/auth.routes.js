// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { registerAdmin, login } = require('../controllers/auth.controller');

router.post(
  '/register',
  [
    body('name').isLength({ min: 2 }).withMessage('name required'),
    body('email').isEmail().withMessage('valid email required'),
    body('password').isLength({ min: 6 }).withMessage('password min 6 chars')
  ],
  validate,
  registerAdmin
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('valid email required'),
    body('password').exists().withMessage('password required')
  ],
  validate,
  login
);

module.exports = router;
