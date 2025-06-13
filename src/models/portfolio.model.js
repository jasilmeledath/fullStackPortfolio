const mongoose = require('mongoose');

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
  proficiency: {
    type: Number,
    required: [true, 'Proficiency level is required'],
    min: 1,
    max: 100
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
  projects: [projectSchema]
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

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio; 