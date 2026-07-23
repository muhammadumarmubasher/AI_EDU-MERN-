const express = require("express");
const router = express.Router();

const Groq = require("groq-sdk");
const { YoutubeTranscript } = require("youtube-transcript");

require("dotenv").config();


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});



router.post("/analyze", async (req,res)=>{

    try{

        const { youtubeUrl } = req.body;


        if(!youtubeUrl){

            return res.status(400).json({
                success:false,
                message:"YouTube URL required"
            });

        }



        let transcript;


        try{

            const data =
            await YoutubeTranscript.fetchTranscript(youtubeUrl);


            transcript =
            data.map(item=>item.text).join(" ");


        }
        catch(error){

            return res.status(400).json({

                success:false,

                message:
                "This video does not have captions. Please use a video with subtitles."

            });

        }



        const prompt = `

You are an AI educational assistant.

Analyze this lecture transcript.

Create:

1. Short summary
2. Three quiz questions with answers
3. Simple explanation


Return only JSON:

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


        try{

            result =
            JSON.parse(
                completion.choices[0].message.content
            );

        }
        catch{

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

                summary:result.summary,

                quiz:result.quiz,

                explanation:result.explanation

            }

        });



    }
    catch(error){

        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});


module.exports = router;