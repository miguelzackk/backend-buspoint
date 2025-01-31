const express = require("express");
const { buscarInformacoes } = require("../controllers/busController");

const router = express.Router();
router.get("/busca", buscarInformacoes);

module.exports = router;
