/* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth";
import { AuthOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/models/user.model";
import connectDB from "@/lib/database";
import { User } from "next-auth";

export async function POST(request : Request) {
    await connectDB();

    const session = await getServerSession(AuthOptions);
    if(!session || !session.user){
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }
    const user: User = session?.user;

    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessages: acceptMessages },
            { new: true }
        );
        if(!updatedUser){
            return Response.json(
                { success: false, message: 'Unable to find user to update message acceptance status' },
                { status: 404 }
            );
        }

        return Response.json(
            { success: true, message: 'Message acceptance status updated successfully', updatedUser },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error updating message acceptance status' },
            { status: 500 }
        );
    }

}

export async function GET(request : Request) {
    await connectDB();

    const session = await getServerSession(AuthOptions);
    if(!session || !session.user){
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }
    const user: User = session?.user;

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);
        if(!foundUser){
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return Response.json(
            { success: true, isAcceptingMessages: foundUser.isAcceptingMessages, },
            { status: 200 }
        );
        
    } catch (error) {
        console.error('Error retrieving message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error retrieving message acceptance status' },
            { status: 500 }
        );
    }
}