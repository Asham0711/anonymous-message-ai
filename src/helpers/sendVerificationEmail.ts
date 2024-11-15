import { resend } from "@/lib/resend";
import VerificationEmail from "../../email/VerificationEmail";
import { ApiResponse } from "@/types/apiResponse";

export async function sendVerificationEmail(
    email:string,
    username:string,
    verifyCode:string
) : Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Anonymous Message | Verification Code',
            react: VerificationEmail({username, otp:verifyCode}),
        });
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