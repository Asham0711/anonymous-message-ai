import nodemailer from 'nodemailer';
import { ApiResponse } from '@/types/apiResponse';
import otpTemplate from '../../email/SendVerificationEmail'

export async function sendVerificationEmail(
    email:string,
    username:string,
    verifyCode:string
) : Promise<ApiResponse> {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
            secure:false,
        });


        const mailOptions = {
            from: `"AshMessage | Md Asham Imad" <${process.env.MAIL_USER}>`, // sender address
            to: email,
            subject: 'Anonymous Message | Verification Code',
            html: otpTemplate({otp:verifyCode, username:username})
        }
        const mailresponse = await transporter.sendMail(mailOptions);
        console.log(mailresponse.response);
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