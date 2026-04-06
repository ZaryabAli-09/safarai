import { dbConnect } from "@/lib/db";
import { response } from "@/lib/helperFunctions";
import { User } from "@/models/User";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  params: { params: { userid: string } },
) {
  try {
    const { userid } = await params.params;
    const body = await req.json();

    if (!userid) {
      return response(false, 400, "User id not found");
    }

    // Only allow updates to specific fields
    const ALLOWED_FIELDS = ["username", "gender", "dob"];
    const filteredBody = Object.fromEntries(
      Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key)),
    );

    if (Object.keys(filteredBody).length === 0) {
      return response(false, 400, "No valid fields to update");
    }

    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      userid,
      // $set is a MongoDB operator.
      // It tells MongoDB to only update the specified fields without touching the rest.
      { $set: filteredBody },
      {
        // By default, findByIdAndUpdate (and similar update methods) return the old document (before update).Setting new: true makes it return the updated document.
        new: true,
        // By default, Mongoose does not run schema validation on updates (only on .save() during creation).
        // Adding runValidators: true ensures that the fields you update still respect your schema rule
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return response(false, 404, "User not found");
    }

    return response(true, 200, "User updated successfully", updatedUser);
  } catch (error) {
    return response(false, 500, "Something went wrong");
  }
}
