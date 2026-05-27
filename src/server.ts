import express from "express";
import { logger } from "./config/index";
import apiRoutes from "./routes/index";

const app = express();

app.get("/", (req, res) => {
  res.send("Hey there, I am Alive!");
});

app.get("/api", apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});