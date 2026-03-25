# CRTS-Crime-Reporting-and-Tracking-System-
The Crime Reporting and Tracking System allows citizens to report incidents, track local crime statistics, and access information about ongoing cases. This platform facilitates the collection of evidence and witness statements while providing transparency in the judicial process.

# 🚨 Crime Reporting & Real-Time Tracking System (Backend)

A production-ready backend system for reporting, tracking, and analyzing crimes with real-time alerts, geo-based queries, and intelligent clustering.

---

## 🧠 Overview

This system allows:
- Citizens to report crimes
- Officers to get real-time alerts
- Admins to track and analyze crime trends

Built with a **scalable architecture** using:
- REST APIs
- Background workers (BullMQ + Redis)
- Geo-spatial queries (MongoDB)
- Real-time communication (Socket.io)

---

## ⚙️ Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- Redis + BullMQ
- Socket.io
- JWT Authentication
- Joi Validation

---

## 🏗️ Architecture
# 🚨 Crime Reporting & Real-Time Tracking System (Backend)

A production-ready backend system for reporting, tracking, and analyzing crimes with real-time alerts, geo-based queries, and intelligent clustering.

---

## 🧠 Overview

This system allows:
- Citizens to report crimes
- Officers to get real-time alerts
- Admins to track and analyze crime trends

Built with a **scalable architecture** using:
- REST APIs
- Background workers (BullMQ + Redis)
- Geo-spatial queries (MongoDB)
- Real-time communication (Socket.io)

---

## ⚙️ Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- Redis + BullMQ
- Socket.io
- JWT Authentication
- Joi Validation

---

## 🏗️ Architecture
Client → API → Service Layer → DB
↓
Queue (Redis)
↓
Worker
↓
Cluster Detection + Alerts
↓
Socket.io (Real-time)


---

## 🔐 Authentication

- JWT-based authentication
- Refresh token support
- Role-based access control (RBAC)

### Roles:
- CITIZEN
- OFFICER
- LAWYER
- JUDGE
- ADMIN

---

## 📦 Features

### 🧾 Case Management
- Create case with geo-location
- Assign / reassign officers
- Case workflow (state machine)
- Case history tracking

### 📍 Geo Intelligence
- Nearby crimes (`$near`)
- Heatmap aggregation
- Location-based filtering

### 🔥 Real-Time Engine
- Crime alerts via Socket.io
- Redis GEO for proximity detection
- Officer auto-notification

### 🧠 Smart Systems
- Cluster detection (multiple reports merge)
- Duplicate detection
- AI insights placeholder

### 🧾 Audit Logging
- Tracks all system actions
- Stores diff-based changes
- Includes IP & user-agent

---

## 📂 Folder Structure

---

## 🔐 Authentication

- JWT-based authentication
- Refresh token support
- Role-based access control (RBAC)

### Roles:
- CITIZEN
- OFFICER
- LAWYER
- JUDGE
- ADMIN

---

## 📦 Features

### 🧾 Case Management
- Create case with geo-location
- Assign / reassign officers
- Case workflow (state machine)
- Case history tracking

### 📍 Geo Intelligence
- Nearby crimes (`$near`)
- Heatmap aggregation
- Location-based filtering

### 🔥 Real-Time Engine
- Crime alerts via Socket.io
- Redis GEO for proximity detection
- Officer auto-notification

### 🧠 Smart Systems
- Cluster detection (multiple reports merge)
- Duplicate detection
- AI insights placeholder

### 🧾 Audit Logging
- Tracks all system actions
- Stores diff-based changes
- Includes IP & user-agent

---

## 📂 Folder Structure
src/
├── config/
├── controllers/
├── services/
├── models/
├── routes/
├── middlewares/
├── validators/
├── workers/
├── queues/
├── sockets/
├── utils/
└── constants/

---

## 🚀 API Endpoints

### 🧾 Cases


POST /cases
GET /cases
GET /cases/:id
PATCH /cases/:id/status
PATCH /cases/:id/assign
PATCH /cases/:id/reassign
PATCH /cases/:id/close


### 📎 Evidence


POST /cases/:id/evidence
GET /cases/:id/evidence
DELETE /cases/:id/evidence/:id


### 👁️ Witness


POST /cases/:id/witness
GET /cases/:id/witness


### 📊 Analytics


GET /cases/analytics/crime-types
GET /cases/analytics/monthly
GET /cases/analytics/officers


### 🗺️ Map APIs


GET /cases/map/nearby
GET /cases/map/heatmap
GET /cases/map/stats


---

## 🔄 Background Jobs

Handled using BullMQ:

- Case processing
- Cluster detection
- Officer notification
- Alert broadcasting

---

## 🧪 Running Locally

### 1️⃣ Clone repo


git clone <repo-url>
cd backend


### 2️⃣ Install dependencies


npm install


### 3️⃣ Setup environment variables

Create `.env` file:


PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret
REDIS_HOST=127.0.0.1
REDIS_PORT=6379


### 4️⃣ Run Redis


redis-server


### 5️⃣ Start server


npm run dev


---

## 📡 Real-Time Events

### Client listens:


new_case_assigned
crime_alert
case_updated


---

## 📊 Performance Optimizations

- `.lean()` queries
- Pagination
- Indexing (2dsphere)
- Async workers (non-blocking)
- Redis caching (future scope)

---

## 🔐 Security

- Password hashing (bcrypt)
- JWT validation
- Role + permission guards
- Input validation (Joi)

---

## 🧠 Future Improvements

- AI prediction model
- Push notifications (FCM)
- Officer load balancing
- Rate limiting
- Microservices architecture

---

## 🏆 Highlights

- Real-time geo-based alert system
- Background job processing
- Cluster-based incident detection
- Clean scalable architecture

---

## 👨‍💻 Author

Sagar Patil

---

## 📄 License

ISC