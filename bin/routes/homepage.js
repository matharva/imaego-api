const router = require('express').Router();
const homepageController = require('../controllers/homepage');
const authConrtoller = require('../custom/authmiddleware');

//route to add homepage data
router.post('/add', authConrtoller.checkAdmin, homepageController.add);

//route to update homepage data
router.post('/update', authConrtoller.checkAdmin, homepageController.update);

//route to get all homepage data
router.get('/get', homepageController.getAll);

//route to get active homepage data
router.get('/active', homepageController.getActive);

//router to delete homepage data by id
router.post('/delete', authConrtoller.checkAdmin, homepageController.remove);

module.exports = router;
