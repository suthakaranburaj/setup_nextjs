import dbConnect from "../lib/db.js";
import {User} from "../models/User.js";

export default async function Home() {
  await dbConnect();
  const users = await User.find({});

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Users</h1>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user._id} className="p-2 border rounded">
            <p>{user.name}</p>
            <p className="text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
