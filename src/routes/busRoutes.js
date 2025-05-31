//busRoutes.js
import express from "express";
import { buscarInformacoes } from "../controllers/busController.js";

const router = express.Router();
router.get("/busca", buscarInformacoes);

export default router;