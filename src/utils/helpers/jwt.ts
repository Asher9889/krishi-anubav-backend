import jwt from "jsonwebtoken";
import { envConfig } from "../../config";

const generateJWTToken = (userId: string) => {
  const token = jwt.sign({ userId }, envConfig.jwtSecret, { expiresIn: "1d" }); 
  return token;
};

export { generateJWTToken };