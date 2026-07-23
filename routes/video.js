const express = require("express");
const router = express.Router();

const OpenAI = require("openai");
const Groq = require("groq-sdk");
const { exec } = require("youtube-dl-exec");
const fs = require("fs");
const path = require("path");

require("dotenv").config();


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});



router.post("/analyze", async (req,res)=>{

try{

const {youtubeUrl}=req.body;


if(!youtubeUrl){
return res.status(400).json({
success:false,
message:"YouTube URL required"
});
}


// Download audio

const audioPath =
path.join(__dirname,"audio.mp3");


await exec(
youtubeUrl,
{
extractAudio:true,
audioFormat:"mp3",
output:audioPath
}
);



// Whisper transcription

const transcription =
await openai.audio.transcriptions.create({

file: fs.createReadStream(audioPath),

model:"whisper-1"

});


const transcript =
transcription.text;



if(!transcript){

return res.status(400).json({
success:false,
message:"Transcript generation failed"
});

}



// Groq Analysis

const prompt = `

Analyze this lecture.

Create:

1. Summary
2. Three quiz questions with answers
3. Simple explanation


Return JSON:

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


module.exports=router;