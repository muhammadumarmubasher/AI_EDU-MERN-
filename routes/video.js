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
                success:false,
                message:"YouTube URL required"
            });
        }



        // Fetch YouTube Transcript

        let transcript = "";

        try {

            const data = await YoutubeTranscript.fetchTranscript(youtubeUrl);

            transcript = data
                .map(item => item.text)
                .join(" ");

        } catch(error) {

            return res.status(400).json({

                success:false,

                message:
                "Transcript not available for this video"

            });

        }



        if(!transcript){

            return res.status(400).json({

                success:false,

                message:"No transcript found"

            });

        }



        // AI Prompt

        const prompt = `

You are an AI educational assistant.

Analyze this YouTube lecture transcript.

Generate:

1. A short summary
2. Three quiz questions with answers
3. Simple explanation


Return ONLY JSON.

Format:

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


Transcript:

${transcript.substring(0,12000)}

`;




        const completion = await groq.chat.completions.create({

            model:"llama-3.1-8b-instant",

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

                quiz:[],

                explanation: aiText

            };

        }





        // Return same format frontend expects

        res.json({

            success:true,

            message:"Analysis completed",

            data:{

                summary: result.summary || "",

                quiz: result.quiz || [],

                explanation: result.explanation || ""

            }

        });




    } catch(error) {


        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});



module.exports = router;