import { User } from "../../../../models/User";
import { asyncHandler } from "../../../../helper/utils/asyncHandler.js";
import { sendResponse } from "../../../../helper/utils/sendResponse.js";
import jwt from "jsonwebtoken";

export default asyncHandler(async (req, res) => {
  if (req.method !== "POST") {
    return sendResponse(res, 405, false, "Method not allowed");
  }

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded.userId);

    if (!user || incomingRefreshToken !== user.refreshToken) {
      return sendResponse(res, 401, false, "Invalid refresh token");
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
      { accessToken, refreshToken },
      "Token refreshed"
    );
  } catch (error) {
    return sendResponse(res, 401, false, error.message);
  }
});
