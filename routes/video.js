const express = require("express");
const router = express.Router();

const Groq = require("groq-sdk");
const OpenAI = require("openai");
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



        // =========================
        // Download Audio
        // =========================


        const audioPath =
        path.join(__dirname, "audio.mp3");



        const audioStream =
        ytdl(youtubeUrl, {

            filter:"audioonly",
            quality:"highestaudio"

        });



        const writeStream =
        fs.createWriteStream(audioPath);



        audioStream.pipe(writeStream);



        await new Promise((resolve, reject)=>{

            writeStream.on("finish", resolve);

            writeStream.on("error", reject);

        });





        // =========================
        // Whisper Transcription
        // =========================


        const transcription =
        await openai.audio.transcriptions.create({

            file:
            fs.createReadStream(audioPath),

            model:"whisper-1"

        });



        const transcript =
        transcription.text;



        if(!transcript){

            return res.status(400).json({

                success:false,

                message:"Transcript could not be generated"

            });

        }




        // Remove audio file

        fs.unlinkSync(audioPath);





        // =========================
        // Groq AI Analysis
        // =========================


        const prompt = `

You are an AI educational assistant.

Analyze this lecture transcript.

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


        try {

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