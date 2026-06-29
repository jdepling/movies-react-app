# Movies App

A simple movie manager with a .NET backend, SQLite database, and React frontend.

## Structure

- `backend/` - C# Web API with Entity Framework Core and SQLite
- `frontend/` - React app scaffolded for Vite

## Backend setup

1. Install the .NET SDK (8.0 or later).
2. Open `backend` in a terminal.
3. Run `dotnet restore`.
4. Run `dotnet ef database update` to create the SQLite database, or run the API and it will create `movies.db` automatically on first request.
5. Run `dotnet run` to start the backend.

## Frontend setup

1. Install Node.js.
2. Open `frontend` in a terminal.
3. Run `npm install`.
4. Run `npm run dev`.

## API endpoints

- `GET /api/movies`
- `GET /api/movies/{id}`
- `POST /api/movies`
- `PUT /api/movies/{id}`
- `DELETE /api/movies/{id}`
- `GET /api/movies/{id}/reviews`
- `POST /api/movies/{id}/reviews`
