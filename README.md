## Collaborative Notes

A real-time collaborative note-taking application using Node.js, Express, MongoDB, Socket.IO, and React.

### Project workflow

- **Home page**
  - Enter a note title and click **Create Note** to open a new collaborative note.
  - See a list of existing notes with their last updated time and click **Join** to open any of them.
- **Note editor**
  - Multiple users can type in the same note and see updates in real time.
  - The editor shows the number of active collaborators and when the note was last updated.
  - Content is auto-saved every few seconds while typing.
  - A **Save** button triggers an immediate save.
  - An **Exit** button returns to the home page.
  - A simple version history shows who edited the note and when each version was saved.

### Requirements

- Node.js (recommended: 18+)
- npm
- MongoDB instance (local or MongoDB Atlas)

### Setup and installation

1. **Clone the repository**
2. **Install backend dependencies**

   ```bash
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment variables**

   Create a `.env` file in the project root:

   ```text
   MONGODB_URI=mongodb://localhost:27017/collaborative-notes
   PORT=5000
   ```

   When deploying, replace `MONGODB_URI` with your remote MongoDB connection string.

### Running the project locally

1. Start MongoDB (locally or ensure your remote MongoDB is reachable).
2. In the project root, start the backend:

   ```bash
   npm start
   ```

3. In a separate terminal, start the React client:

   ```bash
   cd client
   npm start
   ```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### High-level architecture

- **Backend**
  - Express REST API under `/api/notes` for creating, reading, updating notes.
  - MongoDB for storing notes, last editor, and version history.
  - Socket.IO for real-time collaboration and active user counts.
- **Frontend**
  - React single-page app with routes for the home page and note editor.
  - Axios for API requests.
  - Socket.IO client for live updates between collaborators.
