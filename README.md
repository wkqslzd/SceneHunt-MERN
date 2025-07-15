# SceneHunt - CS732 Project by Team Fuzzy Foxes

## ⚠️ Important Setup Notice

**Before running this project, you need to configure environment variables:**

1. Copy `backend/.env.example` to `backend/.env`
2. Replace the placeholder values with your actual configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT token signing
   - `OPENAI_API_KEY`: Your OpenAI API key (required for AI features)

**Example:**
```bash
cd backend
cp .env.example .env
# Then edit .env with your actual values
```

## Project Introduction

SceneHunt is a web-based, cross-media cultural platform designed to connect literary and screen-based works through structured, community-driven knowledge contributions. It empowers users to explore, rate, and comment on books and screen-based works while actively discovering and submitting connections between them, such as adaptations, visual homages, thematic echoes, and character inspirations. Built with a MERN stack (MongoDB, Express, React, Node.js), SceneHunt supports user-generated content, verified through an AI-assisted review system and finalized by administrators. Each work has a dedicated profile page displaying its information, user ratings, comments, and a visual map of its cultural connections. SceneHunt aims to foster an interactive, knowledge-rich community where users can uncover and explore the intricate details connecting books and screen-based works.

---

## Core Features

1. User-Driven Cultural Connections: Users can submit and explore various cultural links between works (e.g., adaptations, visual homages) with clear directional relationships (upstream and downstream). Each connection is traceable and automatically bi-directional, ensuring that linked works reflect their mutual influence.

2. AI-Assisted Review System: AI provides initial assessments of user-submitted connections, evaluating their validity and offering explanations. Administrators make final decisions, ensuring content quality and accuracy.

3. Dynamic Work Pages: Each book or screen-based work has a detailed profile featuring basic information, user ratings, reviews, and a visualized cultural network of connections, clearly indicating the direction and nature of each link.

4. Structured User Profiles: Users have personalized profiles displaying their contributions, including submitted connections, approved links, reviews, and achievements.

5. Robust Search and Filter: Users can search works by title, type, genre, and explore connections easily, navigating through the cultural network with clarity.

---

## Team member

- Chenwei Gan _(cgan126@aucklanduni.ac.nz)_
- Chengchen Xiong _(cxio665@aucklanduni.ac.nz)_
- YiZhe Wang _(nway570@aucklanduni.ac.nz)_
- Sirui Yan _(syan252@aucklanduni.ac.nz)_
- Linda Li _(jli762@aucklanduni.ac.nz)_
- Haolin Lyu _(hlyu601@aucklanduni.ac.nz)_

---

## Project Overview

This is a MERN stack project that allows users to explore and connect different creative works (books and screen works). Users can:
- Browse and search works
- Create connections between works
- Rate and review works
- Submit connection proposals
- Manage their profile

---

## User Hierarchy
- Super Administrator: Highest authority with exclusive privileges to transfer super admin rights and manage all system operations. Inherits all admin privileges.
- Administrator: Can review connections and manage basic system operations. Inherits all regular user privileges.
- Regular User: Standard user with basic access to create and view connections.

Note: Each higher-level role inherits all permissions from lower-level roles.

---

## Tech Stack

- Frontend: React + Vite + Material-UI + Ant Design
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT

---

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 8.0.0
- npm >= 9.0.0

### MongoDB Requirements

#### Version Requirements
- MongoDB Community Server 8.0 or above
- Latest version of MongoDB Shell (mongosh)
- Mongoose 7.0.3 or above

#### System Requirements
macOS:
- OS: macOS 10.15 or above
- Memory: At least 2GB
- Disk space: At least 10GB available
- Data directory: You need to create and configure `/Users/your-username/data/db`
- Database name: culture-platform
- Default port: 27017
- Connection string: mongodb://127.0.0.1:27017/culture-platform

Windows:
- OS: Windows 10 or above
- Memory: At least 2GB
- Disk space: At least 10GB available
- Data directory: You need to create and configure `C:\data\db`
- Database name: culture-platform
- Default port: 27017
- Connection string: mongodb://127.0.0.1:27017/culture-platform

**Note:** Before running the project, please make sure MongoDB is properly installed and started, and the database name is `culture-platform`. The default uses local connection (127.0.0.1) and default port (27017).

---

## One-time Development Environment Initialization & Startup Process (Must Read for New Users)

### 1. Clone the project code

```bash
git clone https://github.com/UOA-CS732-S1-2025/group-project-fuzzy-foxes.git
cd group-project-fuzzy-foxes
```

### 2. Install dependencies

**Backend dependencies:**
```bash
cd backend
npm install
```

**Frontend dependencies:**
```bash
cd frontend
npm install
```

### 3. Configure environment variables

- Copy `.env.example` to `.env` in the `backend/` directory
- Modify the configuration as needed (such as database connection, etc.)

### 4. Start MongoDB

Make sure local MongoDB is installed and started.

```bash
# macOS/Linux
mkdir -p /Users/your-username/data/db
mongod --dbpath /Users/your-username/data/db

# Windows
mkdir C:\data\db
mongod --dbpath C:\data\db
```

### 5. Initialize database content

**(1) Import preset works data and preset primary connections (for demo display)**
```bash
cd backend
npm run import-all
```

**(2) Initialize super admin account (required for first run)**
```bash
cd backend
node scripts/initSuperAdmin.js
```
After initialization, you will get the following login info:
- Username: superadminSceneHunt
- Password: initial_password123

**Please change your password immediately after first login.**

**(3) Import test accounts (for development and testing)**
```bash
cd backend
node scripts/initTestData.js
```
The system will automatically import a batch of admin and regular user accounts for development and testing.

#### Admin accounts
- wkqslzd / wkqslzd@A123
- Cicie44 / Cicie44@A123
- Sirui33333 / Sirui33333@A123
- Jnnnnnnya / Jnnnnnnya@A123
- patrickstar123456789 / patrickstar123456789@A123
- YizheWang3 / YizheWang3@A123

#### Regular user accounts
- smitty23 / Pa$$w0rd!
- maxiscool / CoolMax123!
- jennywren / Jenny@123

### 6. Start backend service

```bash
cd backend
npm run dev
```

### 7. Start frontend service

```bash
cd frontend
npm run dev
```

### 8. Access the application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## Project Structure

```
group-project-fuzzy-foxes/
├── backend/
│   ├── controllers/         # Express route controllers for all endpoints
│   ├── models/              # Mongoose models (schemas)
│   ├── routes/              # Express route definitions
│   ├── scripts/             # Utility scripts (e.g., data import, admin init)
│   ├── middleware/          # Express middleware (auth, error handling, etc.)
│   ├── utils/               # Utility/helper functions
│   ├── config/              # Configuration files (e.g., db connection)
│   ├── app.js               # Express app setup
│   ├── server.js            # Entry point for backend server
│   └── ...                  # Other backend files
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page-level React components
│   │   ├── contexts/        # React context providers (e.g., Auth)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility/helper functions
│   │   ├── router/          # React Router configuration
│   │   ├── App.jsx          # Main React app component
│   │   ├── main.jsx         # React entry point
│   │   └── ...              # Other frontend files
│   ├── package.json         # Frontend dependencies and scripts
│   └── ...                  # Other frontend config files
│
├── .gitignore
├── README.md
├── package.json             # Project-level scripts and dependencies (if any)
└── ...                      # Other project-level files
```

---

### Description

- **backend/**: Backend Node.js/Express related code and configuration.
- **frontend/**: Frontend React related code and configuration.
- **scripts/**: Common scripts (such as data import, super admin initialization, etc.).
- **contexts/**: React Context related (such as AuthProvider).
- **pages/**: Page-level components (such as Home, Login, WorkDetailsPage, etc.).
- **components/**: Reusable UI components (such as Card, Navbar, CommentSection, etc.).
- **models/**: Mongoose data models.
- **routes/**: Express route definitions.
- **middleware/**: Express middleware (such as authentication, error handling, etc.).
- **utils/**: Utility/helper functions.

---
## Project Management

### Tools
- **In-person meetings**: The primary method for project planning, task assignment, and progress tracking.
- **Shared documents** (e.g., Google Docs, Word): Used for recording meeting notes and important decisions.

### Workflow
Our team relies on regular in-person meetings to coordinate work, discuss progress, and adapt plans as needed. This approach allows for direct communication, quick decision-making, and flexible task allocation.

### Task and Issue Tracking
- Tasks and responsibilities are discussed and assigned during meetings.
- Progress is tracked through verbal updates and follow-ups in subsequent meetings.
- Any issues or blockers are raised and resolved collaboratively during these sessions.

### Meeting Records
- Detailed notes from each meeting, including decisions made and tasks assigned, are kept in shared documents.
- This ensures that all team members are informed and that important information is available for future reference.

---

## Project Wiki

For more detailed documentation, technical specifications, and development guidelines, please visit our project Wiki:
[Project Wiki](https://github.com/UOA-CS732-S1-2025/group-project-fuzzy-foxes/wiki)

The Wiki contains comprehensive information about:
- Technical architecture
- API documentation
- Development workflows
- Testing procedures
- Deployment guidelines
- Troubleshooting guides