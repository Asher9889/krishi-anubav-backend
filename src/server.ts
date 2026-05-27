import express from "express";
import { logger } from "./config/index";

const app = express();

app.get("/", (req, res) => {
  res.send("Hey there, I am Alive!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});