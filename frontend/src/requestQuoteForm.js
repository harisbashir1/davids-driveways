import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 

const QuoteRequestForm = () => {
  const [address, setAddress] = useState('');
  const [squareFeet, setSquareFeet] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [note, setNote] = useState('');
  const [username, setUsername] = useState('');
  const [images, setImages] = useState({
    p1: null,
    p2: null,
    p3: null,
    p4: null,
    p5: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    } else {
      console.warn("No token found in local storage.");
    }
  }, []);

  const handleImageChange = (e) => {
    const { id, files } = e.target;
    setImages((prev) => ({ ...prev, [id]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('address', address);
    formData.append('squareFeet', squareFeet);
    formData.append('proposedPrice', proposedPrice);
    formData.append('note', note);
    formData.append('username', username);

    // Append images
    Object.entries(images).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    try {
      const response = await axios.post('http://localhost:5050/submit_quote', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        alert('Quote request submitted successfully!');
        // Reset form fields
        setAddress('');
        setSquareFeet('');
        setProposedPrice('');
        setNote('');
        setImages({ p1: null, p2: null, p3: null, p4: null, p5: null });
      } else {
        alert(response.data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting quote request:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="address">Address of the Property:</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="squareFeet">Square Feet of the Driveway:</label>
          <input
            type="number"
            id="squareFeet"
            value={squareFeet}
            onChange={(e) => setSquareFeet(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="proposedPrice">Proposed Price for the Work:</label>
          <input
            type="number"
            id="proposedPrice"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="note">Additional Notes (Optional):</label><br/> 
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Upload Images (Maximum 5):</label>
          {['p1', 'p2', 'p3', 'p4', 'p5'].map((id) => (
            <div key={id}>
              <label htmlFor={id}>{id.toUpperCase()}: </label>
              <input
                type="file"
                id={id}
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          ))}
        </div>

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default QuoteRequestForm;