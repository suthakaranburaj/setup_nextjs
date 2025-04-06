import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { User } from "@/models/User";

export const verifyJWT = async (req) => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) throw new Error("Unauthorized");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password");

    if (!user) throw new Error("User not found");

    return { user };
  } catch (error) {
    throw new Error(error.message);
  }
};
