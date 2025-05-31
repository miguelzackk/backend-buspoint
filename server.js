//server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import busRoutes from "./src/routes/busRoutes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/", busRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));   