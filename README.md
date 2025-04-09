# AI Chatbot Feedback System

## Overview

The AI Chatbot Feedback System is a comprehensive web application designed to manage, analyze, and improve AI chatbot interactions. This system provides a sophisticated interface for tracking, filtering, and gaining insights from conversation feedback.

## 🌟 Features

### 1. Conversation Management
- Detailed view of AI chatbot conversations
- Filtering and sorting capabilities
- Search functionality across conversations

### 2. Feedback Tracking
- Mark conversations as helpful or unhelpful
- Archive/restore conversations
- Categorize conversations by schema and type

### 3. Advanced Filtering
- Filter by:
  - Schema (e.g., Mesai, Mukavele, Genel)
  - Conversation Type
  - Feedback Status (Positive/Negative)
  - Hidden/Archived Status

### 4. Similar Conversations Search
- Find conversations similar to the current one
- Semantic search across conversation history

### 5. Pagination and Performance
- Server-side pagination
- Efficient data loading
- Responsive UI with smooth animations

## 🛠 Tech Stack

### Frontend
- HTML5
- CSS3 (with modern styling techniques)
- Vanilla JavaScript
- Tailwind-inspired custom styling

### Backend
- Node.js
- Express.js
- MongoDB
- QDrant Vector Database

### Additional Technologies
- @xenova/transformers (Embeddings)
- Cors
- Dotenv

## 🚀 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- QDrant Vector Database

### Setup Steps

1. Clone the repository
```bash
git clone https://github.com/your-org/ai-chatbot-feedback-system.git
cd ai-chatbot-feedback-system
```

2. Install dependencies
```bash
cd feedback-api
npm install
```

3. Configure Environment Variables
Create a `.env` file in the `feedback-api` directory with the following:
```
MONGODB_URI=your_mongodb_connection_string
DB_NAME=chatbot_feedback
COLLECTION_NAME=conversations
PORT=3000
QDRANT_URL=your_qdrant_vector_db_url
QDRANT_API_KEY=your_qdrant_api_key
```

4. Initialize QDrant Collection
```bash
npm run init-qdrant
```

5. Start the Backend Server
```bash
npm run dev  # Development mode
npm start    # Production mode
```

6. Open the `html_feedback.html` in a modern web browser

## 🔍 Key Components

### Backend (`app.js`)
- RESTful API endpoints
- MongoDB interaction
- Conversation management
- Filtering and pagination

### Frontend (`html_feedback.html`)
- Interactive user interface
- Dynamic filtering
- Conversation dialog
- Similar conversations search

### QDrant Integration (`qdrant-service.js`)
- Vector database for semantic search
- Storing and retrieving positive conversations
- Embedding generation

## 📊 Filtering Capabilities

The system supports advanced filtering through:
- Schema-based filtering
- Type-based filtering
- Feedback status filtering
- Search query filtering
- Pagination

## 🔒 Security Considerations
- Environment-based configuration
- CORS support
- Secure MongoDB connection
- API endpoint protections

## 📝 Logging and Monitoring
- Comprehensive console logging
- Error handling
- Connection status tracking

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues and Limitations
- Initial setup requires manual configuration
- Requires modern browser support
- Performance may vary with large datasets

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact
Your Name - myduman@newmind.ai

Project Link: [https://github.com/teoyidu/HTML_FEEDBACK/]

---

**Note**: This project is a work in progress. Contributions, suggestions, and improvements are welcome! 🚀
