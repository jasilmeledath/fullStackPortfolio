const express = require('express');
const { body } = require('express-validator');
const {
  getPortfolio,
  updatePortfolio,
  addSkill,
  addProject,
  removeSkill,
  removeProject
} = require('../controllers/portfolio.controller');
const { verifyJWT } = require('../middleware/jwt.middleware');

const router = express.Router();

// Public routes
router.get('/', getPortfolio);

// Protected routes
router.use(verifyJWT);

router.put('/',
  [
    body('siteTitle').trim().notEmpty().withMessage('Site title is required'),
    body('headerCaption').trim().notEmpty().withMessage('Header caption is required'),
    body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
    body('aboutMe').trim().notEmpty().withMessage('About me section is required')
  ],
  updatePortfolio
);

router.post('/skills',
  [
    body('iconUrl').trim().notEmpty().withMessage('Icon URL is required'),
    body('name').trim().notEmpty().withMessage('Skill name is required'),
    body('proficiency')
      .isInt({ min: 1, max: 100 })
      .withMessage('Proficiency must be between 1 and 100')
  ],
  addSkill
);

router.post('/projects',
  [
    body('coverImageUrl').trim().notEmpty().withMessage('Cover image URL is required'),
    body('title').trim().notEmpty().withMessage('Project title is required'),
    body('caption').trim().notEmpty().withMessage('Project caption is required'),
    body('description').trim().notEmpty().withMessage('Project description is required'),
    body('repoLink').trim().notEmpty().withMessage('Repository link is required')
  ],
  addProject
);

router.delete('/skills/:skillId', removeSkill);
router.delete('/projects/:projectId', removeProject);

module.exports = router; 