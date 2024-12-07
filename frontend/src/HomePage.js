import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const token = localStorage.getItem('token'); // Check if the user is logged in

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#333' }}>Welcome to David's Driveways</h1>
        <nav style={{ marginTop: '20px' }}>
          <ul style={{ listStyleType: 'none', padding: '0', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <li><Link to="/login" style={{ textDecoration: 'none', fontSize: '1.2rem', color: '#007bff' }}>Login</Link></li>
            <li><Link to="/register" style={{ textDecoration: 'none', fontSize: '1.2rem', color: '#007bff' }}>Register</Link></li>
            {token && <li><Link to="/dashboard" style={{ textDecoration: 'none', fontSize: '1.2rem', color: '#007bff' }}>Dashboard</Link></li>}
          </ul>
        </nav>
      </header>



      {/* Main Content */}
      <main>
  
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '10px 0', borderTop: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>
        <p style={{ fontSize: '0.9rem', color: '#777' }}>&copy; 2024 David's Driveways. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
