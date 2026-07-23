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


        // Get transcript
        let transcriptText = "";

        try {

            const transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl);

            transcriptText = transcript
                .map(item => item.text)
                .join(" ");

        } catch(error) {

            return res.status(400).json({
                success:false,
                message:"Unable to fetch YouTube transcript. Try another video."
            });

        }



        if(!transcriptText){

            return res.status(400).json({
                success:false,
                message:"No transcript found."
            });

        }



        const prompt = `

You are an educational AI assistant.

Analyze this lecture transcript:

${transcriptText.substring(0,12000)}


Return ONLY valid JSON.

Format:

{
"summary":"short lecture summary",
"quiz":[
{
"question":"question",
"answer":"answer"
}
],
"explanation":"simple explanation"
}

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



        const aiResponse =
        completion.choices[0].message.content;



        let result;


        try{

            result = JSON.parse(aiResponse);

        }
        catch{

            result = {

                summary:aiResponse,

                quiz:[],

                explanation:aiResponse

            };

        }



        res.json({

            success:true,

            message:"Analysis completed",

            data:result

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