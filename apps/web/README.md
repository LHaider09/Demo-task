# Family Tree Mini-Builder

A small full-stack application for creating people and defining parent–child relationships.

This project is designed to showcase full-stack development skills, including:

* Frontend form handling & validation

* Backend validation & business rules

* Data modelling

* REST API design

* Automated testing

##  Tech Stack

 Frontend: 

* React + TypeScript

* Vite

* react-hook-form

* Zod (schema-based validation)

Backend: 

* Node.js

* Express

* Prisma ORM

* SQLite (local database)

* Jest + Supertest (API testing)

The backend is the source of truth.
Frontend validation is used only to improve user experience.

 Project Structure
apps/
├── api/        # Backend (Express + Prisma)
│   ├── prisma/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validation/
│   │   ├── errors/
│   │   └── server.ts
│   └── tests/
│
└── web/        # Frontend (React + Vite)
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   ├── App.tsx
    │   └── main.tsx

## Running the Application Locally
Prerequisites

* Node.js v18+

* npm

1️⃣ Backend (API)
```bash
cd apps/api
npm install
npx prisma migrate dev
npm run dev
```

The API will start at:

http://localhost:4000

2️⃣ Frontend (Web)
```bash
cd apps/web
npm install
npm run dev
```

The UI will be available at:

http://localhost:5173

API Overview:

Create a Person
POST /api/people

```bash
{
  "name": "Alice",
  "dateOfBirth": "1980-01-02",
  "placeOfBirth": "Helsinki"
}
```

Add Parent–Child Relationship
POST /api/relationships

```bash
{
  "parentId": "uuid",
  "childId": "uuid"
}
```


Get Family Tree
GET /api/tree/:rootId


Returns a recursive tree structure starting from the selected root person.

## Testing

Backend tests validate:

* Invalid dates of birth (future dates)

* Parent age rules (minimum age difference)

* Maximum two parents

* Cycle prevention (no ancestor loops)

Run tests:

```bash 
cd apps/api
npm test
```

All tests should pass ✅

## Design Decisions

* Business rules are enforced only on the backend

* Frontend uses reusable hooks (usePeople, useTree)

* Forms use schema-driven validation

* Recursive tree rendering keeps UI logic simple

* SQLite chosen for simplicity and fast local setup

## Purpose of This Project

This project was built as a technical showcase, demonstrating:

* Clean architecture

* Validation at multiple layers

* Realistic business constraints

* Testable backend logic

* Simple but extensible UI

##  AI Usage & Approach
I utilized AI tools (GitHub Copilot / ChatGPT) to accelerate development while maintaining full architectural ownership.
* **Data Generation:** Generated JSON seed data for testing.
* **Logic Refinement:** While AI suggested a basic cycle check, I manually implemented the **Recursive Depth-First Search (DFS)** to ensure it catches deep, multi-level cycles which the initial suggestion missed.

## Next Improvements

* Visual tree layout (graph view)

* Edit / delete person

* Better accessibility

* Pagination for large datasets

* Authentication

## Architecture Overview

The application follows a simple layered architecture where the backend acts as the single source of truth.

```mermaid
graph TD
    Frontend[React + TypeScript (Vite)] -->|HTTP (JSON)| Backend[Node.js + Express API]
    Backend -->|Prisma ORM| DB[(SQLite Database)]
```