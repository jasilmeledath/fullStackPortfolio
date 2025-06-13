const Portfolio = require('../models/portfolio.model');
const { ApiError } = require('../middleware/error.middleware');

const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      throw new ApiError(404, 'Portfolio not found');
    }
    res.json({
      status: 'success',
      data: portfolio
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
      aboutMe,
      skills,
      projects
    } = req.body;

    let portfolio = await Portfolio.findOne();
    
    if (!portfolio) {
      // Create new portfolio if none exists
      portfolio = await Portfolio.create({
        siteTitle,
        headerCaption,
        shortDescription,
        aboutMe,
        skills,
        projects
      });
    } else {
      // Update existing portfolio
      portfolio.siteTitle = siteTitle;
      portfolio.headerCaption = headerCaption;
      portfolio.shortDescription = shortDescription;
      portfolio.aboutMe = aboutMe;
      portfolio.skills = skills;
      portfolio.projects = projects;
      await portfolio.save();
    }

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
    const { iconUrl, name, proficiency } = req.body;
    
    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      throw new ApiError(404, 'Portfolio not found');
    }

    portfolio.skills.push({ iconUrl, name, proficiency });
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
    const { coverImageUrl, title, caption, description, repoLink } = req.body;
    
    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      throw new ApiError(404, 'Portfolio not found');
    }

    portfolio.projects.push({
      coverImageUrl,
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

const removeSkill = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    
    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      throw new ApiError(404, 'Portfolio not found');
    }

    portfolio.skills = portfolio.skills.filter(
      skill => skill._id.toString() !== skillId
    );
    await portfolio.save();

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

    portfolio.projects = portfolio.projects.filter(
      project => project._id.toString() !== projectId
    );
    await portfolio.save();

    res.json({
      status: 'success',
      data: portfolio.projects
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
  removeSkill,
  removeProject
}; 