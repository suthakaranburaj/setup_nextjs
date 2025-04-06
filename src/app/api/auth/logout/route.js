import { User } from "../../../../models/User.js";
import { asyncHandler } from "../../../../helper/utils/asyncHandler.js";
import { sendResponse } from "../../../../helper/utils/sendRespone.js";
import { verifyJWT } from "../../../../lib/verify.js";

export default asyncHandler(async (req, res) => {
  if (req.method !== "POST") {
    return sendResponse(res, 405, false, "Method not allowed");
  }

  await verifyJWT(req, res, async () => {
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: 1 } });

    res.setHeader("Set-Cookie", [
      "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      "refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    ]);

    return sendResponse(res, 200, true, {}, "Logged out successfully");
  });
});
