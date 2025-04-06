import dbConnect from "../../../lib/db.js";
import {User} from "../../../models/User.js";

export async function GET() {
  await dbConnect();
  const users = await User.find({});
  return Response.json(users);
}

export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  const newUser = await User.create(body);
  return Response.json(newUser);
}
