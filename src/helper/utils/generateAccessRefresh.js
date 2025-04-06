import { User } from "@/models/User";
import { sendResponse } from "./sendResponse.js";

export const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    // console.log(user);
    const accessToken = user.generateAccessToken();
    // console.log(accessToken);
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return sendResponse(
      false,
      null,
      "Something went wrong while generating referesh and access token",
      500
    );
  }
};