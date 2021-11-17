const router = require('express').Router();
const blogController = require('../controllers/blog');
const authConrtoller = require('../custom/authmiddleware');

// Add Blog page content
router.post('/add',
 authConrtoller.checkAdmin,
 blogController.uploadImage.array('images'), 
 blogController.add);

router.post('/sequence',
authConrtoller.checkAdmin,
blogController.setSequence
)

// Get Blog page content
router.get('/get', blogController.get);
router.get('/getBlog', blogController.getBlog);


// Update Blog page content
router.patch('/update',
 authConrtoller.checkAdmin,
  blogController.update);

// Delete Blog page content
router.delete('/delete', 
authConrtoller.checkAdmin, 
blogController.delete);



module.exports = router;
