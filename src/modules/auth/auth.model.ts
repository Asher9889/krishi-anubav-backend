import mongoose, { Document } from "mongoose";
import argon2 from "argon2";


export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  comparePassword(inputPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  }, { timestamps: true }
);

// hook to save hashed password before saving user document
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await argon2.hash(this.password);  
});

// method to compare input password with hashed password
userSchema.methods.comparePassword = async function (inputPassword: string): Promise<boolean> {
  return await argon2.verify(this.password, inputPassword);
}

userSchema.index({ email: 1 }, { unique: true });

export const UserModel = mongoose.model<IUser>("User", userSchema);
