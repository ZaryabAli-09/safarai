import { dbConnect } from "@/lib/db";
import { response } from "@/lib/helperFunctions";
import { User } from "@/models/User";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  params: { params: { userid: string } }
) {
  try {
    const { userid } = await params.params;
    if (!userid) {
      return response(false, 400, "User id not found");
    }

    await dbConnect();
    const user = await User.findById(userid).select("username email gender");

    if (!user) {
      return response(false, 400, "User not found unauthorized request");
    }

    return response(true, 200, "User get successfully", user);
  } catch (error) {
    console.error(error);
    return response(false, 500, "Something went wrong");
  }
}
