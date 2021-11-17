const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
const uniqid = require('uniqid');
const multer = require('multer');
const { Op } = require('sequelize');

const Images = require('../models/images');
const Blog = require('../models/blog');
const Talent = require('../models/talent');
const Social = require('../models/social');
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
    ext == '.JPEG'
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
    if (
      !req.body.oneliner ||
      !req.body.sequence ||
      !req.body.content ||
      !req.body.author||
      !req.body.imageData||
      !req.body.socialData
    )
      throw customError.dataInvalid;
    let talent = await Talent.create({
      oneliner: req.body.oneliner,
      content: req.body.content,
      author: req.body.author,
      sequence:req.body.sequence
    });

    await Promise.all(req.body.imageData.map(async(item)=>{
      let image = await Images.findByPk(item.id)
      // await image.update({
      //   type:item.type,
      // })
      let createRelation = await Relation.create({
        image_id:image.id,
        talent_id:talent.id,
        type:item.type,
      })
      
      console.log("Relation is: ",createRelation);
    }))
    
    await Promise.all(req.body.socialData.map(async(item)=>{

      let social = await Social.create({
        type: item.type,
        value:item.value,
        talent_id: talent.id,
        handle:item.handle
      });
      
      console.log("Relation is: ",social);
    }))

    return res.status(200).json({
      error: false,
      details: {
        message: 'Data Uploaded Successfully',
        data: talent,
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

exports.getTalent = async (req, res) => {
  try {

    let data = await Talent.findAll({
      include: [
        {
          model: Relation, 
          include: [{
            model:Images,
            attributes:{exclude: ['createdAt','updatedAt','id','talent_id','image_id','blog_id','sequence']}  
          }],
          attributes:{exclude: ['createdAt','updatedAt','id','talent_id','image_id','blog_id']}  
        },
        { 
          model: Social,
          attributes:{exclude: ['createdAt','updatedAt','id','talent_id']}
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


exports.get = async (req, res) => {
  try {

    let data = await Talent.findAll({
      include: [
        {
          model: Relation, 
          include: [{
            model:Images,
          }],  
        },
        { 
          model: Social,
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


exports.update = async (req, res) => {
  try {
    if (
      !req.body.oneliner ||
      !req.body.sequence ||
      !req.body.content ||
      !req.body.author ||
      !req.body.id||
      !req.body.imageData||
      !req.body.socialData
    )
      throw customError.dataInvalid;
    let talent = await Talent.findByPk(req.body.id);
    if (!talent) throw customError.dataInvalid;

    talent = await talent.update({
      oneliner: req.body.oneliner,
      content: req.body.content,
      author: req.body.author,
      sequence:req.body.sequence
    });


    await Relation.destroy({
      where:{
        talent_id:req.body.id
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
          talent_id:talent.id,
          type:item.type
        })
        
        console.log("Relation is: ",createRelation);
      }
      
    }))

    await Promise.all(req.body.socialData.map(async(item)=>{
      if(item.id){
        let social = await Social.findByPk(item.id);
        await social.update({
          type:item.type,
          value:item.value,
          handle:item.handle,
        })

        console.log("Relation is: ",social);
      } 
    }))

    let data = await Talent.findAll({
      where:{
        id:req.body.id
      },
      include: [
        {
          model: Relation, 
          include: [
            Images
          ]  
        },
        {
          model: Social,  
        }
      ],
    });

    return res.status(200).json({
      error: false,
      details: {
        message: 'Data Updated',
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

exports.delete = async (req, res) => {
  try {
    if (!req.body.id) throw customError.dataInvalid;
    await Talent.destroy({ where: { id: req.body.id } });
  
    await Relation.destroy({
      where:{
        talent_id:req.body.id
      }
    })
    await Social.destroy({
      where:{
        talent_id:req.body.id
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
        let talent = await Talent.findByPk(item.id)
        await talent.update({
          sequence:item.sequence,
        })
        console.log("Blog: ",talent);
      }
    }));

    let data = await Talent.findAll({
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