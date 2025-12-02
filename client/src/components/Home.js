import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await axios.post('http://localhost:5000/api/notes', {
        title: title.trim()
      });
      navigate(`/note/${response.data._id}`);
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note. Please try again.');
    }
  };

  const handleJoinNote = (id) => {
    navigate(`/note/${id}`);
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/notes');
        setNotes(response.data);
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError('Failed to load existing notes.');
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="home">
      <h2>Welcome to Collaborative Notes</h2>

      <div className="create-section">
        <h3>Create a new note</h3>
        <form onSubmit={handleCreateNote}>
          <input
            type="text"
            placeholder="Enter note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit">Create Note</button>
        </form>
      </div>

      <hr />

      <div className="join-list-section">
        <h3>Join an existing note</h3>
        {loadingNotes ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes available yet. Create one above!</p>
        ) : (
          <ul className="note-list">
            {notes.map((note) => (
              <li key={note._id} className="note-list-item">
                <div className="note-list-info">
                  <span className="note-title">{note.title}</span>
                  {note.updatedAt && (
                    <span className="note-updated">
                      Last updated:{' '}
                      {new Date(note.updatedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <button onClick={() => handleJoinNote(note._id)}>Join</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Home;
