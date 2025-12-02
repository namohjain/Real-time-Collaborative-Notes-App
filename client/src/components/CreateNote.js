import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateNote() {
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/notes', { title });
      navigate(`/note/${response.data._id}`);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  return (
    <div className="create-note">
      <h1>Create a New Note</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button type="submit">Create Note</button>
      </form>
    </div>
  );
}

export default CreateNote;
