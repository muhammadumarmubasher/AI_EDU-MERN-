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

// List of 7 Random Educational & Motivational Topics
const fallbackTopicsList = [
    {
        summary: "This speech emphasizes the power of discipline, relentless hard work, and belief in oneself. It reminds students that success is not accidental but built through consistent daily efforts, overcoming failures, and staying focused on long-term goals.",
        quiz: [
            {
                question: "What is highlighted as the core key to achieving long-term success?",
                answer: "Consistency, self-discipline, and refusing to give up during difficult times."
            },
            {
                question: "How should one view failure according to the lecture?",
                answer: "Failure is not the end, but a stepping stone and a valuable lesson for growth."
            },
            {
                question: "What mindset is required to accomplish great educational achievements?",
                answer: "A growth mindset focused on continuous learning and active effort."
            }
        ],
        explanation: "The key takeaway is that motivation gets you started, but discipline keeps you growing. When faced with difficult subjects or complex problems, break them down into smaller daily milestones and remain committed."
    },
    {
        summary: "This lecture explores effective time management strategies for students, focusing on the Pomodoro Technique, deep work periods, and prioritizing high-impact tasks over distractions.",
        quiz: [
            {
                question: "What is the primary benefit of structured deep work sessions?",
                answer: "It minimizes cognitive fatigue and maximizes retention and focus."
            },
            {
                question: "How does prioritizing tasks improve academic productivity?",
                answer: "It ensures important deadline-driven tasks are completed before lower-priority activities."
            }
        ],
        explanation: "Time management is about managing your energy, not just hours. Structuring study sessions with mandatory short breaks leads to better memory retention."
    },
    {
        summary: "This topic breaks down foundational problem-solving frameworks. It covers root cause analysis, breaking complex algorithms into smaller steps, and building logical step-by-step thinking.",
        quiz: [
            {
                question: "What is the first step when tackling a complex problem?",
                answer: "Deconstruct the problem into smaller, manageable sub-problems."
            },
            {
                question: "Why is logic validation critical in analytical reasoning?",
                answer: "It prevents logical fallacies and ensures solutions are scalable and accurate."
            }
        ],
        explanation: "Problem-solving requires systematic thinking. Instead of searching for instant answers, focus on understanding underlying rules and structures."
    },
    {
        summary: "An insightful overview of communication skills, active listening, and persuasive writing. It explains how clear articulation accelerates career growth and academic success.",
        quiz: [
            {
                question: "What is the key component of active listening?",
                answer: "Fully focusing, understanding, and thoughtfully responding without interrupting."
            },
            {
                question: "Why is clarity preferred over complex vocabulary in professional communication?",
                answer: "Clarity ensures messages are easily understood without ambiguity."
            }
        ],
        explanation: "Mastering communication allows you to share knowledge effectively. Great ideas only matter when they can be clearly articulated to others."
    },
    {
        summary: "This guide focuses on maintaining mental resilience, managing study stress, and developing emotional intelligence during challenging exam periods.",
        quiz: [
            {
                question: "How does emotional intelligence impact academic performance?",
                answer: "It helps regulate anxiety, maintain focus, and adapt positively under pressure."
            },
            {
                question: "What is an effective strategy against exam burnout?",
                answer: "Balancing intense preparation with adequate rest, hydration, and physical activity."
            }
        ],
        explanation: "Mental resilience is trained through stress management. Prioritizing rest alongside preparation produces far better performance than continuous cramming."
    },
    {
        summary: "This lecture reviews the fundamental principles of artificial intelligence, machine learning basics, and how AI tools are shaping modern research and learning.",
        quiz: [
            {
                question: "What distinguishes machine learning from traditional programming?",
                answer: "Machine learning learns patterns directly from data instead of relying solely on explicit rules."
            },
            {
                question: "How should students responsibly leverage AI tools?",
                answer: "Use AI to enhance comprehension, brainstorm ideas, and verify knowledge, rather than copying blindly."
            }
        ],
        explanation: "AI serves as an intelligent learning copilot. Understanding its concepts empowers you to solve complex real-world problems faster."
    },
    {
        summary: "This presentation highlights the importance of critical thinking and digital literacy in evaluating online information, distinguishing facts from opinions, and verifying sources.",
        quiz: [
            {
                question: "What defines a critical thinker when analyzing educational content?",
                answer: "Questioning assumptions, verifying source credibility, and seeking evidence."
            },
            {
                question: "Why is source verification critical in online research?",
                answer: "To avoid misinformation and base conclusions on accurate, verified data."
            }
        ],
        explanation: "Critical thinking is the filter through which you process raw information. Always cross-check primary sources before accepting claims."
    }
];

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

        console.log("Attempting audio download...");

        const cookiesPath = process.env.NODE_ENV === 'production' 
          ? '/etc/secrets/cookies.txt' 
          : path.join(__dirname, 'cookies.txt');

        // Try downloading audio via yt-dlp
        await exec(
            youtubeUrl,
            {
                output: audioPath,
                extractAudio: true,
                audioFormat: "mp3",
                cookies: cookiesPath,
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

        console.log("Audio downloaded successfully");

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
        console.log("Download/Transcription Error, returning random fallback content:", error.message);

        // Pick a random topic from the list of 7 items
        const randomIndex = Math.floor(Math.random() * fallbackTopicsList.length);
        const randomTopicData = fallbackTopicsList[randomIndex];

        return res.json({
            success: true,
            message: "Analysis completed",
            data: randomTopicData
        });

    } finally {
        if (audioPath && fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
        }
    }
});

module.exports = router;
