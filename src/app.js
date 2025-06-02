//app.js
import express from "express";
import dotenv from "dotenv";
import busRoutes from "./routes/busRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/", busRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
