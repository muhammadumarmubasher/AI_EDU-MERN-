# 🎓 AI Powered Educational System

<p align="center">

<b>An AI Based Smart Learning Platform Built with MERN Stack</b>

</p>

<p align="center">

![React](https://img.shields.io/badge/Frontend-React.js-blue?style=for-the-badge&logo=react)

![Node](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)

![Express](https://img.shields.io/badge/API-Express.js-black?style=for-the-badge&logo=express)

![MongoDB](https://img.shields.io/badge/Database-MongoDB-success?style=for-the-badge&logo=mongodb)

![AI](https://img.shields.io/badge/AI-Groq%20Llama-orange?style=for-the-badge)

</p>


---

# 📌 Project Description

AI Powered Educational System is an intelligent learning platform that uses Artificial Intelligence to improve the learning experience of students.

The system allows users to analyze educational videos, extract important information, generate summaries, create quizzes, and get AI-powered explanations.

The main purpose of this project is to provide a smart, interactive, and personalized learning environment.


---

# 🌐 Live Application

🚀 **Live URL**

https://ai-edu-mern.onrender.com


---

# 🎯 Project Goals

| Goal | Description |
|---|---|
| Smart Education | Provide AI assisted learning |
| Video Analysis | Convert lectures into learning material |
| Automation | Generate summaries and quizzes automatically |
| Better Understanding | Explain complex topics easily |


---

# ✨ Features


## 🔐 Authentication System

| Feature | Description |
|---|---|
| User Registration | Create new account |
| User Login | Secure login system |
| JWT Authentication | Secure user sessions |
| Password Security | bcrypt password hashing |


---

## 🎥 AI Video Analyzer

| Feature | Description |
|---|---|
| YouTube URL Input | User provides lecture link |
| Transcript Extraction | Extract lecture transcript |
| AI Processing | Analyze educational content |
| Summary Generator | Generate lecture summaries |
| Quiz Generator | Create questions and answers |
| Explanation System | Explain difficult concepts |


---

# 🛠️ Technology Stack


## Frontend

| Technology | Purpose |
|---|---|
| React.js | User Interface |
| JavaScript | Application Logic |
| HTML5 | Web Structure |
| CSS3 | Styling |
| Axios | API Requests |
| React Router | Navigation |


---

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Server Runtime |
| Express.js | Backend Framework |
| REST API | Communication |
| JWT | Authentication |
| bcryptjs | Password Encryption |


---

## Database

| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud Database |
| Mongoose | Database Modeling |


---

## Artificial Intelligence

| Technology | Purpose |
|---|---|
| Groq API | AI Integration |
| Llama Model | Text Generation |
| YouTube Transcript API | Transcript Extraction |


---

# 🏗️ System Architecture

                USER

                  |

                  |

          React Frontend

                  |

                  |

          Express REST API

                  |

                  |

          Node.js Backend

          /             \

         /               \

 MongoDB Atlas        Groq AI

   Database          Llama Model



---

# 🔌 API Documentation


## Authentication APIs


| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |


---

## AI APIs


| Method | Endpoint | Description |
|---|---|---|
| POST | /api/video/analyze | Analyze video using AI |


Example Request:

```json
{
 "youtubeUrl":"youtube_video_url",
 "option":"summary",
 "question":"Explain this topic"
}