const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
const uniqid = require('uniqid');
const multer = require('multer');
const { Op, BelongsTo } = require('sequelize');

const Images = require('../models/images');
const Blog = require('../models/blog');
const Relation = require("../models/relation");

const customError = require('../custom/errors');

const {
  tokenGenerator,
  random,
  makeRandom,
  message,
  compareTime,
  generateOTP,
  hashPassword,
  sendMail,
} = require('../custom/functions');
const { getSignedURL, uploadFile, deleteFile } = require('../custom/s3');

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join('./uploads')); // save the initial images in uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, `${uniqid()}${file.originalname.replace(/\s/g, '')}`); // rename the image with a unique ID + file name
  },
});

// check the file format before saving....
const multerFilter = (req, file, cb) => {
  var ext = path.extname(file.originalname);
  if (
    ext == '.avi' ||
    ext == '.mp4' ||
    ext == '.mov' ||
    ext == '.png' ||
    ext == '.img' ||
    ext == '.jpg' ||
    ext == '.jpeg' ||
    ext == '.PDF' ||
    ext == '.PNG' ||
    ext == '.IMG' ||
    ext == '.JPG' ||
    ext == '.JPEG'||
    etx == '.jfif'
  ) {
    cb(null, true);
  } else {
    cb('Only pdf and images are allowed', false);
  }
};

exports.uploadImage = multer({
  storage: imageStorage,
  fileFilter: multerFilter,
});

exports.add = async (req, res) => {
  try {
    console.log("Req body:",req.body);
    if (
      !req.body.title ||
      !req.body.sequence ||
      !req.body.content ||
      !req.body.author||
      // !req.body.oneliner||
      !req.body.imageData
    )
      throw customError.dataInvalid;

      let blog = await Blog.create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        sequence:req.body.sequence,
        oneliner:req.body.oneliner
      });

    await Promise.all(req.body.imageData.map(async(item)=>{
      console.log("Req body: ",item);
      let image = await Images.findByPk(item.id)
      // await image.update({
      //   type:item.type,
      // })
      let createRelation = await Relation.create({
        image_id:image.id,
        blog_id:blog.id,
        type:item.type
      })
      
      console.log("Relation is: ",createRelation);
    }))

    return res.status(200).json({
      error: false,
      details: {
        message: 'Data Added Successfully',
        data: "o98b27c98 ",
        images:blog
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

exports.get = async (req, res) => {
  try {

    let data = await Blog.findAll({
      include: [
        {
          model: Relation, 
          include: [
            Images
          ]  
        }
      ],
      order: [
        ['sequence', 'ASC']
      ]
    });

    
    return res.status(200).json({
      error: false,
      details: {
        message: 'Data Found',
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


exports.getBlog = async (req, res) => {
  try {

    let data = await Blog.findAll({
      include: [
        {
          model: Relation, 
          include: [{
            model:Images,
            attributes:{exclude: ['createdAt','updatedAt','id','talent_id','image_id','blog_id','sequence']}  
          }],
          attributes:{exclude: ['createdAt','updatedAt','id','talent_id','image_id','blog_id']}  
        }
      ],
      attributes:{exclude: ['createdAt','updatedAt']},
      order: [
        ['sequence', 'ASC']
      ]
    });

    
    return res.status(200).json({
      error: false,
      details: {
        message: 'Data Found',
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



exports.update = async (req, res) => {
  try {
    if (
      !req.body.title ||
      !req.body.sequence ||
      !req.body.content ||
      !req.body.author ||
      !req.body.id||
      // !req.body.oneliner
      !req.body.imageData
    )
      throw customError.dataInvalid;
    let blog = await Blog.findByPk(req.body.id);
    if (!blog) throw customError.dataInvalid;
    

    await blog.update({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      oneliner:req.body.oneliner
    });

    await Relation.destroy({
      where:{
        blog_id:req.body.id
      }
    })

    await Promise.all(req.body.imageData.map(async(item)=>{
      if(item.id){
        let image = await Images.findByPk(item.id)
          // await image.update({
          //   type:item.type,
          // })
          let createRelation = await Relation.create({
            image_id:image.id,
            blog_id:blog.id,
            type:item.type
          })
          
          console.log("Relation is: ",createRelation);
      }
      
    }))

    let data = await Blog.findAll({
      where:{
        id:req.body.id
      },
      include: [
        {
          model: Relation, 
          include: [
            Images
          ]  
        }
      ]
    });

    return res.status(200).json({
      error: false,
      details: {
        message: 'Data Updated',
        blog:data
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

exports.delete = async (req, res) => {
  try {
    if (!req.body.id) throw customError.dataInvalid;
    await Blog.destroy({ where: { id: req.body.id } });

    await Relation.destroy({
      where:{
        blog_id:req.body.id
      }
    })

    return res.status(200).json({
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


exports.setSequence = async (req,res)=>{
  try {
    if (!req.body.sequenceData) throw customError.dataInvalid;

    await Promise.all(req.body.sequenceData.map(async (item)=>{
      if(item.id){
        let blog = await Blog.findByPk(item.id)
        await blog.update({
          sequence:item.sequence,
        })
        console.log("Blog: ",blog);
      }
    }));

    let data = await Blog.findAll({
      include: [
        {
          model: Relation, 
          include: [
            Images
          ]  
        }
      ],
      order: [
        ['sequence', 'ASC']
      ]
    });

    return res.status(200).json({
      error: false,
      details: {
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
}