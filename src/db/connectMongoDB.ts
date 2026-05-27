import mongoose from "mongoose";
import { envConfig } from "../config";


async function connectMongoDB(): Promise<void> {
    try {
        const { mongodbUsername, mongodbPassword, mongodbCluster, mongodbDbName } = envConfig;
        const uri = `mongodb+srv://${mongodbUsername}:${mongodbPassword}@${mongodbCluster}/${mongodbDbName}`;
        await mongoose.connect(uri);
        console.log("Connected to MongoDB successfully", mongoose.connection.name);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export default connectMongoDB;

mongoose.connection.on('connected', () => console.log('connected'));
mongoose.connection.on('open', () => console.log('open'));
mongoose.connection.on('disconnected', () => console.log('disconnected'));
mongoose.connection.on('reconnected', () => console.log('reconnected'));
mongoose.connection.on('disconnecting', () => console.log('disconnecting'));
mongoose.connection.on('close', () => console.log('close'));


process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
})