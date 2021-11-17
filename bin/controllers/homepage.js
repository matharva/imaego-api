const moment = require('moment-timezone');
const { Op } = require('sequelize');
const customError = require('../custom/errors');
const Homepage = require('../models/homepage');
const Images = require('../models/images');

exports.add = async (req, res) => {
  try {
    if (!req.body.image_id) throw customError.dataInvalid;
    let image = await Images.findByPk(req.body.image_id);
    if (!image) throw customError.dataInvalid;
    let data = await Homepage.create({
      image_id: image.id,
    });

    res.status(200).json({
      error: false,
      details: {
        message: 'Data Added Successfully',
      },
    });
  } catch (error) {
    console.log(`***** ERROR : ${req.originalUrl} ${error}`);
    return res.status(error.code || 500).json({
      error: true,
      details: error,
    });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body.homepage_id) throw customError.dataInvalid;
    let homepage = await Homepage.findByPk(req.body.homepage_id);
    if (!homepage) throw customError.dataNotFound;
    await Homepage.update(
      {
        active: false,
      },
      {
        where: {},
      }
    );
    let data = await homepage.update({
      active: true,
    });
    res.status(200).json({
      error: false,
      details: {
        message: 'Data Updated Successfully',
        data: data,
      },
    });
  } catch (error) {
    console.log(`***** ERROR : ${req.originalUrl} ${error}`);
    return res.status(error.code || 500).json({
      error: true,
      details: error,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    let data = await Homepage.findAll({
      attributes: ['id', 'active'],
      include: {
        model: Images,
        attributes: ['key', 'type', 'id'],
      },
    });
    res.status(200).json({
      error: false,
      details: {
        message: 'Data found',
        data: data,
      },
    });
  } catch (error) {
    console.log(`***** ERROR : ${req.originalUrl} ${error}`);
    return res.status(error.code || 500).json({
      error: true,
      details: error,
    });
  }
};

exports.getActive = async (req, res) => {
  try {
    let homepage = await Homepage.findOne({
      attributes: ['id', 'active'],
      include: {
        model: Images,
        attributes: ['key', 'type', 'id'],
      },
      where: {
        active: true,
      },
    });
    res.status(200).json({
      error: false,
      details: {
        message: 'Data found',
        homepage: homepage,
      },
    });
  } catch (error) {
    console.log(`***** ERROR : ${req.originalUrl} ${error}`);
    return res.status(error.code || 500).json({
      error: true,
      details: error,
    });
  }
};

exports.remove = async (req, res) => {
  try {
    if (!req.body.homepage_id) throw customError.dataInvalid;
    let homepage = await Homepage.findByPk(req.body.homepage_id);
    if (!homepage) throw customError.dataInvalid;
    let count = await Homepage.count();
    if (count == 1) throw customError.badRequest;
    if (homepage.active) throw customError.badRequest;
    await homepage.destroy();
    res.status(200).json({
      error: false,
      details: {
        message: 'Data Deleted Successfully',
      },
    });
  } catch (error) {
    console.log(`***** ERROR : ${req.originalUrl} ${error}`);
    return res.status(error.code || 500).json({
      error: true,
      details: error,
    });
  }
};
