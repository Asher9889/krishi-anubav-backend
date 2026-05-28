import mongoose from "mongoose";
import { envConfig, logger } from "../config";


async function connectMongoDB(): Promise<void> {
    try {
        const { mongodbUsername, mongodbPassword, mongodbCluster, mongodbDbName, mongodbConnectionString } = envConfig;
        // const uri = `mongodb+srv://${mongodbUsername}:${mongodbPassword}@${mongodbCluster}/${mongodbDbName}`;
        const uri = mongodbConnectionString;
        await mongoose.connect(uri);
        logger.info("Connected to MongoDB successfully" + mongoose.connection.name);
    } catch (error) {
        logger.error("Error connecting to MongoDB:" + error);
    }
}

export default connectMongoDB;

mongoose.connection.on('connected', () => logger.info('connected'));
mongoose.connection.on('open', () => logger.info('open'));
mongoose.connection.on('disconnected', () => logger.info('disconnected'));
mongoose.connection.on('reconnected', () => logger.info('reconnected'));
mongoose.connection.on('disconnecting', () => logger.info('disconnecting'));
mongoose.connection.on('close', () => logger.info('close'));


process.on("SIGINT", async () => {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed due to app termination");
    process.exit(0);
})