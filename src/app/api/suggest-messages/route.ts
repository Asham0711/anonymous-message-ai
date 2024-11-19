/* eslint-disable @typescript-eslint/no-unused-vars */
import { generateContent } from "@/lib/googleGenerative";

export async function POST(req: Request){
    const prompt: string = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment. And try to give unique questions every time asked";
    try {
        const response = await generateContent(prompt);
        if(!response){
            return Response.json(
                {success:false, message:'Gemini Error'},
                {status: 400}
            )
        };

        return Response.json(
            {success:true, message:'Message suggested successfully', response},
            {status: 200}
        )
    } catch (error) {
        console.log("Error while sugggesting messages from gemini: ", error);
        return Response.json(
            {success:false, message:'Error while sugggesting messages from gemini'},
            {status: 500}
        )
    }
}