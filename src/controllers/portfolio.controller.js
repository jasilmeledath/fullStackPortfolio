const Portfolio = require('../models/portfolio.model');
const Category = require('../models/portfolio.model').Category;
const { ApiError } = require('../middleware/error.middleware');
const fs = require('fs').promises;
const path = require('path');

// Helper function to delete old files
const deleteOldFile = async (filePath) => {
    try {
        await fs.unlink(path.join(process.cwd(), filePath));
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

const updatePortfolio = async (req, res, next) => {
    try {
        const {
            siteTitle,
            headerCaption,
            shortDescription,
            aboutMe
        } = req.body;

        let portfolio = await Portfolio.findOne();
        
        if (!portfolio) {
            portfolio = new Portfolio({
                siteTitle,
                headerCaption,
                shortDescription,
                aboutMe
            });
        } else {
            Object.assign(portfolio, {
                siteTitle,
                headerCaption,
                shortDescription,
                aboutMe
            });
        }

        // Handle logo upload
        if (req.file) {
            if (portfolio.logoIcon) {
                await deleteOldFile(portfolio.logoIcon);
            }
            portfolio.logoIcon = req.file.path.replace('public', '');
        }

        await portfolio.save();

        res.json({
            status: 'success',
            data: portfolio
        });
    } catch (error) {
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

module.exports = {
    getPortfolio,
    updatePortfolio,
    addSkill,
    addProject,
    addBlog,
    removeSkill,
    removeProject,
    removeBlog
}; 