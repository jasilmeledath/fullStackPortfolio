const mongoose = require('mongoose');

//
// ─── CATEGORY SCHEMA ────────────────────────────────────────────────────────────
//
/**
 * Categories can be used to group Skills or Blogs.
 * @typedef {Object} Category
 * @property {String} name       Unique name of the category.
 * @property {String} type       Either 'skill' or 'blog'.
 * @property {String} [description] Optional human‑readable description.
 */
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    index: true
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


//
// ─── SKILL SCHEMA ───────────────────────────────────────────────────────────────
//
/**
 * A single skill with a proficiency level.
 * @typedef {Object} Skill
 * @property {String} iconUrl      URL or path to the skill icon.
 * @property {String} name         Human‑readable skill name.
 * @property {ObjectId} category   Reference to Category._id.
 * @property {Number} proficiency  1 (novice) through 5 (expert).
 */
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
    min: [1, 'Minimum proficiency is 1'],
    max: [5, 'Maximum proficiency is 5'],
    required: [true, 'Proficiency level is required']
  }
});


//
// ─── PROJECT SCHEMA ─────────────────────────────────────────────────────────────
//
/**
 * A portfolio project entry.
 * @typedef {Object} Project
 * @property {String} coverImageUrl  URL or path to the project cover image.
 * @property {String} title          Title of the project.
 * @property {String} caption        Short tagline or caption.
 * @property {String} description    Full project description.
 * @property {String} repoLink       Link to source repository.
 */
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


//
// ─── BLOG SCHEMA ────────────────────────────────────────────────────────────────
//
/**
 * A blog post entry.
 * @typedef {Object} Blog
 * @property {String} title        Title of the blog post.
 * @property {String} content      HTML or markdown content.
 * @property {String} coverImage   URL or path to cover image.
 * @property {ObjectId} category   Reference to Category._id.
 * @property {String[]} tags       Array of tag strings.
 * @property {Boolean} published   Whether the post is live.
 * @property {Date}   publishedAt  When the post was published.
 */
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


//
// ─── INTRO (PORTFOLIO HEADER) SCHEMA ────────────────────────────────────────────
//
/**
 * Intro section for the portfolio (header area).
 * Only one document of this type should exist.
 * @typedef {Object} Intro
 * @property {String} siteTitle    Title or logo text of the site.
 * @property {String} logoIcon     Path/URL to logo icon.
 * @property {String} yourName     Your full name.
 * @property {String[]} roles      Array of system roles (e.g. ['Developer', 'Musician']).
 */
const introSchema = new mongoose.Schema({
  siteTitle: {
    type: String,
    required: [true, 'Site title / logo text is required'],
    trim: true
  },
  logoIcon: {
    type: String,
    required: [true, 'Logo icon path is required'],
    trim: true
  },
  yourName: {
    type: String,
    required: [true, 'Your name is required'],
    trim: true
  },
  roles: {
    type: [String],
    required: [true, 'At least one role is required'],
    validate: {
      validator: arr => Array.isArray(arr) && arr.length > 0,
      message: 'You must specify at least one system role'
    }
  }
}, {
  timestamps: true
});

// Prevent more than one Intro document
introSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count > 0) {
      return next(new Error('Only one Intro document can exist'));
    }
  }
  next();
});

//
// ─── PORTFOLIO SCHEMA ───────────────────────────────────────────────────────────
//
const portfolioSchema = new mongoose.Schema({
    aboutMe: {
        type: String,
        required: [true, 'About me section is required'],
        trim: true
    },
    avatar: {
        type: String,
        trim: true
    },
    badges: [{
        badgeName: {
            type: String,
            required: true,
            trim: true
        },
        badgeIcon: {
            type: String,
            required: true,
            trim: true
        }
    }],
    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    }],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }]
}, {
    timestamps: true
});

// Prevent more than one Portfolio document
portfolioSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await this.constructor.countDocuments();
        if (count > 0) {
            return next(new Error('Only one Portfolio document can exist'));
        }
    }
    next();
});

// Make sure all models are properly defined and exported
const Category = mongoose.model('Category', categorySchema);
const Skill = mongoose.model('Skill', skillSchema);
const Project = mongoose.model('Project', projectSchema);
const Blog = mongoose.model('Blog', blogSchema);
const Intro = mongoose.model('Intro', introSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Export all models
module.exports = {
    Category,
    Skill,
    Project,
    Blog,
    Intro,
    Portfolio
};
