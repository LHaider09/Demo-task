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

## Architecture Overview

The application follows a simple layered architecture where the backend acts as the single source of truth.

![Architecture Diagram](docs/architecture.png)
### Description

- The **Frontend** (React + TypeScript) handles user interaction and performs light client-side validation for UX.
- The **Backend** (Node.js + Express) exposes REST APIs and enforces all business rules and validation.
- The **Database** (SQLite) persists people and parent–child relationships using a relational schema.
- Communication between frontend and backend happens via **HTTP / JSON**.
- Database access is handled through **Prisma ORM**.

## User Flow

1. Create people using the **Create Person** form.
2. Add parent–child relationships using the **Add Relationship** form.
3. The backend validates all rules (age, cycles, max parents).
4. Validation errors returned by the backend are displayed inline in the UI.
5. Select a root person to view the resulting family tree.

## UX Overview

The following wireframe illustrates the intended user experience and layout of the application.

![UX Wireframe](docs/ux-wireframe.png)

### UX Principles

- Clear separation between **Create / Edit** actions and **Family Tree View**
- Immediate feedback for successful actions (e.g. person created)
- Inline display of backend validation errors near the failing action
- Simple, distraction-free layout focused on data correctness
- Preventive UX through disabled actions and filtered selections
  (e.g. preventing selecting the same person as both parent and child)



## Data Model and Validation

### Data Model

- **Person**
  - id
  - name
  - dateOfBirth
  - placeOfBirth (optional)

- **Relationship**
  - parentId
  - childId

People and relationships are stored separately to allow flexible parent–child mappings.

### Validation Rules (Server-side)

The backend enforces all validation rules:

- A person can have **0–2 parents**
- A parent must be at least **15 years older** than their child
- Cyclical relationships are prevented (a person cannot be their own ancestor)
- Date of birth is required, must be valid, and cannot be in the future

Invalid requests are rejected with clear error messages returned to the frontend.

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

Example error response:

```json
{
  "error": {
    "code": "AGE_RULE",
    "message": "Parent must be at least 15 years older than child"
  }
}
```

Get Family Tree
GET /api/tree/:rootId


Returns a recursive tree structure starting from the selected root person.

## Error Handling

- All business rule violations are validated on the backend.
- Errors are returned in a structured format with a code and message.
- The frontend displays validation errors inline near the action that failed.
- Successful operations are shown as non-blocking success messages.


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

All tests should pass 

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

## AI Usage & Approach

AI tools (GitHub Copilot / ChatGPT) were used as **development accelerators**, not as decision-makers.  
All architectural decisions, validation rules, and final implementations were reviewed and owned by me.

**How AI was used**
- **Boilerplate acceleration:** Initial scaffolding for form validation schemas and API request shapes.
- **Test data generation:** Generated realistic JSON seed data to speed up manual testing.
- **Idea validation:** Used AI to sanity-check edge cases for relationship validation.

**Human-driven refinements**
- The initial cycle-prevention logic suggested by AI only handled shallow cases.
- I replaced it with a **recursive Depth-First Search (DFS)** implementation to reliably detect
  deep, multi-level ancestor cycles and prevent invalid graph states.
- Validation rules were centralized in the backend to ensure correctness regardless of client behavior.

AI improved speed, but **correctness, performance, and design decisions remained human-driven**.

## Next Improvements

- **Visual tree layout:** Replace list-based rendering with a graph layout (e.g. DAG visualization)
  while keeping backend tree structure unchanged.
- **Edit / delete flows:** Add safe mutation operations with validation to prevent breaking existing relationships.
- **Dockerize the application:** Add Dockerfiles for API and Web + docker-compose for one-command local startup.
- **Accessibility:** Improve keyboard navigation, focus states, and screen-reader labels for forms.
- **Scalability:** Introduce pagination or lazy-loading for large person datasets.
- **Authentication & authorization:** Restrict relationship editing based on user roles or ownership.

## UI Sanpshot(Optional)

![Application UI](docs/UI.png)
