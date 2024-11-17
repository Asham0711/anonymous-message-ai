/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from "@/lib/database";
import UserModel from "@/models/user.model";
import { verifySchema } from "@/schema/verifySchema";

export async function POST(request: Request) {
  // Connect to the database
  await connectDB();

  try {
    const { username, code } = await request.json();
    try {
      verifySchema.parse({ code });
    } catch (error: any) {
        return Response.json(
          {
            success: false,
            message: "Validation error",
            errors: error.errors, // Provide validation details
          },
          { status: 400 }
        );
    }
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the code is correct and not expired
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      // Update the user's verification status
      await UserModel.updateOne(
        { username: decodedUsername },
        {
          $set: { isVerified: true },
          $unset: { verifyCode: "", verifyCodeExpiry: "" }, // Remove fields
        }
      );
      return Response.json(
        { success: true, message: 'Account verified successfully' },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      // Code has expired
      return Response.json(
        {
          success: false,
          message:
            'Verification code has expired. Please sign up again to get a new code.',
        },
        { status: 400 }
      );
    } else {
      // Code is incorrect
      return Response.json(
        { success: false, message: 'Incorrect verification code' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return Response.json(
      { success: false, message: 'Error verifying user' },
      { status: 500 }
    );
  }
}