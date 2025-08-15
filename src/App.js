import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import backgroundImage from './assets/background.png';

function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);

  // Using environment variables
  const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const RANGE = process.env.REACT_APP_SPREADSHEET_RANGE; // Assuming headers are in row 1, data starts at row 2

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // For API approach
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );
        
        // Alternative CSV approach if you prefer
        // const response = await fetch(
        //   `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`
        // );
        
        if (!response.ok) {
          throw new Error('Failed to fetch data from Google Sheets');
        }
        
        const result = await response.json();
        
        // Transform the data into a more usable format
        const formattedData = result.values.map(row => ({
          firstName: row[0],
          lastName: row[1],
          tableNumber: row[2]
        }));
        
        setData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
    
    // Focus the input field as soon as the component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [SPREADSHEET_ID, API_KEY]);

  // Filter data based on search term
  const filteredData = data.filter(person => {
    const searchLower = searchTerm.toLowerCase();
    return (
      person.firstName.toLowerCase().includes(searchLower) ||
      person.lastName.toLowerCase().includes(searchLower) || 
      (person.firstName + person.lastName).toLowerCase().includes(searchLower) ||
      (person.firstName + ' ' + person.lastName).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="app">
      <header>
        <h1>Find Your Seat!</h1>
        <div className="search-container">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by first or last name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            autoFocus
          />
        </div>
      </header>

      <main>
        {loading ? (
          <div className="loading">Loading guest data...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : (
          <div className="results">
            {searchTerm && filteredData.length === 0 ? (
              <div className="no-results">No guests found matching "{searchTerm}"</div>
            ) : (
              filteredData.map((person, index) => (
                <div className="guest-card" key={index}>
                  <div className="guest-name">{person.firstName} {person.lastName}</div>
                  {person.tableNumber.toLowerCase() == 'head' ? <div className="table-number">Head Table</div> : <div className="table-number">Table {person.tableNumber}</div>}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
