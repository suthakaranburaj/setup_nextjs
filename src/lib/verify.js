import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { User } from "../models/User.js";
import dbConnect from "../lib/db.js";
import mongoose from "mongoose";

export const verifyJWT = async (req) => {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) throw new Error("Unauthorized");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded._id).select("-password");
    console.log("User found:", user);
    console.log(decoded._id, user._id);
    if (!user) throw new Error("User not found");

    return { user };
  } catch (error) {
    console.error("JWT verification error:", error.message);
    throw new Error(error.message);
  }
};
