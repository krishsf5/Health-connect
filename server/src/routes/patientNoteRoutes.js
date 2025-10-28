const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middleware/auth');
const {
  listNotesForPatient,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/patientNoteController');

router.use(authRequired);
router.use(requireRole('doctor'));

router.get('/patient/:patientId', listNotesForPatient);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
