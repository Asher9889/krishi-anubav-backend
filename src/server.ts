import express from "express";
import { envConfig, logger } from "./config/index";
import apiRoutes from "./routes/index";
import { globalErrorHandler, routeNotExistsHandler } from "./utils";
import { connectMongoDB } from "./db";
import compression from "compression";
import PinoHttp from "pino-http";

connectMongoDB();

const app = express();
app.use(express.json());
app.use(PinoHttp({ logger }));


app.use(compression());


app.get("/", (req, res) => {
  res.send("Hey there, I am Alive!");
});

app.use("/api", apiRoutes);

app.use(routeNotExistsHandler);
app.use(globalErrorHandler);

const PORT = envConfig.port;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});