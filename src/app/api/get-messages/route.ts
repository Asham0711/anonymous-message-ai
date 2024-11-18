/* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth";
import { AuthOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/models/user.model";
import connectDB from "@/lib/database";
import { User } from "next-auth";
import mongoose from "mongoose";

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
    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const currUser = await UserModel.aggregate([
            { $match: { id: userId} },
            { $unwind: "$messages" },
            { $sort: { 'messageSchema.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } },
        ]).exec();

        if (!currUser || currUser.length === 0) {
            return Response.json(
                { message: 'User not found', success: false },
                { status: 404 }
            );
        }

        return Response.json(
            { success:true, messages: currUser[0].messages },
            { status: 200 }
        );

    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );
    }   
}