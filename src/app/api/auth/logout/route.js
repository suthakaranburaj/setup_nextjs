import { User } from "../../../../models/User.js";
import dbConnect from "../../../../lib/db.js";
import { sendResponse } from "../../../../helper/utils/sendResponse.js";
import { verifyJWT } from "../../../../lib/verify.js";
import { cookies } from "next/headers";

export async function POST(req) {
  await dbConnect();

  // ✅ Get token from cookies (not from inside verifyJWT)
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return sendResponse(false, null, "No token provided", 401);
  }

  // ✅ Decode the token
  const decoded = await verifyJWT(token);
  if (!decoded || !decoded.user) {
    return sendResponse(false, null, "Invalid token", 403);
  }

  // ✅ Clear refreshToken in DB
  await User.findByIdAndUpdate(
    decoded._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  // ✅ Clear cookies
  cookieStore.set("accessToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  cookieStore.set("refreshToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return sendResponse(true, null, "User logged out successfully", 200);
}
