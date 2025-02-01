const express = require("express");
const dotenv = require("dotenv");
const busRoutes = require("./routes/busRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/", busRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));