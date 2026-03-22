# ⚡ TaskFlow — Java + React Deployment Practice Project

A full-stack Task Management app built with **Spring Boot** (Java 17) and **React 18**, designed to practice real-world deployment workflows.

---

## 🏗️ Project Structure

```
taskflow/
├── backend/                  # Spring Boot API
│   ├── src/main/java/com/taskflow/
│   │   ├── TaskFlowApplication.java
│   │   ├── controller/TaskController.java   # REST endpoints
│   │   ├── model/Task.java                  # JPA Entity
│   │   ├── repository/TaskRepository.java   # Data access
│   │   └── service/TaskService.java         # Business logic
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── data.sql                         # Seed data
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                 # React App
│   ├── src/
│   │   ├── App.js            # Main component (Kanban + List view)
│   │   ├── App.css
│   │   ├── api.js            # Axios API layer
│   │   └── index.js
│   ├── public/index.html
│   ├── nginx.conf            # Nginx config for SPA + API proxy
│   ├── Dockerfile
│   └── package.json
│
├── .github/workflows/
│   └── ci-cd.yml             # GitHub Actions pipeline
├── docker-compose.yml        # Full stack orchestration
└── README.md
```

---

## 🚀 Running Locally (Without Docker)

### Prerequisites
- Java 17+
- Maven 3.8+
- Node 18+

### 1. Start the Backend
```bash
cd backend
mvn spring-boot:run
```
- API available at: `http://localhost:8080/api/tasks`
- H2 Console (dev): `http://localhost:8080/h2-console`
- Health check: `http://localhost:8080/actuator/health`

### 2. Start the Frontend
```bash
cd frontend
npm install
npm start
```
- App available at: `http://localhost:3000`
- The `"proxy": "http://localhost:8080"` in package.json forwards `/api` calls to Spring Boot.

---

## 🐳 Running with Docker Compose

### One command to run everything:
```bash
docker compose up --build
```

This starts:
| Container         | Port  | Description                    |
|-------------------|-------|--------------------------------|
| taskflow-frontend | 3000  | React app served by Nginx      |
| taskflow-backend  | 8080  | Spring Boot REST API           |
| taskflow-db       | 5432  | PostgreSQL (internal only)     |

### Useful Docker commands:
```bash
# Run in background
docker compose up -d --build

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop everything
docker compose down

# Stop + remove volumes (wipes database)
docker compose down -v

# Rebuild one service
docker compose build backend
docker compose up -d backend
```

---

## 🌐 API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | /api/tasks                | Get all tasks            |
| GET    | /api/tasks?status=TODO    | Filter by status         |
| GET    | /api/tasks?search=keyword | Search by title          |
| GET    | /api/tasks/{id}           | Get single task          |
| POST   | /api/tasks                | Create task              |
| PUT    | /api/tasks/{id}           | Update task              |
| PATCH  | /api/tasks/{id}/status    | Update status only       |
| DELETE | /api/tasks/{id}           | Delete task              |
| GET    | /api/tasks/stats          | Dashboard stats          |
| GET    | /actuator/health          | Health check             |

### Example POST body:
```json
{
  "title": "Deploy to production",
  "description": "Push v1.0 to AWS EC2",
  "status": "TODO",
  "priority": "HIGH",
  "assignee": "Alice"
}
```

---

## ☁️ Deployment Options

### Option A: Deploy to a Linux VPS (AWS EC2, DigitalOcean, etc.)

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Clone your repo
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow

# 4. Set production env vars (edit docker-compose.yml or use .env file)
# Change DB passwords before deploying!

# 5. Run
docker compose up -d --build

# 6. App is live at http://your-server-ip:3000
```

### Option B: CI/CD with GitHub Actions

Set these **Repository Secrets** in GitHub → Settings → Secrets:

| Secret            | Value                        |
|-------------------|------------------------------|
| DOCKER_USERNAME   | Your Docker Hub username     |
| DOCKER_TOKEN      | Docker Hub access token      |
| DEPLOY_HOST       | Your server's IP address     |
| DEPLOY_USER       | SSH username (e.g., ubuntu)  |
| DEPLOY_SSH_KEY    | Private SSH key content      |

Push to `main` → GitHub Actions will:
1. Run tests
2. Build Docker images
3. Push to Docker Hub
4. SSH into your server and deploy

### Option C: Deploy Backend to Railway / Render
1. Connect your GitHub repo
2. Set environment variables (DB_URL, DB_USER, etc.)
3. Deploy — both platforms auto-detect Spring Boot

### Option D: Deploy Frontend to Vercel / Netlify
```bash
cd frontend
npm run build
# Upload the /build folder to Netlify
# OR connect repo to Vercel (auto-deploys on push)
```
> Set `REACT_APP_API_URL=https://your-backend-url.com/api` as an env variable.

---

## 🔧 Switching from H2 to PostgreSQL (Production)

The backend auto-switches based on environment variables.
For PostgreSQL, set:
```properties
DB_URL=jdbc:postgresql://host:5432/taskflowdb
DB_DRIVER=org.postgresql.Driver
DB_USER=your_user
DB_PASS=your_password
JPA_DIALECT=org.hibernate.dialect.PostgreSQLDialect
```
These are already wired up in `application.properties` and `docker-compose.yml`.

---

## 🧪 Testing the API with curl

```bash
# Get all tasks
curl http://localhost:8080/api/tasks

# Create a task
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","priority":"HIGH","status":"TODO"}'

# Update status
curl -X PATCH http://localhost:8080/api/tasks/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"DONE"}'

# Delete
curl -X DELETE http://localhost:8080/api/tasks/1
```

---

## 📦 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Java 17, Spring Boot 3.2, Spring Data JPA |
| Database   | H2 (dev), PostgreSQL (prod)         |
| Frontend   | React 18, Axios                     |
| Web Server | Nginx (serves React, proxies API)   |
| Container  | Docker, Docker Compose              |
| CI/CD      | GitHub Actions                      |

---

## 💡 Deployment Practice Ideas

- [ ] Deploy backend to **Railway** or **Render** (free tier)
- [ ] Deploy frontend to **Vercel** or **Netlify**
- [ ] Run full stack on **AWS EC2** with Docker Compose
- [ ] Set up **GitHub Actions** to auto-deploy on push to main
- [ ] Add **Nginx reverse proxy** on port 80 routing to frontend + backend
- [ ] Add **SSL/TLS** with Let's Encrypt (Certbot)
- [ ] Use **environment-specific configs** (dev/staging/prod profiles)
- [ ] Set up **PostgreSQL on AWS RDS** and connect backend to it
- [ ] Add a **monitoring stack** (Prometheus + Grafana)
