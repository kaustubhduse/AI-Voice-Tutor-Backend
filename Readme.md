# SpeakGenie Backend

**SpeakGenie** is a Node.js backend API that acts as a voice-based English tutor for children. Users can send audio recordings, which are transcribed and processed by an AI model (Together AI) to generate intelligent responses.

---

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Features](#features)  
3. [Project Flow](#project-flow)  
4. [Requirements](#requirements)  
5. [Installation](#installation)  
6. [Environment Variables](#environment-variables)  
7. [Running the Project Locally](#running-the-project-locally)  
8. [API Endpoints](#api-endpoints)  
9. [Deployment](#deployment)  
10. [Project Structure](#project-structure)  
11. [Diagram](#diagram)

---

## Project Overview

The backend allows children to interact with an AI English tutor through voice. The main workflow:

1. Receive audio file from the frontend.  
2. Convert audio to WAV format.  
3. Transcribe audio into text using Whisper model via Together AI.  
4. Generate AI response based on mode (`free-chat` or `roleplay`) using Together AI.  
5. Return both user text and AI response to the frontend.  

---

## Features

- Audio upload and processing
- Audio → WAV conversion
- Speech-to-text transcription
- AI response generation with roleplay support
- Chat history management
- Serverless-ready structure (optional)
- Error handling and cleanup of temporary files

---

## Project Flow

1. **Frontend** → Sends audio + metadata (`mode`, `roleplayTopic`) to backend `/api/chat`.  
2. **Express Route** → `chatRoutes.js` handles `/chat` POST request using `multer` to parse audio.  
3. **Controller** → `chatController.js` orchestrates:  
   - Audio conversion (`audioService.js`)  
   - Transcription (`transcriptionService.js`)  
   - AI response (`aiService.js`)  
   - File cleanup (`cleanup.js`)  
4. **Response** → Returns JSON with `userText` and `aiReply`.

---

## Requirements

- Node.js v18+
- npm
- FFmpeg installed locally (if using local ffmpeg)
- Together AI API key
- Internet connection (for Together AI API calls)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/kaustubhduse/AI-Voice-Tutor-Backend
cd backend

# Install dependencies
npm install
````

---

## Environment Variables

Create a `.env` file in the root:

```env
TOGETHER_API_KEY=your_together_ai_key_here
```

---

## Running the Project Locally

```bash
node server.js
```

Backend will run at: `http://localhost:3001`

---

## API Endpoints

### POST `/api/chat`

Send audio to the backend for transcription and AI response.

**Form Data Parameters**:

* `audio`: File (audio)
* `mode`: `"free-chat"` or `"roleplay"`
* `roleplayTopic`: `"At School" | "At Home" | "At the Store"`

**Response**:

```json
{
  "userText": "Hello",
  "aiReply": "Hi! How are you today? 😊"
}
```

---

### GET `/api/chat`

Check if the API is running.

**Response**:

```json
{
  "message": "Chat API is running. Use POST to send audio."
}
```

---

## Deployment

I have deployed on platform **Render**.
**Render Deployment Steps**:

1. Push your repo to GitHub.
2. Create a new Web Service on Render.
3. Connect GitHub repo.
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Set environment variable `TOGETHER_API_KEY`.
7. Deploy.

---


---

## Diagram

```
Frontend (React)  ---> POST /api/chat
        |
        v
Express Route (chatRoutes.js)
        |
        v
Controller (chatController.js)
   |       |       |
   v       v       v
audioService -> transcriptionService -> aiService
        |
        v
     Cleanup (delete temp files)
        |
        v
     Response JSON
```


* **Audio** → Converted to WAV → Transcribed → AI response → Returned
* Supports multiple chat modes and roleplay topics
* Keeps a small session-based chat history


## Audio Workflow Diagram

```

User (Frontend)
      |
      |  Uploads audio (webm)
      v
   [Express API: /api/chat]
      |
      |  Multer Middleware
      |  (temporarily stores audio in uploads/)
      v
  Temporary Audio File
      |
      |  convertToWav()  (ffmpeg converts to WAV)
      v
  Converted WAV File
      |
      |  transcribeAudio()  (Whisper/Together AI)
      v
  User Text (string)
      |
      |  generateAIResponse()  (Together AI model)
      v
  AI Response Text
      |
      |  Send back to frontend
      v
User (Frontend)
      |
      |  deleteFile()  (cleanup uploaded + converted files)
      v
Temporary storage cleared


```

## Functionality Overview

This project is a voice-based AI English tutor for children. The system captures the child’s voice, understands it, generates a response, and speaks back in a friendly, age-appropriate manner.

| Functionality       | Current Implementation                     |
|--------------------|-------------------------------------------|
| Listen             | `MediaRecorder` (Web Audio API)           |
| Speech-to-Text     | Together AI Whisper                        |
| AI Response        | Together AI GPT (Mixtral model)           |
| Text-to-Speech     | Browser TTS (`speechSynthesis`)           |

### How It Works

1. **Listen**: The frontend captures the child’s voice using the browser’s microphone.
2. **Speech-to-Text**: The recorded audio is sent to Together AI Whisper API to convert speech into text.
3. **AI Response**: The transcribed text is sent to Together AI GPT (Mixtral model) which generates a friendly, context-aware reply.
4. **Text-to-Speech**: The AI-generated text is converted back to speech using the browser’s built-in TTS (`speechSynthesis`) for the child to hear.


---

