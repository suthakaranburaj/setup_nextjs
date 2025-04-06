import { User } from "../../../../models/User";
import { asyncHandler } from "../../../../helper/utils/asyncHandler";
import { uploadOnCloudinary } from "../../../../helper/utils/cloudinary";
import { sendResponse } from "../../../../helper/utils/sendResponse";
import dbConnect from "../../../../lib/db.js";
// import { generateAccessAndRefreshTokens } from "../../../../helper/utils/auth";
import { NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import { Readable } from "stream";
import getRawBody from "raw-body";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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


export async function POST(req) {
  await dbConnect();

  const formData = await req.formData();

  const email = formData.get("email");
  const password = formData.get("password");
  const avatarFile = formData.get("avatar");
  if (!email || !password) {
    return sendResponse(
      false,
      null,
      "All fields are required",
      400
    );
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return sendResponse(
      false,
      null,
      "User with email already exists",
      409
    );
  }

  let avatarUrl = "";

  if (avatarFile && avatarFile.name) {
    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    const filename = `${uuidv4()}-${avatarFile.name}`;
    const filepath = path.join("/tmp", filename);
    await writeFile(filepath, buffer);
    const uploaded = await uploadOnCloudinary(filepath, { secure: true });
    avatarUrl = uploaded?.secure_url;
  }

  const user = await User.create({ email, password, avatar: avatarUrl });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const data = { user: createdUser, accessToken, refreshToken };
  return sendResponse(
    true,
    data,
    "User registered Successfully",
    201
  );
}