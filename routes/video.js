const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const { YoutubeTranscript } = require("youtube-transcript");

require("dotenv").config();


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});



router.post("/analyze", async (req, res) => {

    try {

        const { youtubeUrl, option = "all" } = req.body;


        if (!youtubeUrl) {
            return res.status(400).json({
                success: false,
                message: "YouTube URL required"
            });
        }



        // =========================
        // Get YouTube Transcript
        // =========================

        let transcript = "";


        try {

            const data = await YoutubeTranscript.fetchTranscript(youtubeUrl);


            transcript = data
                .map(item => item.text)
                .join(" ");


        } catch (error) {

            console.log(
                "Transcript unavailable:",
                error.message
            );


            // Fallback if transcript missing

            transcript = `
            This is an educational YouTube lecture.
            Analyze this lecture topic and provide useful
            learning material.

            Video URL:
            ${youtubeUrl}
            `;

        }




        // =========================
        // Groq AI Prompt
        // =========================

        const prompt = `

You are an AI educational assistant.

Analyze this lecture content and create study material.

Generate:

- Short summary
- 3 quiz questions with answers
- Simple explanation


Return ONLY JSON:

{
"summary":"",
"quiz":[
{
"question":"",
"answer":""
}
],
"explanation":""
}


Lecture Content:

${transcript.substring(0,12000)}

`;





        // =========================
        // Groq Request
        // =========================


        const completion =
        await groq.chat.completions.create({

            model: "llama-3.1-8b-instant",

            messages:[

                {
                    role:"user",
                    content:prompt
                }

            ],

            temperature:0.3

        });





        let aiText =
        completion.choices[0].message.content;





        let result;



        try {

            result = JSON.parse(aiText);


        } catch(error) {


            result = {

                summary: aiText,

                quiz: [],

                explanation: aiText

            };

        }





        // =========================
        // Response
        // =========================


        res.json({

            success:true,

            message:"Analysis completed",

            data:{

                summary:
                result.summary || "",


                quiz:
                result.quiz || [],


                explanation:
                result.explanation || ""

            }

        });



    } catch(error) {


        console.log(
            "Analyzer Error:",
            error
        );


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});



module.exports = router;