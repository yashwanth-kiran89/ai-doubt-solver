# AI Doubt Solver

A full-stack AI-powered learning platform that helps students solve academic doubts using text, image, and voice inputs. The platform delivers instant AI-generated explanations through an interactive conversational interface. Based on the uploaded project structure and specifications. 

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Architecture](#architecture)
* [Project Structure](#project-structure)
* [Installation](#installation)
* [Environment Variables](#environment-variables)
* [Running the Project](#running-the-project)
* [API Endpoints](#api-endpoints)
* [Testing](#testing)
* [Deployment](#deployment)
* [Common Issues](#common-issues)
* [Future Enhancements](#future-enhancements)
* [Author](#author)
* [License](#license)

---

# Overview

AI Doubt Solver enables students to interact with an AI tutor using:

* Text-based questions
* Image uploads
* Voice recordings

The application processes user input using AI services and returns detailed explanations with conversational context support.

---

# Features

## Authentication System

* JWT-based authentication
* Secure login and registration
* Protected routes
* Persistent sessions

## AI Chat System

* Real-time AI conversations
* Context-aware responses
* Markdown-supported answers
* Conversation history management

## Image-Based Doubt Solving

* Upload academic problem images
* AI-powered image analysis
* OCR + reasoning support

## Voice-Based Doubt Solving

* Speech-to-text transcription
* Voice question submission
* AI-generated responses

## Doubt History

* View previously solved doubts
* Track learning progress
* Delete or manage doubts

## Smart Features

* Automatic subject detection
* Responsive UI
* Optimistic UI updates
* Mobile-friendly design

---

# Tech Stack

## Frontend

| Technology       | Purpose            |
| ---------------- | ------------------ |
| React 18         | Frontend library   |
| Vite             | Build tool         |
| Tailwind CSS     | Styling            |
| Axios            | API communication  |
| React Router DOM | Routing            |
| React Markdown   | Markdown rendering |
| Lucide React     | Icons              |
| React Hot Toast  | Notifications      |

---

## Backend

| Technology    | Purpose             |
| ------------- | ------------------- |
| Node.js       | Runtime environment |
| Express.js    | Backend framework   |
| MongoDB Atlas | Database            |
| Mongoose      | ODM                 |
| JWT           | Authentication      |
| bcryptjs      | Password hashing    |
| Multer        | File uploads        |

---

## AI Services

| Service     | Purpose            |
| ----------- | ------------------ |
| Groq Cloud  | AI text generation |
| Groq Vision | Image analysis     |
| AssemblyAI  | Speech-to-text     |

---

# Architecture

```text
Client (React + Vite)
        |
        v
Express REST API
        |
        +------------------+
        |                  |
        v                  v
MongoDB Atlas         AI Services
                      - Groq API
                      - AssemblyAI
```

---

# Project Structure

```text
ai-doubt-solver/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# Installation

## Prerequisites

Make sure the following are installed:

* Node.js v18+
* npm v9+
* MongoDB Atlas account
* Groq API key
* AssemblyAI API key

---

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-doubt-solver.git
cd ai-doubt-solver
```

---

# Backend Setup

## Navigate to Backend

```bash
cd server
```

## Install Dependencies

```bash
npm install
```

## Create `.env`

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
GROQ_API_KEY=your_groq_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
NODE_ENV=development
MAX_FILE_SIZE=10485760
```

## Start Backend Server

```bash
npm run dev
```

---

# Frontend Setup

## Navigate to Frontend

```bash
cd client
```

## Install Dependencies

```bash
npm install
```


## Start Frontend

```bash
npm run dev
```

---

# Running the Project

## Backend

```bash
cd server
npm run dev
```

## Frontend

```bash
cd client
npm run dev
```

---

# API Endpoints

## Authentication

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| POST   | `/api/auth/register` | Register user    |
| POST   | `/api/auth/login`    | Login user       |
| GET    | `/api/auth/me`       | Get current user |

---

## Chat APIs

| Method | Endpoint               | Description      |
| ------ | ---------------------- | ---------------- |
| GET    | `/api/chats`           | Get chats        |
| POST   | `/api/chats`           | Create chat      |
| GET    | `/api/chats/:id`       | Get chat by ID   |
| DELETE | `/api/chats/:id`       | Delete chat      |
| POST   | `/api/chats/:id/text`  | Send text doubt  |
| POST   | `/api/chats/:id/image` | Send image doubt |
| POST   | `/api/chats/:id/voice` | Send voice doubt |

---

## Doubt APIs

| Method | Endpoint                     | Description       |
| ------ | ---------------------------- | ----------------- |
| POST   | `/api/doubts/ask`            | Ask text doubt    |
| POST   | `/api/doubts/ask-with-image` | Ask image doubt   |
| GET    | `/api/doubts/history`        | Get doubt history |
| PATCH  | `/api/doubts/:id/helpful`    | Mark helpful      |
| DELETE | `/api/doubts/:id`            | Delete doubt      |

---

# Testing

## Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"name":"Test User","email":"test@example.com","password":"123456"}'
```

---

## Send Chat Message

```bash
curl -X POST http://localhost:5000/api/chats/:id/text \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{"question":"Explain Newton second law"}'
```

---

# Deployment

## Backend Deployment (Render)

1. Push repository to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set root directory as `server`
5. Add environment variables
6. Deploy service

---

## Frontend Deployment (Netlify)

1. Import GitHub repository
2. Set base directory as `client`
3. Build command:

```bash
npm run build
```

4. Publish directory:

```bash
dist
```

5. Add environment variable:

```env
VITE_API_URL=your_backend_url
```

6. Deploy site

---

# Common Issues

| Problem                   | Solution                     |
| ------------------------- | ---------------------------- |
| MongoDB connection error  | Add IP to Atlas whitelist    |
| Voice transcription fails | Verify AssemblyAI API key    |
| Image upload fails        | Check file size and format   |
| 401 Unauthorized          | Login again                  |
| CORS issue                | Verify frontend/backend URLs |

---

# Future Enhancements

* Real-time typing indicators
* AI-generated quiz mode
* Code execution sandbox
* PDF/document support
* Dark mode
* Multi-language support
* Doubt sharing system
* Bookmark and favorites

---

# Author

**Yashwanth Guvva**

* GitHub: https://github.com/yashwanth-kiran89/
* Email: guvvayeshwanth@gmail.com

---

# License

This project is licensed under the MIT License.

```text
MIT License

Copyright (c) 2026 Yashwanth Guvva

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files to deal in the Software
without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies.
```
