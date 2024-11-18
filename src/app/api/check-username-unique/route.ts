import {z} from 'zod';
import UserModel from '@/models/user.model';
import connectDB from '@/lib/database';
import { userNameValidation } from '@/schema/signUpSchema';

const UsernameQuerySchema = z.object({
    username: userNameValidation
});

export async function GET(request: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username')
        }

        const result = UsernameQuerySchema.safeParse(queryParams);

        console.log("Result of unique username --> ", result);

        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json(
                {
                    success:false,
                    message:usernameErrors.length > 0 ?
                            usernameErrors.join(', ')
                            : 'Invalid username.... Please provide other'
                },
                {status: 400}
            );
        }

        const {username} = result.data;

        const existingUser = await UserModel.findOne({
            username,
            isVerified:true    
        });

        if(existingUser){
            return Response.json(
                {
                    success:false,
                    message:"Username is already taken"
                },
                {status:401}
            )
        }

        return Response.json(
            {
                success:true,
                message:"Username is unique"
            },
            {status:200}
        )

    } catch (error) {
        console.log("Error while validating username --> ", error);
        return Response.json(
            {
                success:false,
                message:"Error while validating username"
            },
            {status:500}
        )
    }
}