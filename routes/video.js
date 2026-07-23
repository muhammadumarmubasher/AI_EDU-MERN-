const express = require("express");
const router = express.Router();

const Groq = require("groq-sdk");
const OpenAI = require("openai");
const ytdlp = require("yt-dlp-exec");

const fs = require("fs");
const path = require("path");

require("dotenv").config();


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
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



        const audioPath =
        path.join(__dirname, "lecture.mp3");



        // =========================
        // Download YouTube Audio
        // =========================


        await ytdlp(
            youtubeUrl,
            {
                extractAudio:true,
                audioFormat:"mp3",
                output:audioPath
            }
        );




        // =========================
        // Whisper Transcript
        // =========================


        const transcription =
        await openai.audio.transcriptions.create({

            file:
            fs.createReadStream(audioPath),

            model:"whisper-1"

        });



        const transcript =
        transcription.text;



        if(fs.existsSync(audioPath)){
            fs.unlinkSync(audioPath);
        }



        if(!transcript){

            return res.status(400).json({

                success:false,

                message:"Transcript generation failed"

            });

        }




        // =========================
        // Groq Analysis
        // =========================


        const prompt = `

You are an AI educational assistant.

Analyze this lecture transcript.

Generate:

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



        let result;


        try {

            result =
            JSON.parse(
                completion.choices[0].message.content
            );

        }
        catch {

            result={

                summary:
                completion.choices[0].message.content,

                quiz:[],

                explanation:
                completion.choices[0].message.content

            };

        }



        res.json({

            success:true,

            message:"Analysis completed",

            data:{

                summary:result.summary || "",

                quiz:result.quiz || [],

                explanation:result.explanation || ""

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