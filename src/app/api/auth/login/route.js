import { User } from "../../../../models/User.js";
import { asyncHandler } from "../../../../helper/utils/asyncHandler";
import { sendResponse } from "../../../../helper/utils/sendResponse.js";
import dbConnect from "../../../../lib/db.js";
import mongoose from "mongoose";
import { cookies } from "next/headers";

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

export async function POST(req, res) {
  await dbConnect();
  const body = await req.json();
  const { email, username, password } = body;

  if (!username && !email) {
    return sendResponse(false, null, "username or email is required", 400);
  }

  let searchCriteria = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (username) {
    if (emailRegex.test(username)) {
      searchCriteria.email = username;
    } else {
      searchCriteria.username = username;
    }
  } else if (email) {
    searchCriteria.email = email;
  }

  const user = await User.findOne(searchCriteria);
  if (!user) {
    return sendResponse(false, null, "User does not exist", 404);
  }
  console.log(
    "user instanceof mongoose.Model:",
    user instanceof mongoose.Model
  );
  console.log("user.has isPasswordCorrect:", typeof user.isPasswordCorrect);

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return sendResponse(false, null, "Invalid user credentials", 401);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  const cookieStore = await cookies();
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return sendResponse(
    true,
    {
      user: loggedInUser,
      accessToken,
      refreshToken,
    },
    "User logged In Successfully",
    200
  );
}
