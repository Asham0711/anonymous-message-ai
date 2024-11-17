import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/apiResponse";
import { VerificationEmail } from "../../email/VerificationEmail";

export async function sendVerificationEmail(
    email:string,
    username:string,
    verifyCode:string
) : Promise<ApiResponse> {
    try {
        const {data,error} = await resend.emails.send({
            from: 'ashmessage.example.com',
            to: email,
            subject: 'Anonymous Message | Verification Code',
            react: VerificationEmail({username, otp:verifyCode}),
        });
        if(error){
            console.log("Error --> ", error);
        }
        console.log("Data --> ", data);
        return{
            success:true,
            message:"Email sent successfully"
        }; 
    } catch (emailError) {
        console.log("Error while sending mail --> ", emailError);
        return{
            success:false,
            message:"Error while sending mail"
        };
    }
}