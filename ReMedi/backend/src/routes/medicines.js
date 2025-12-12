const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  getAll,
  create,
  update,
  remove,
  markTaken
} = require('../controllers/medicines');

router.get('/', auth, getAll);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);
router.post('/:id/mark-taken', auth, markTaken);

module.exports = router;
