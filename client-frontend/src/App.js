import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DraggableItemsPage from './DraggableItemsPage';
import './dark-theme.css';

// Updated JoinPage component with UUID input
const JoinPage = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [uuid, setUuid] = useState('');

  useEffect(() => {
    // Extract UUID from URL parameters
    const params = new URLSearchParams(window.location.search);
    const uuidFromUrl = params.get('uuid');
    if (uuidFromUrl) {
      setUuid(uuidFromUrl);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass the UUID and name to the onJoin handler
    onJoin(uuid, name);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        required
      />
      <input
        type="text"
        value={uuid}
        // Disabled input
        disabled
        placeholder="Enter your UUID"
        required
      />
      <button type="submit">Join</button>
    </form>
  );
};

const App = () => {
  const [user, setUser] = useState(null);

  const handleJoin = (uuid, name) => {
    setUser({ uuid, name });
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/items" replace />
            ) : (
              <JoinPage onJoin={handleJoin} />
            )
          }
        />
        <Route
          path="/items"
          element={
            user ? (
              <DraggableItemsPage currentUser={user} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
