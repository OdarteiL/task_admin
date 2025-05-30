# Task Management System for Field Teams (AWS Serverless)

This project is a Task Management System built specifically for managing field teams using AWS Serverless services. It enables an Admin to assign and manage tasks efficiently, while Team Members can log in to view, update, and complete their assignments. The system emphasizes scalability, cost-efficiency, and real-time task monitoring.

---

## Project Objective

Design and implement a Task Management System that:
- Allows an Admin to create, assign, and track tasks
- Enables Team Members to view and update their assigned tasks
- Sends automated notifications based on task deadlines
- Offers real-time insights into team performance and task status
- Is fully serverless and deployable within the AWS Free Tier

---

## Architecture Overview

### Core Technologies
| Component         | Service                   | Description |
|------------------|---------------------------|-------------|
| Frontend         | Next.js + TypeScript      | Admin/Team Member dashboard |
| API Backend      | AWS Lambda                | Serverless functions to handle business logic |
| API Gateway      | Amazon API Gateway (HTTP) | Exposes Lambda functions as RESTful endpoints |
| Database         | Amazon DynamoDB           | NoSQL storage for users, tasks, and deadlines |
| Authentication   | Amazon Cognito            | Secure user login and session management |
| Notifications    | Nodemailer via Lambda     | Email alerts for approaching deadlines |

---

## Features

### Admin Panel
- Create and assign tasks to team members
- View all tasks with their status and deadlines
- Edit or delete tasks
- Monitor progress via dashboards

### Team Member Dashboard
- Secure login via Amazon Cognito
- View all assigned tasks
- Update task status and remarks
- Receive reminders via email before deadlines

### System-Level
- Email notifications using SMTP + Nodemailer
- Automatic deadline tracking with timestamp comparisons
- Task filtering and search
- Future roadmap: analytics panel with completion rates

---

## Folder Structure

```
task-management-system/
│
├── frontend/               # Next.js frontend code
├── api/                    # AWS Lambda functions (CRUD)
├── mysql/                  # (Optional: legacy or seed data scripts)
├── cloudformation/         # Infrastructure as Code templates
├── screenshots/            # UI snapshots and demos
└── README.md
```

---

## Setup & Deployment Guide

### Prerequisites
- AWS Account (Free Tier)
- Node.js >= 18.x
- AWS CLI (configured with credentials)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/task-management-system.git
cd task-management-system
```

### Step 2: Set Up DynamoDB Tables
Create two tables in DynamoDB:
- `TasksTable` (Partition key: `taskId`)
- `UsersTable` (Partition key: `userId`)

### Step 3: Deploy Lambda Functions
- Write your Lambda functions in `api/` (e.g. `createTask.js`, `getTasks.js`)
- Deploy using AWS Console or SAM/CloudFormation
- Each function must be connected to API Gateway routes (e.g., `/tasks`, `/tasks/{id}`)

### Step 4: Configure Cognito
- Create a User Pool and App Client
- Enable Hosted UI
- Add callback URLs: `http://localhost:3000` and your deployed frontend

### Step 5: Run Frontend
```bash
cd frontend
npm install
npm run dev
```
- Access the app at `http://localhost:3000`
- Log in via Cognito Hosted UI

---

## Future Enhancements

- Calendar view with task deadlines
- Analytics dashboard (e.g. task completion rate, user productivity)
- Real-time WebSocket updates
- File attachments for tasks

---

## License

MIT License. Free to use and modify.

---

## Author & Contributions

Developed by [Your Name]. Contributions and feedback are welcome.
