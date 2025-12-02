## Collaborative Notes – Client

This folder contains the React single-page application for the Collaborative Notes project.

### What the client does

- Renders the home page with:
  - A form to create a new shared note by title.
  - A list of existing notes that you can join.
- Provides the collaborative note editor where:
  - Multiple users can type together in real time.
  - Edits are auto-saved to the backend.
  - Users can manually save and exit back to home.
  - A simple version history shows who updated the note and when. (Bonus feature added)

### Requirements

- Node.js (recommended: 18+)
- npm
- The backend server for API and WebSocket connections

### Running the client in development

From the `client` directory:

```bash
npm install
npm start
```

- The client runs on `http://localhost:3000`.
- By default it is configured to talk to the backend running on `http://localhost:5000` (or the URL you set in the client configuration).

### Build for production

```bash
npm run build
```

This creates an optimized production build in the `build` directory, which can be served by the backend or any static file host.
