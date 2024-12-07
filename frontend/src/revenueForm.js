import React, { useState } from 'react';

function RevenueReportForm() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [revenueReport, setRevenueReport] = useState(null);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };
  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    fetch('http://localhost:5050/generateRevenueReport', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setRevenueReport(data); 
      })
      .catch((error) => {
        console.error('Error generating report:', error);
      });
  };
  return (
    <div>
      <form onSubmit={handleGenerateReport}>
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={handleStartDateChange}
            required
            style={{ marginBottom: '10px' }}
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={handleEndDateChange}
            required
            style={{ marginBottom: '10px' }}
          />
        </div>
        <button type="submit">Generate Report</button>
      </form>
      {revenueReport !== null && (
        <div>
          <h3>Revenue Report</h3>
          <p>{revenueReport.totalRevenue}</p>
        </div>
      )}
    </div>
  );
}

export default RevenueReportForm;
