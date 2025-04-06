import { User } from "../../../../models/User.js";
import { asyncHandler } from "../../../../helper/utils/asyncHandler";
import { sendResponse } from "../../../../helper/utils/sendResponse.js";
import { generateAccessAndRefreshTokens } from "../../../../helper/utils/auth";

export default asyncHandler(async (req, res) => {
  if (req.method !== "POST") {
    return sendResponse(res, 405, false, "Method not allowed");
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return sendResponse(res, 404, false, "User not found");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return sendResponse(res, 401, false, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  res.setHeader("Set-Cookie", [
    `accessToken=${accessToken}; HttpOnly; Secure; Path=/; SameSite=Strict`,
    `refreshToken=${refreshToken}; HttpOnly; Secure; Path=/; SameSite=Strict`,
  ]);

  return sendResponse(
    res,
    200,
    true,
    { user: { ...user._doc, password: undefined }, accessToken, refreshToken },
    "Login successful"
  );
});
