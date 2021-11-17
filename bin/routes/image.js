const router = require('express').Router();
const imageController = require('../controllers/image');
const authConrtoller = require('../custom/authmiddleware');

// Add Images to Blog
router.post(
    '/add',
    authConrtoller.checkAdmin,
    imageController.uploadImage.array('images'),
    imageController.addImages
  );
  
  // get images from Blog
  router.get('/get', imageController.getImages);
  
  // delete images from Blog
  router.delete(
    '/delete',
    authConrtoller.checkAdmin,
    imageController.deleteImages
  );

  module.exports = router;