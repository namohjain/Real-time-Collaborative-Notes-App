import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import API_BASE_URL from '../config';
import io from 'socket.io-client';

const res = await axios.get(`${API_BASE_URL}/api/notes/${id}`);
await axios.put(`${API_BASE_URL}/api/notes/${id}`, { ... });

const socketOrigin = API_BASE_URL.replace(/\/api.*$/, '');
socketRef.current = io(socketOrigin);

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState({ title: '', content: '' });
  const [activeUsers, setActiveUsers] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [lastEditedBy, setLastEditedBy] = useState('');
  const [userName, setUserName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const socketRef = useRef();
  const saveTimeoutRef = useRef();

  useEffect(() => {
    // Load stored display name for this browser, if any
    const storedName = window.localStorage.getItem('collabNotesUserName');
    if (storedName) {
      setUserName(storedName);
      setNameInput(storedName);
    }

    const init = async () => {
      try {
        // Fetch note data first
        const response = await axios.get(`http://localhost:5000/api/notes/${id}`);
        if (!response.data || !response.data._id) {
          setNotFound(true);
          setLoadError('This note does not exist.');
          setIsLoading(false);
          return;
        }

        setNote(response.data);
        if (response.data.updatedAt) {
          setLastUpdated(new Date(response.data.updatedAt).toLocaleString());
        }
        if (response.data.lastEditedBy) {
          setLastEditedBy(response.data.lastEditedBy);
        }
        setIsLoading(false);

        // Connect to Socket.IO only if note exists
        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('join_note', id);

        socketRef.current.on('note_update', (content) => {
          setNote(prev => ({ ...prev, content }));
        });

        socketRef.current.on('active_users', (count) => {
          setActiveUsers(count);
        });
      } catch (error) {
        console.error('Error fetching note:', error);
        setNotFound(true);
        setLoadError('This note does not exist or could not be loaded.');
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  const saveNote = async (contentToSave) => {
    setIsSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/notes/${id}`, {
        content: contentToSave,
        userName: userName || 'Anonymous'
      });
      const nowString = new Date().toLocaleString();
      setLastUpdated(nowString);
      setLastEditedBy(userName || 'Anonymous');

      // Refetch note metadata (including versions) to refresh history panel
      try {
        const refreshed = await axios.get(`http://localhost:5000/api/notes/${id}`);
        setNote(refreshed.data);
      } catch (refreshError) {
        console.error('Error refreshing note after save:', refreshError);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setNote(prev => ({ ...prev, content: newContent }));

    // Emit to other clients
    if (socketRef.current) {
      socketRef.current.emit('note_update', { noteId: id, content: newContent });
    }

    // Auto-save after 5 seconds
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(newContent);
    }, 5000);
  };

  const handleManualSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await saveNote(note.content);
  };

  const handleExit = () => {
    // Clear pending save and navigate back to home
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    navigate('/');
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    window.localStorage.setItem('collabNotesUserName', trimmed);
  };

  if (isLoading) {
    return (
      <div className="note-editor">
        <p>Loading note...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="note-editor error-page">
        <h2>Note not found</h2>
        <p>{loadError}</p>
        <button onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <h2>{note.title}</h2>
      <div className="note-info">
        <p>Active collaborators: {activeUsers}</p>
        <p>
          Last updated: {lastUpdated}
          {lastEditedBy && ` · by ${lastEditedBy}`}
        </p>
      </div>

      <div className="note-user">
        <label>
          Your name:
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Set your display name"
          />
        </label>
        <button onClick={handleSaveName} disabled={!nameInput.trim()}>
          Use name
        </button>
        {!userName && (
          <span className="note-user-hint">
            Set your name so it appears in the note history.
          </span>
        )}
      </div>

      <div className="note-actions">
        <button onClick={handleManualSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={handleExit}>Exit</button>
      </div>

      <textarea
        value={note.content}
        onChange={handleContentChange}
        placeholder="Start typing your note..."
        rows={20}
        cols={80}
      />

      {Array.isArray(note.versions) && note.versions.length > 0 && (
        <div className="note-history">
          <h3>Version history</h3>
          <ul>
            {note.versions
              .slice()
              .reverse()
              .map((v, index) => (
                <li key={index}>
                  <div>
                    <strong>{v.userName || 'Anonymous'}</strong>{' '}
                    <span>
                      {v.updatedAt
                        ? new Date(v.updatedAt).toLocaleString()
                        : ''}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
