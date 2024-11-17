/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from "@/lib/database";
import UserModel from "@/models/user.model";
import bcrypt from 'bcryptjs';
// import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import otpGenerator from 'otp-generator';
import { signUpSchema } from "@/schema/signUpSchema";
import { sendVerificationEmail } from "@/helpers/mailer";

export async function POST(request: Request) {
    await connectDB();
    try {
        const body = await request.json();
        const parsedData = signUpSchema.parse(body);
        const { username, email, password } = parsedData;


        //finding account if exist and verifed
        const verifiedUser = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if(verifiedUser){
            return Response.json(
                {
                    success: false,
                    message: 'Username is already taken',
                },
                { status: 400 }
            );
        }

        //finding account based on email just to check whether user exist or not
        const existingUser = await UserModel.findOne({email});
        //generating 6 digit otp by using otp-generator npm package
        const verifyCode = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false,})

        if(existingUser){
            if(existingUser.isVerified){
                return Response.json(
                    {
                        success: false,
                        message: 'User already exists with this email',
                    },
                    { status: 400 }
                );
            }else{
                //hashing the password using bcryptjs
                const hashedPassword = await bcrypt.hash(password,10);
                existingUser.password = hashedPassword;
                existingUser.verifyCode = verifyCode;
                existingUser.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUser.save();
            }
        }else{
            const hashedPassword = await bcrypt.hash(password,10);
            //creating expiry date for otp
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            });
            await newUser.save();
        }

        //sending otp for verification purpose
        const emailResponse = await sendVerificationEmail(email,username,verifyCode);
        console.log("Email is sending to -->", email)
        //if there is error while sending mail
        if(!emailResponse.success){
            return Response.json(
                {
                    success:false,
                    message: emailResponse.message
                },
                {status:401}
            );
        }
        console.log("Email -> ", emailResponse);


        return Response.json(
            {
                success:true,
                message:"User registered succesfully... Please verify your account"
            },
            {status:200}
        )

    } catch (error:any) {
        console.log("Error while Signing up --> ", error);

        if (error.name === "ZodError") {
            return Response.json(
                {
                    success: false,
                    message: "Validation error",
                    errors: error.errors, // Detailed validation errors
                },
                { status: 400 }
            );
        }

        return Response.json(
            {
                success:false,
                message:"Error while signing up"
            },
            {status:500}
        )
    }
}