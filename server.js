//server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const busRoutes = require("./src/routes/busRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/", busRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));   