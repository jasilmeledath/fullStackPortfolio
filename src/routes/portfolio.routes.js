const express = require('express');
const { body } = require('express-validator');
const upload = require('../config/multer.config');
const { sessionGuard } = require('../middleware/session.middleware');
const {
  getPortfolio,
  updateIntro,
  addSkill,
  addProject,
  addBlog,
  removeSkill,
  removeProject,
  removeBlog,
  updateAbout,
  updateProject,
  updateSkill,
  updateBlog
} = require('../controllers/portfolio.controller');

const router = express.Router();

// Public routes
router.get('/', getPortfolio);

// Protected routes - use sessionGuard instead of verifyJWT
router.use(sessionGuard);

router.put('/',
  upload.single('logoIcon'),
  [
    body('siteTitle').trim().notEmpty().withMessage('Site title is required'),
    body('headerCaption').trim().notEmpty().withMessage('Header caption is required'),
    body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
    body('aboutMe').trim().notEmpty().withMessage('About me section is required')
  ],
  updateIntro
);

router.post('/intro', upload.single('logoIcon'), updateIntro);
router.put('/intro', upload.single('logoIcon'), updateIntro);

router.post('/about', upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'badges', maxCount: 10 }
]), updateAbout);

router.put('/about', upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'badges', maxCount: 10 }
]), updateAbout);

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

router.put('/skills/:id', upload.single('iconUrl'), updateSkill);

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

router.put('/projects/:id', upload.single('coverImage'), updateProject);

router.delete('/projects/:id', removeProject);

router.post('/blogs',
  upload.single('coverImage'),
  [
    body('title').trim().notEmpty().withMessage('Blog title is required'),
    body('content').trim().notEmpty().withMessage('Blog content is required'),
    body('category').trim().notEmpty().withMessage('Category is required')
  ],
  addBlog
);

router.put('/blogs/:id', upload.single('coverImage'), updateBlog);

router.delete('/blogs/:id', removeBlog);

module.exports = router; 