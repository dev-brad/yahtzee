const express = require('express');
const router = express.Router();
const gameController = require("../controllers/gameController");


router.get('/', gameController.render_game);

router.post('/', gameController.process_turn);


module.exports = router;