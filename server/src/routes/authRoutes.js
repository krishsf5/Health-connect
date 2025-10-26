const router = require('express').Router();
const { register, registerDoctor, login, me } = require('../controllers/authController');
const { authRequired } = require('../middleware/auth');

router.post('/register', register);
router.post('/register-doctor', registerDoctor);
router.post('/login', login);
router.get('/me', authRequired, me);

module.exports = router;
