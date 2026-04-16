# Order Fulfillment System

An industrial-grade Full-Stack Order Management and Inventory tracking system. Engineered for high performance, reliability, and security with a sleek, dark-themed user interface.

![Modern Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20NestJS%20%7C%20Postgres%20%7C%20Docker-blueviolet)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Key Features

- **Secure RBAC Authentication**: Roles-based access control (Admin, Warehouse Manager, Staff) secured by strictly configured internal JWT strategies.
- **Multi-Warehouse Inventory**: Complete inventory lifecycle management encompassing product creation, catalog tracking, and localized warehouse stock distribution.
- **Transactional Order Fulfillment**: Intelligent order placement engine powered by Prisma Transactions ensuring atomic validations, automated stock deduction upon approval, and accurate history logging.
- **Real-time Dashboard**: Interactive, data-driven visualizations capturing performance metrics, generated through Recharts and Zustand global state management.
- **Containerized Deployment**: Production-ready microservices architecture leveraging a dual-mode Nginx Reverse Proxy with Multi-stage Dockerized environments to minimize memory footprint.

---

## Technology Stack

| Domain          | Technology / Tool         | Purpose                                                                         |
| --------------- | ------------------------- | ------------------------------------------------------------------------------- |
| **Frontend**    | React (Vite) + TypeScript | Core SPA framework offering blazing fast HMR.                                   |
| **State & API** | Zustand + React Query     | Lightweight atomic state and intelligent API caching.                           |
| **UI System**   | Ant Design + Vanilla CSS  | `darkAlgorithm` enterprise layout & responsive grids.                           |
| **Backend**     | NestJS                    | Robust scalable framework ensuring strong typing and modularity.                |
| **Database**    | PostgreSQL + Prisma ORM   | Deeply normalized schema, relational integrity, and automated migrations.       |
| **Deployment**  | Docker & Nginx            | Container orchestration (`docker-compose`) and reverse proxying `/api` traffic. |

---

## Quick Start (Dockerized Production)

Starting the entire cloud infrastructure requires absolute zero external software configuration beyond Docker.

### 1. Fire up the Stack

Ensure Docker Engine (Docker Desktop) is running, then execute:

```bash
docker compose up -d --build
```

_This command pulls the PostgreSQL database, builds the optimized NestJS backend, and serves the decoupled React SPA via Nginx entirely automatically._

### 2. Bootstrapping Enterprise Data

Because the database is heavily relational and secured, fresh environments are completely empty. Push the schema and apply sample business logic data:

```bash
cd backend
npx prisma db push
npx prisma db seed
```

### 3. Access Portals

Everything is dynamically routed to standard ports making it hassle-free.

| Service                   | Access Link             | Default Credentials                    |
| ------------------------- | ----------------------- | -------------------------------------- |
| **Web Dashboard**         | `http://localhost`      | **`admin@admin.com`** / **`12345678`** |
| **pgAdmin4 (DB Manager)** | `http://localhost:5050` | `admin@admin.com` / `root`             |
| **Raw API Check**         | `http://localhost/api`  | _Internal / Authenticated only_        |

_(Note: In PgAdmin, when registering the database connection server, use `Host: db` and `Password: 12345678`)_.

---

## 🏗️ Architecture Blueprint

```mermaid
graph TD
    Client([User Browser]) -->|HTTP Port 80| Nginx[Frontend Nginx Proxy]
    Nginx -->|React SPA| UI[Ant Design Dashboard]
    UI -->|API Requests| Nginx
    Nginx -->|Reverse Proxy /api/*| NestJS[Backend NestJS :3000]
    NestJS -.->|Prisma ORM| DB[(PostgreSQL :5432)]

    subgraph Docker Internal Network (ofs-network)
    Nginx
    NestJS
    DB
    end
```

---

_This project represents the culmination of a full lifecycle effort to design, code, and deploy an enterprise-grade web application._
