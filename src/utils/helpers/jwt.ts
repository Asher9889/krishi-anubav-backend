import jwt from "jsonwebtoken";
import { envConfig } from "../../config";

type TGenerateJWTToken = {
  phone: string;
  userId?: string;
}

const generateJWTToken = ( { phone, userId }: TGenerateJWTToken ):string => {
  let payload: TGenerateJWTToken = { phone };
  if(userId) {
    payload = { ...payload, userId };
  }

  const token = jwt.sign({ userId, phone }, envConfig.jwtAccessTokenSecret, { expiresIn: "1d" }); 
  return token;
};

export { generateJWTToken };