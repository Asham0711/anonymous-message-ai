import connectDB from "@/lib/database";
import UserModel from "@/models/user.model";
import { Message } from "@/models/user.model";

export async function POST(request: Request) {
    await connectDB();
    const { username, content } = await request.json();
    try {
        const user = await UserModel.findOne({ username });
        if(!user){
            return Response.json(
                {success:true, message:'User not found'},
                { status: 404 }
            );
        }

        if(!user.isAcceptingMessages){
            return Response.json(
                { success: false, message: 'User is not accepting messages' },
                { status: 403 } // 403 Forbidden status
            );
        }

        const newMessage = { content, createdAt: new Date() };

        user.messages.push(newMessage as Message);
        await user.save();

        return Response.json(
            { success: true, message: 'Message sent successfully' },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error adding message:', error);
        return Response.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}