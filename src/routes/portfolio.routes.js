const express = require('express');
const { body } = require('express-validator');
const upload = require('../config/multer.config');
const {
  getPortfolio,
  updatePortfolio,
  addSkill,
  addProject,
  addBlog,
  removeSkill,
  removeProject,
  removeBlog
} = require('../controllers/portfolio.controller');
const { verifyJWT } = require('../middleware/jwt.middleware');

const router = express.Router();

// Public routes
router.get('/', getPortfolio);

// Protected routes
router.use(verifyJWT);

router.put('/',
  upload.single('logoIcon'),
  [
    body('siteTitle').trim().notEmpty().withMessage('Site title is required'),
    body('headerCaption').trim().notEmpty().withMessage('Header caption is required'),
    body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
    body('aboutMe').trim().notEmpty().withMessage('About me section is required')
  ],
  updatePortfolio
);

router.post('/skills',
  upload.single('iconUrl'),
  [
    body('name').trim().notEmpty().withMessage('Skill name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('proficiency')
      .isInt({ min: 1, max: 5 })
      .withMessage('Proficiency must be between 1 and 5')
  ],
  addSkill
);

router.post('/projects',
  upload.single('coverImage'),
  [
    body('title').trim().notEmpty().withMessage('Project title is required'),
    body('caption').trim().notEmpty().withMessage('Project caption is required'),
    body('description').trim().notEmpty().withMessage('Project description is required'),
    body('repoLink').trim().notEmpty().withMessage('Repository link is required')
  ],
  addProject
);

router.post('/blogs',
  upload.single('coverImage'),
  [
    body('title').trim().notEmpty().withMessage('Blog title is required'),
    body('content').trim().notEmpty().withMessage('Blog content is required'),
    body('category').trim().notEmpty().withMessage('Category is required')
  ],
  addBlog
);

router.delete('/skills/:skillId', removeSkill);
router.delete('/projects/:projectId', removeProject);
router.delete('/blogs/:blogId', removeBlog);

module.exports = router; 