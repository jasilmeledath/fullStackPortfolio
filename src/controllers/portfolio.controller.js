const { Portfolio, Category, Intro } = require('../models/portfolio.model');
const { ApiError } = require('../middleware/error.middleware');
const fs = require('fs').promises;
const path = require('path');
const HTTP_STATUS = require('../constants/httpStatus');

// Helper function to delete old files
const deleteOldFile = async (filePath) => {
    try {
        // Convert relative path to absolute path if needed
        const absolutePath = filePath.startsWith('/') 
            ? filePath 
            : path.join(process.cwd(), 'src/public', filePath);
            
        await fs.unlink(absolutePath);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

const getPortfolio = async (req, res, next) => {
    try {
        const portfolio = await Portfolio.findOne()
            .populate('skills.category')
            .populate('blogs.category');
            
        if (!portfolio) {
            throw new ApiError(404, 'Portfolio not found');
        }
        res.json({
            status: 'success',
            data: portfolio,
        });
    } catch (error) {
        next(error);
    }
};

const updateIntro = async (req, res, next) => {
    try {
        const {
            siteTitle,
            yourName,
            roles
        } = req.body;

        // Validate required fields
        if (!siteTitle || !yourName || !roles) {
            throw new ApiError(400, 'All fields are required');
        }

        // Parse roles if it's a string (from form data)
        const rolesArray = typeof roles === 'string' ? roles.split(',').map(role => role.trim()) : roles;

        // Validate roles array
        if (!Array.isArray(rolesArray) || rolesArray.length === 0) {
            throw new ApiError(400, 'At least one role is required');
        }

        let intro = await Intro.findOne();
        
        if (!intro) {
            // Create new intro if none exists
            intro = new Intro({
                siteTitle,
                yourName,
                roles: rolesArray
            });
        } else {
            // Update existing intro
            Object.assign(intro, {
                siteTitle,
                yourName,
                roles: rolesArray
            });
        }

        // Handle logo upload
        if (req.file) {
            if (intro.logoIcon) {
                await deleteOldFile(intro.logoIcon);
            }
            // Store only the relative path
            intro.logoIcon = req.file.path.replace(/^.*[\\\/]uploads[\\\/]/, 'uploads/');
        }

        await intro.save();

        // Always return JSON response for API endpoints
        return res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: intro,
            message: 'Intro section updated successfully'
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: Object.keys(error.errors).reduce((acc, key) => {
                    acc[key] = error.errors[key].message;
                    return acc;
                }, {})
            });
        }
        next(error);
    }
};

const addSkill = async (req, res, next) => {
    try {
        const { name, category, proficiency } = req.body;
        
        if (!req.file) {
            throw new ApiError(400, 'Icon image is required');
        }

        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            throw new ApiError(404, 'Portfolio not found');
        }

        // Find or create category
        let skillCategory = await Category.findOne({ name: category, type: 'skill' });
        if (!skillCategory) {
            skillCategory = await Category.create({
                name: category,
                type: 'skill'
            });
        }

        portfolio.skills.push({
            iconUrl: req.file.path.replace('public', ''),
            name,
            category: skillCategory._id,
            proficiency
        });

        await portfolio.save();

        res.json({
            status: 'success',
            data: portfolio.skills
        });
    } catch (error) {
        next(error);
    }
};

const addProject = async (req, res, next) => {
    try {
        const { title, caption, description, repoLink } = req.body;
        
        if (!req.file) {
            throw new ApiError(400, 'Cover image is required');
        }

        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            throw new ApiError(404, 'Portfolio not found');
        }

        portfolio.projects.push({
            coverImageUrl: req.file.path.replace('public', ''),
            title,
            caption,
            description,
            repoLink
        });

        await portfolio.save();

        res.json({
            status: 'success',
            data: portfolio.projects
        });
    } catch (error) {
        next(error);
    }
};

const addBlog = async (req, res, next) => {
    try {
        const { title, content, category, tags } = req.body;
        
        if (!req.file) {
            throw new ApiError(400, 'Cover image is required');
        }

        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            throw new ApiError(404, 'Portfolio not found');
        }

        // Find or create category
        let blogCategory = await Category.findOne({ name: category, type: 'blog' });
        if (!blogCategory) {
            blogCategory = await Category.create({
                name: category,
                type: 'blog'
            });
        }

        portfolio.blogs.push({
            title,
            content,
            coverImage: req.file.path.replace('public', ''),
            category: blogCategory._id,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            published: false
        });

        await portfolio.save();

        res.json({
            status: 'success',
            data: portfolio.blogs
        });
    } catch (error) {
        next(error);
    }
};

const removeSkill = async (req, res, next) => {
    try {
        const { skillId } = req.params;
        
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            throw new ApiError(404, 'Portfolio not found');
        }

        const skill = portfolio.skills.id(skillId);
        if (skill) {
            await deleteOldFile(skill.iconUrl);
            portfolio.skills.pull(skillId);
            await portfolio.save();
        }

        res.json({
            status: 'success',
            data: portfolio.skills
        });
    } catch (error) {
        next(error);
    }
};

const removeProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            throw new ApiError(404, 'Portfolio not found');
        }

        const project = portfolio.projects.id(projectId);
        if (project) {
            await deleteOldFile(project.coverImageUrl);
            portfolio.projects.pull(projectId);
            await portfolio.save();
        }

        res.json({
            status: 'success',
            data: portfolio.projects
        });
    } catch (error) {
        next(error);
    }
};

const removeBlog = async (req, res, next) => {
    try {
        const { blogId } = req.params;
        
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            throw new ApiError(404, 'Portfolio not found');
        }

        const blog = portfolio.blogs.id(blogId);
        if (blog) {
            await deleteOldFile(blog.coverImage);
            portfolio.blogs.pull(blogId);
            await portfolio.save();
        }

        res.json({
            status: 'success',
            data: portfolio.blogs
        });
    } catch (error) {
        next(error);
    }
};

const updateSkill = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, category, proficiency } = req.body;
        
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            throw new ApiError(404, 'Portfolio not found');
        }

        const skill = portfolio.skills.id(id);
        if (!skill) {
            throw new ApiError(404, 'Skill not found');
        }

        // Find or create category
        let skillCategory = await Category.findOne({ name: category, type: 'skill' });
        if (!skillCategory) {
            skillCategory = await Category.create({
                name: category,
                type: 'skill'
            });
        }

        // Update skill fields
        skill.name = name;
        skill.category = skillCategory._id;
        skill.proficiency = proficiency;

        // Handle icon update if new file is uploaded
        if (req.file) {
            // Delete old icon file
            await deleteOldFile(skill.iconUrl);
            // Update with new icon path
            skill.iconUrl = req.file.path.replace('public', '');
        }

        await portfolio.save();

        res.json({
            status: 'success',
            data: skill
        });
    } catch (error) {
        next(error);
    }
};

const updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, caption, description, repoLink } = req.body;
        
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            throw new ApiError(404, 'Portfolio not found');
        }

        const project = portfolio.projects.id(id);
        if (!project) {
            throw new ApiError(404, 'Project not found');
        }

        // Update project fields
        project.title = title;
        project.caption = caption;
        project.description = description;
        project.repoLink = repoLink;

        // Handle cover image update if new file is uploaded
        if (req.file) {
            // Delete old cover image
            await deleteOldFile(project.coverImageUrl);
            // Update with new cover image path
            project.coverImageUrl = req.file.path.replace('public', '');
        }

        await portfolio.save();

        res.json({
            status: 'success',
            data: project
        });
    } catch (error) {
        next(error);
    }
};

const updateBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, category, tags, published } = req.body;
        
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            throw new ApiError(404, 'Portfolio not found');
        }

        const blog = portfolio.blogs.id(id);
        if (!blog) {
            throw new ApiError(404, 'Blog not found');
        }

        // Find or create category
        let blogCategory = await Category.findOne({ name: category, type: 'blog' });
        if (!blogCategory) {
            blogCategory = await Category.create({
                name: category,
                type: 'blog'
            });
        }

        // Update blog fields
        blog.title = title;
        blog.content = content;
        blog.category = blogCategory._id;
        blog.tags = tags ? tags.split(',').map(tag => tag.trim()) : blog.tags;
        
        // Handle publishing status
        if (published === 'true' && !blog.published) {
            blog.published = true;
            blog.publishedAt = new Date();
        } else if (published === 'false') {
            blog.published = false;
            blog.publishedAt = null;
        }

        // Handle cover image update if new file is uploaded
        if (req.file) {
            // Delete old cover image
            await deleteOldFile(blog.coverImage);
            // Update with new cover image path
            blog.coverImage = req.file.path.replace('public', '');
        }

        await portfolio.save();

        res.json({
            status: 'success',
            data: blog
        });
    } catch (error) {
        next(error);
    }
};

const updateAbout = async (req, res, next) => {
    try {
        const { bio } = req.body;
        
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            throw new ApiError(404, 'Portfolio not found');
        }

        // Update biography
        portfolio.aboutMe = bio;

        // Handle avatar update if new file is uploaded
        if (req.files && req.files.avatar) {
            // Delete old avatar if exists
            if (portfolio.avatar) {
                await deleteOldFile(portfolio.avatar);
            }
            // Update with new avatar path
            portfolio.avatar = req.files.avatar[0].path.replace('public', '');
        }

        // Handle badges if provided
        if (req.files && req.files.badges) {
            // Delete old badge icons
            if (portfolio.badges && portfolio.badges.length > 0) {
                for (const badge of portfolio.badges) {
                    await deleteOldFile(badge.badgeIcon);
                }
            }

            // Update badges with new files
            portfolio.badges = req.files.badges.map((file, index) => ({
                badgeName: req.body[`badges[${index}][badgeName]`],
                badgeIcon: file.path.replace('public', '')
            }));
        }

        await portfolio.save();

        res.json({
            status: 'success',
            data: {
                bio: portfolio.aboutMe,
                avatar: portfolio.avatar,
                badges: portfolio.badges
            },
            message: 'About section updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPortfolio,
    updateIntro,
    addSkill,
    addProject,
    addBlog,
    removeSkill,
    removeProject,
    removeBlog,
    updateSkill,
    updateProject,
    updateBlog,
    updateAbout
}; 