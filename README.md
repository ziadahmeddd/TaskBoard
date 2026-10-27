# TaskBoard

A Kanban task board: Spring Boot REST API plus an Angular frontend.

## Structure

- `kanban/` — Spring Boot 3 backend (Java, Maven, Spring Data JPA, H2 in-memory DB). Exposes CRUD endpoints for tasks under `/api/tasks`.
- `kanban-ui/` — Angular frontend with drag-and-drop columns (`@angular/cdk/drag-drop`).

## Running the backend

```bash
cd kanban
./mvnw spring-boot:run
```

Serves on http://localhost:8080. H2 console at http://localhost:8080/h2-console.

## Running the frontend

```bash
cd kanban-ui
npm install
npm start
```

Serves on http://localhost:4200.
