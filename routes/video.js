const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const { Innertube } = require("youtubei.js");

require("dotenv").config();


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});



router.post("/analyze", async (req, res) => {

    try {

        const { youtubeUrl } = req.body;


        if (!youtubeUrl) {
            return res.status(400).json({
                success:false,
                message:"YouTube URL required"
            });
        }



        // =========================
        // Extract Video ID
        // =========================

        const videoId =
            youtubeUrl.includes("youtu.be")
            ? youtubeUrl.split("/").pop().split("?")[0]
            : new URL(youtubeUrl).searchParams.get("v");



        if(!videoId){

            return res.status(400).json({
                success:false,
                message:"Invalid YouTube URL"
            });

        }



        // =========================
        // Get Transcript
        // =========================

        let transcript = "";


        try {


            const youtube = await Innertube.create();


            const info =
            await youtube.getInfo(videoId);



            const captions =
            info.captions;



            if(!captions){

                throw new Error(
                    "No captions available"
                );

            }



            const track =
            captions.getDefault();


            const caption =
            await track.get();



            transcript =
            caption
            .map(item => item.text)
            .join(" ");



        } catch(error){


            console.log(
                "Transcript Error:",
                error.message
            );


            return res.status(400).json({

                success:false,

                message:
                "This video does not have captions/transcript available"

            });


        }





        // =========================
        // Groq AI
        // =========================


        const prompt = `

You are an AI educational assistant.

Analyze this YouTube lecture transcript.

Create:

1. Short summary
2. Three quiz questions with answers
3. Simple explanation


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


Transcript:

${transcript.substring(0,12000)}

`;




        const completion =
        await groq.chat.completions.create({

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


        try{

            result =
            JSON.parse(aiText);

        }
        catch(error){

            result={

                summary:aiText,

                quiz:[],

                explanation:aiText

            };

        }





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



    }
    catch(error){

        console.log(
            "Analyzer Error:",
            error.message
        );


        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});



module.exports = router;