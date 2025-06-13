const express = require('express');
const { body } = require('express-validator');
const { sendContactEmail } = require('../controllers/contact.controller');

const router = express.Router();

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required')
  ],
  sendContactEmail
);

module.exports = router; 