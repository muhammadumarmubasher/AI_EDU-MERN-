const express = require("express");
const router = express.Router();

router.post("/analyze", async (req, res) => {

    try {

        const { youtubeUrl, option = "all" } = req.body;


        if (!youtubeUrl) {
            return res.status(400).json({
                success:false,
                message:"YouTube URL required"
            });
        }


        res.json({

            success:true,

            message:"Analysis completed",

            data:{

                url: youtubeUrl,

                feature: option,


                summary:
                "This lecture explains the basic concepts of Artificial Intelligence, machine learning and how modern systems use data to solve problems. AI helps computers perform tasks that normally require human intelligence.",



                quiz:[

                    {
                        question:"What is Artificial Intelligence?",
                        answer:"AI is the simulation of human intelligence in machines."
                    },

                    {
                        question:"Why is data important in AI?",
                        answer:"Data helps AI models learn patterns and make predictions."
                    },

                    {
                        question:"What is machine learning?",
                        answer:"Machine learning is a technique where computers learn from data."
                    }

                ],



                explanation:
                "Artificial Intelligence enables machines to analyze information, learn from experience and make decisions. Machine learning is one of the major branches of AI."

            }

        });


    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

});


module.exports = router;