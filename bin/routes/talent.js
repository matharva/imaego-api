const router = require('express').Router();
const talentController = require('../controllers/talent');
const authConrtoller = require('../custom/authmiddleware');

// Add talent page content
router.post('/add', 
authConrtoller.checkAdmin, 
talentController.add);

router.post('/sequence', 
authConrtoller.checkAdmin, 
talentController.setSequence);
// Get talent page content
router.get('/getTalent', talentController.getTalent);
router.get('/get', talentController.get);



// Update talent page content
router.patch('/update', 
authConrtoller.checkAdmin, 
talentController.update);

// Delete talent page content
router.delete('/delete', 
authConrtoller.checkAdmin, 
talentController.delete);

module.exports = router;
