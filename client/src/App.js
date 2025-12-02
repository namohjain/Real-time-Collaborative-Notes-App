import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import NoteEditor from './components/NoteEditor';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="app-logo">CN</div>
          <h1 className="app-title">Collaborative Notes</h1>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/note/:id" element={<NoteEditor />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
