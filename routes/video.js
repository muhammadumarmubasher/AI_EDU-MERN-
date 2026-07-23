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

router.post("/analyze", async (req, res) => {
    let audioPath = "";

    try {
        const { youtubeUrl } = req.body;

        if (!youtubeUrl) {
            return res.status(400).json({
                success: false,
                message: "YouTube URL required"
            });
        }

        audioPath = path.join(
            __dirname,
            `audio-${Date.now()}.mp3`
        );

        console.log("Downloading audio...");

        // Render Secret File Path
        const cookiesPath = process.env.NODE_ENV === 'production' 
          ? '/etc/secrets/cookies.txt' 
          : path.join(__dirname, 'cookies.txt');

        await exec(
            youtubeUrl,
            {
                output: audioPath,
                extractAudio: true,
                audioFormat: "mp3",
                cookies: cookiesPath, // <--- Cookies Added
                noWarnings: true,
                noCheckCertificates: true,
                preferFreeFormats: true,
                addHeader: [
                    "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                ]
            }
        );

        if (!fs.existsSync(audioPath)) {
            throw new Error("Audio download failed");
        }

        console.log("Audio downloaded");

        const whisper = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-1"
        });

        const transcript = whisper.text;

        if (!transcript) {
            throw new Error("Transcript generation failed");
        }

        const prompt = `
You are an educational AI assistant.
Analyze this lecture.
Return ONLY valid JSON.

Format:
{
  "summary": "",
  "quiz": [
    {
      "question": "",
      "answer": ""
    }
  ],
  "explanation": ""
}

Transcript:
${transcript.substring(0, 10000)}
`;

        const aiResponse = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.2
        });

        let text = aiResponse.choices[0].message.content;

        // remove markdown json
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let result;

        try {
            result = JSON.parse(text);
        } catch {
            result = {
                summary: text,
                quiz: [],
                explanation: text
            };
        }

        return res.json({
            success: true,
            message: "Analysis completed",
            data: result
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (audioPath && fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
        }
    }
});

module.exports = router;
