const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  type: {
    type: String,
    required: [true, 'Category type is required'],
    enum: ['skill', 'blog'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const skillSchema = new mongoose.Schema({
  iconUrl: {
    type: String,
    required: [true, 'Icon URL is required']
  },
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Skill category is required']
  },
  proficiency: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Proficiency level is required']
  }
});

const projectSchema = new mongoose.Schema({
  coverImageUrl: {
    type: String,
    required: [true, 'Cover image URL is required']
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  caption: {
    type: String,
    required: [true, 'Project caption is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required']
  },
  repoLink: {
    type: String,
    required: [true, 'Repository link is required'],
    trim: true
  }
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  coverImage: {
    type: String,
    required: [true, 'Cover image is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Blog category is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const portfolioSchema = new mongoose.Schema({
  siteTitle: {
    type: String,
    required: [true, 'Site title is required'],
    trim: true
  },
  headerCaption: {
    type: String,
    required: [true, 'Header caption is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true
  },
  aboutMe: {
    type: String,
    required: [true, 'About me section is required']
  },
  skills: [skillSchema],
  projects: [projectSchema],
  blogs: [blogSchema]
}, {
  timestamps: true
});

// Ensure only one portfolio document exists
portfolioSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count > 0) {
      throw new Error('Only one portfolio document can exist');
    }
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = { Portfolio, Category };