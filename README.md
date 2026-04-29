# 🚀 Focus-Flow AI  
### Cognitive Middleware for Actionable Learning

> Focus-Flow AI is a system designed to reduce the effort required to understand and complete learning tasks by transforming complex content into simplified, structured, and actionable workflows.

---

## 🧠 Problem

In today’s digital world, users are constantly exposed to large amounts of information—articles, research papers, and PDFs.  
While information is easily available, **understanding and acting on it is still a major challenge**.

Many users struggle with:
- Overwhelming and unstructured content  
- Complex language and technical explanations  
- Difficulty in starting and completing tasks  

Most existing tools and AI systems provide answers, but they do not help users **stay focused, break down content, or take action**.

---

## 💡 Solution

Focus-Flow AI solves this problem by acting as a **cognitive layer between the user and the content**.

Instead of just providing information, it helps users:
- Understand complex content easily  
- Break it into smaller, manageable steps  
- Stay focused and complete their learning  

> We are not building a chatbot — we are building a **learning execution system**.

---

## 🌐 Platforms

### 🔹 Chrome Extension (Web Mode)
- Works directly on webpages  
- Simplifies selected text instantly  
- Reduces distractions with focus mode  
- Allows users to understand content without switching tabs  

---

### 🔹 Web Dashboard (PDF Mode)
- Upload and read PDF documents  
- AI-powered content simplification  
- Generate structured study notes  
- Download ready-to-use notes for revision  

---

## ✨ Key Features

### 🧠 Cognitive Reduction
- Smart Reading Mode (distraction-free content)  
- AI Simplification (complex → simple)  
- Translation Support  

---

### ⚙️ Action System
- Micro-Task Generation (breaks content into steps)  
- Smart Nudges (helps users stay on track)  

---

### 📄 Output System
- PDF Simplification  
- Download as Study Notes  

---

## 🏗️ Project Structure

```
Document-Scanner/
├── backend/      # Node.js + Express API
├── frontend/     # React Dashboard (PDF Mode)
├── extension/    # Chrome Extension (Web Mode)
├── .gitignore
└── SETUP.md
```

## 🛠️ Tech Stack

- **Frontend:** React, CSS  
- **Backend:** Node.js, Express  
- **Database:** MongoDB  
- **AI:** Google Gemini API  
- **Authentication:** Firebase Auth  
- **PDF Processing:** pdf.js, pdf-parse  

---

## 🔐 Environment Variables

Create a `.env` file inside `/backend`:
```
PORT=5000
MONGO_URI=your_mongodb_connection
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```
## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository

git clone https://github.com/PothanaPardhu/Document-Scanner.git

cd Document-Scanner

---
### 2️⃣ Backend Setup

cd backend
npm install
npm start

---

### 3️⃣ Frontend Setup

cd frontend
npm install
npm run dev

---

### 4️⃣ Chrome Extension Setup

1. Open Chrome → `chrome://extensions/`  
2. Enable **Developer Mode**  
3. Click **Load Unpacked**  
4. Select `/extension` folder  

---

## 🚀 Usage

### 🌐 Web Mode (Extension)
- Open any webpage  
- Select difficult text  
- Instantly simplify and understand  

---

### 📄 PDF Mode (Dashboard)
- Upload a PDF  
- View simplified content  
- Generate and download study notes  

---

## 🌍 Real-World Impact

Focus-Flow AI is designed to make learning more accessible and practical.

It can:
- Help students understand complex subjects faster  
- Support non-native English speakers  
- Reduce cognitive overload while reading  
- Improve productivity by helping users take action  

Instead of replacing learning, it **supports and guides the learning process**.

---

## 🔗 Live Application

👉 https://document-scanner-rosy.vercel.app/

---

## 📎 Additional Links

- **GitHub Repository:**  
  https://github.com/PothanaPardhu/Document-Scanner.git  

- **Chrome Extension (Download):**  
  *(Add your Google Drive link here)*  

- **Demo Video:**  
  *(Add your video link here)*  

---

## 🔮 Future Improvements

- Improved offline support  
- Personalized learning experience  
- Community-based knowledge sharing  

---

## 👨‍💻 Author

**Pothana Pardhu**  
Warangal, Telangana  

---

## ⭐ Final Note

> Focus-Flow AI doesn’t just provide information — it helps users understand, focus, and complete their learning.
