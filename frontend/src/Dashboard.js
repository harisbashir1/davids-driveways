import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; 
import QuoteRequestForm from './requestQuoteForm';
import RevenueReportForm from './revenueForm.js';
import Modal from "./adminModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [userType, setUserType] = useState(null); 


//start admin modal related code
  const [open, setOpen] = React.useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const handleClose = () => {
      setOpen(false);
      setSelectedQuote(null);
  };

  const handleOpen = (quote) => {
      setSelectedQuote(quote)
      setOpen(true);
  };

  const [response, setResponse] = useState({
    startDatetime: '',
    endDatetime: '',
    price: '',
  });
  const [rejectionNote, setRejectionNote] = useState('');

  useEffect(() => {
    if (selectedQuote) {
      //format dates
      const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 16); // Format
      };
      //auto-fill form with existing values
      setResponse({
      startDatetime: formatDate(selectedQuote.proposed_start) || '',  
      endDatetime: formatDate(selectedQuote.proposed_end) || '',  
        price: selectedQuote.proposedPrice || ''                   
      });
    }
  }, [selectedQuote]); // Updates every time selectedQuote changes


  const handleRespondToQuote = () => {
    if (!selectedQuote) return;
  
    const requestBody = {
      id: selectedQuote.id,
      startDatetime: response.startDatetime,
      endDatetime: response.endDatetime,
      price: response.price,
    };
  
    fetch('http://localhost:5050/respondToQuote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify(requestBody)
    })
      .then((res) => {
        if (res.ok) {
          alert('Response submitted successfully');
          handleClose();
        } else {
          throw new Error('Failed to submit response');
        }
      })
      .catch((err) => alert(err.message));
  };

  const handleRejectQuote = () => {
    if (!selectedQuote){
      return;
    } 
    const requestBody = {
      id: selectedQuote.id,
      note: rejectionNote,
    };
    fetch('http://localhost:5050/rejectQuote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify(requestBody)
    })
      .then((res) => {
        if (res.ok) {
          alert('Response submitted successfully');
          handleClose();
        } else {
          throw new Error('Failed to submit response');
        }
      })
      .catch((err) => alert(err.message));
  };
//end of modal related code


//Client response to quote
const [clientResponseNotes, setClientResponseNotes] = useState({});

const handleNoteChange = (id, value) => {
  setClientResponseNotes(prev => ({ ...prev, [id]: value }));
};

const handleClientResponseToQuote = (id) => {
  const requestBody = {
    id: id,
    // note: clientResponseNote,
    note : clientResponseNotes[id]
    
  };
  fetch('http://localhost:5050/clientResponseToQuote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('token'),
    },
    body: JSON.stringify(requestBody)
  })
    .then((res) => {
      if (res.ok) {
        alert('Response submitted successfully');
        handleClose();
      } else {
        throw new Error('Failed to submit response');
      }
    })
    .catch((err) => alert(err.message));
};

//accept quote
const handleAcceptQuote = (id) => {
  const requestBody = {
    id: id,
  };
  fetch('http://localhost:5050/acceptQuote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('token'),
    },
    body: JSON.stringify(requestBody)
  })
    .then((res) => {
      if (res.ok) {
        alert('Response submitted successfully');
        handleClose();
      } else {
        throw new Error('Failed to submit response');
      }
    })
    .catch((err) => alert(err.message));
};

  //decodes the token and extracts username / userType
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserType(decodedToken.userType);
      setUsername(decodedToken.username);
    } 
    else {
      navigate('/login');
    }
  }, [navigate]);

//Fetch All Quotes
const [pendingQuotes, setPendingQuotes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5050/pendingQuotes', {
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    })
      .then((response) => response.json())
      .then((data) => setPendingQuotes(data))
      .catch((error) => console.error('Error fetching quotes:', error));
  }, []);

//Fetch quotes for an individual User
const[pendingQuotesByUsername,setPendingQuotesbyUsername] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5050/pendingQuotesByUsername', {
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    })
      .then((response) => response.json())
      .then((data) => setPendingQuotesbyUsername(data))
      .catch((error) => console.error('Error fetching quotes:', error));
  }, []);



//Log out function to clear the token and redirect to login page
const handleLogout = () => {
  localStorage.removeItem('token'); // Remove the JWT token
  navigate('/login'); // Redirect to login page
};

//fill quotes table based on search by ID
    const [searchId, setSearchId] = useState('');
    const [quotes_log, setquotes_log] = useState([]);
  
    const handleQuotesLogSearch = async () => {
      if (!searchId) {
        alert('Please enter an ID to search.');
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:5050/quotesLogByID?id=${searchId}`, {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch quotes log');
        }
  
        const data = await response.json();
        setquotes_log(data);
      } catch (error) {
        alert(error.message);
      }
    };


    //fill quotes table for client
    const [quotes_log_for_client, set_quotes_log_for_client] = useState([]);
    useEffect(() => {
      fetch('http://localhost:5050/quotesLogByUsername', {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      })
        .then((response) => response.json())
        .then((data) => set_quotes_log_for_client(data))
        .catch((error) => console.error('Error fetching quotes:', error));
    }, []);


    //fill order of work table for David
    const [ordersOfWork, setOrdersOfWork] = useState([]);
    useEffect(() => {
      fetch('http://localhost:5050/ordersOfWork', {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      })
        .then((response) => response.json())
        .then((data) => setOrdersOfWork(data))
        .catch((error) => console.error('Error fetching quotes:', error));
    }, []);

    //fill order of work table for Client
      const [ordersOfWorkForClient, setOrdersOfWorkForClient] = useState([]);
      useEffect(() => {
        fetch('http://localhost:5050/ordersOfWorkByUser', {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        })
          .then((response) => response.json())
          .then((data) =>setOrdersOfWorkForClient(data))
          .catch((error) => console.error('Error fetching quotes:', error));
      }, []);


  //generating bill
  const generateBill = (workOrder) => {
    const requestBody = {
      id: workOrder.id,
      address: workOrder.address,
      squareFeet: workOrder.squareFeet,  
      price: workOrder.proposedPrice,  
      username: workOrder.username,
    };
    fetch('http://localhost:5050/generateBill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify(requestBody)
    })
      .then((res) => {
        if (res.ok) {
          alert('Response submitted successfully');
          handleClose();
        } else {
          throw new Error('Failed to submit response');
        }
      })
      .catch((err) => alert(err.message));
  };



//Fetch quotes for an individual User
const [clientBills, setClientBills] = useState([]);
useEffect(() => {
  fetch('http://localhost:5050/billsByUser', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
    .then((response) => response.json())
    .then((data) => setClientBills(data))
    .catch((error) => console.error('Error fetching quotes:', error));
}, []);


//Fetch most recent quotes for a client
const [recentQuoteClient, setRecentQuoteClient] = useState([]);
useEffect(() => {
  fetch('http://localhost:5050/mostRecentQuoteForClient', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
    .then((response) => response.json())
    .then((data) => setRecentQuoteClient(data))
    .catch((error) => console.error('Error fetching recent quote:', error));
}, []);

//Fetch most recent quotes for David
const [recentQuoteDavid, setRecentQuoteDavid] = useState([]);
useEffect(() => {
  fetch('http://localhost:5050/mostRecentQuoteForDavid', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
    .then((response) => response.json())
    .then((data) => setRecentQuoteDavid(data))
    .catch((error) => console.error('Error fetching recent quote:', error));
}, []);

//fill quotes table based on search by ID
const [billSearchID, setBillSearchID] = useState('');
const [billsLog, setBillsLog] = useState([]);

const handleBillsLogSearch = async () => {
  if (!billSearchID) {
    alert('Please enter an ID to search.');
    return;
  }
  try {
    const response = await fetch(`http://localhost:5050/billsByID?id=${billSearchID}`, {
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch bills log');
    }
    const data = await response.json();
    setBillsLog(data);
  } catch (error) {
    alert(error.message);
  }
};

//Fetch disputed Bills
const [disputedBills, setDisputedBills] = useState([]);
useEffect(() => {
  fetch('http://localhost:5050/disputedBills', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
    .then((response) => response.json())
    .then((data) => setDisputedBills(data))
    .catch((error) => console.error('Error fetching quotes:', error));
}, []);


//handle Bill rejection 
const [billRejectionNotes, setBillRejectionNotes] = useState({});

const handleClientBillNoteChange = (bill_id, value) => {
  setBillRejectionNotes(prev => ({ ...prev, [bill_id]: value }));
};
const handleRejectBill = (bill_id) => {
  const requestBody = {
    id: bill_id,
    note : billRejectionNotes[bill_id]
  };
  fetch('http://localhost:5050/rejectBill', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('token'),
    },
    body: JSON.stringify(requestBody)
  })
    .then((res) => {
      if (res.ok) {
        alert('Response submitted successfully');
        handleClose();
      } else {
        throw new Error('Failed to submit response');
      }
    })
    .catch((err) => alert(err.message));
};

//handle bill payment
const handlePayBill = (bill_id) => {
  const requestBody = {
    id: bill_id,
  };
  fetch('http://localhost:5050/payBill', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('token'),
    },
    body: JSON.stringify(requestBody)
  })
    .then((res) => {
      if (res.ok) {
        alert('Response submitted successfully');
        handleClose();
      } else {
        throw new Error('Failed to submit response');
      }
    })
    .catch((err) => alert(err.message));
};

//resend bill to client
const [billResendNotes, setBillResendNotes] = useState({});
const [billResendPrices, setBillResendPrices] = useState({});

const handleBillResendNoteChange = (bill_id, value) => {
  setBillResendNotes(prev => ({ ...prev, [bill_id]: value }));
};
const handleBillResendPriceChange = (bill_id, value) => {
  setBillResendPrices(prev => ({ ...prev, [bill_id]: value }));
};

const handleResendBill = (bill_id) => {
  const requestBody = {
    id: bill_id,
    note : billResendNotes[bill_id],
    price: billResendPrices[bill_id]
    
  };
  fetch('http://localhost:5050/resubmitBill', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('token'),
    },
    body: JSON.stringify(requestBody)
  })
    .then((res) => {
      if (res.ok) {
        alert('Response submitted successfully');
        handleClose();
      } else {
        throw new Error('Failed to submit response');
      }
    })
    .catch((err) => alert(err.message));
};

//Fetch This months quotes
const [thisMonthsQuotes, setThisMonthsQuotes] = useState([]);
useEffect(() => {
  fetch('http://localhost:5050/thisMonthsQuotes', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
    .then((response) => response.json())
    .then((data) => setThisMonthsQuotes(data))
    .catch((error) => console.error('Error fetching quotes:', error));
}, []);

//Fetch late paid bills
const [latePaidBills, setLatePaidBills] = useState([]);
useEffect(() => {
  fetch('http://localhost:5050/overdueBills', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
    .then((response) => response.json())
    .then((data) => setLatePaidBills(data))
    .catch((error) => console.error('Error fetching quotes:', error));
}, []);

//Fetch Prospective clients
const [prospectiveClients, setProspectiveClients] = useState([]);
useEffect(() => {
  fetch('http://localhost:5050/prospectiveClients', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
    .then((response) => response.json())
    .then((data) => setProspectiveClients(data))
    .catch((error) => console.error('Error fetching quotes:', error));
}, []);

//Fetch Bad clients
const [badClients, setBadClients] = useState([]);
useEffect(() => {
  fetch('http://localhost:5050/badClients', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
    .then((response) => response.json())
    .then((data) => setBadClients(data))
    .catch((error) => console.error('Error fetching bad clients:', error));
}, []);

//fetch good clients
const [goodClients, setGoodClients] = useState([]);
useEffect(() => {
  fetch('http://localhost:5050/goodClients', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
    .then((response) => response.json())
    .then((data) => setGoodClients(data))
    .catch((error) => console.error('Error fetching good clients:', error));
}, []);

//fetch largest driveway
const [largestDriveway, setLargestDriveway] = useState([]);
useEffect(() => {
  fetch('http://localhost:5050/largestDriveway', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
    .then((response) => response.json())
    .then((data) => setLargestDriveway(data))
    .catch((error) => console.error('Error fetching largest driveway:', error));
}, []);

//fetch big clients
const [bigClients, setBigCLients] = useState([]);
useEffect(() => {
  fetch('http://localhost:5050/bigClients', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
    .then((response) => response.json())
    .then((data) => setBigCLients(data))
    .catch((error) => console.error('Error fetching Big CLients:', error));
}, []);

//fetch difficult clients
const [difficultClients, setDifficultClients] = useState([]);
useEffect(() => {
  fetch('http://localhost:5050/difficultClients', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
    .then((response) => response.json())
    .then((data) => setDifficultClients(data))
    .catch((error) => console.error('Error fetching Difficult CLients:', error));
}, []);



  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* check userType to display relevant title  */}
      <h2 style={{ fontSize: '2rem', color: '#007bff', textAlign: 'center', marginBottom: '20px' }}>
      {userType === 'Admin' ? 'Admin Dashboard' : 'Client Dashboard'}</h2>
      

      {/* Nav Menu - Home, Profile, Logout (Seen in both ADMIN and CLIENT view) */}
      <nav style={{ textAlign: 'center', marginBottom: '20px' }}>
        <ul style={{ listStyleType: 'none', padding: '0', display: 'flex', justifyContent: 'center', gap: '40px', alignItems: 'center' }}>
          <li>
            <Link to="/" style={{ textDecoration: 'none', fontSize: '1.2rem', color: '#007bff', padding: '10px 20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              Home
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              style={{
                fontSize: '1.2rem',
                color: '#007bff',
                backgroundColor: '#f5f5f5',
                padding: '10px 20px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
      

      {/* ------------DAVID SMITH'S VIEW (ADMIN)------------ */}
      {userType === 'Admin' ? (
        <>
        <br/><h1 style={{ color: '#006400'}}>Welcome, {username}</h1><br/>

        <h2> Most Recent pending Quote</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Quote REQ ID</th>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Username</th>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Address</th>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Square Feet</th>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Proposed Price</th>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Note</th>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Expand/Respond</th>
          </tr>
        </thead>
        <tbody>
        {recentQuoteDavid.map((quote) => (
              <tr key={quote.id}>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.username}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.address}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.squareFeet}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>${quote.proposedPrice}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.note}</td>
              <td>
              {quote.awaitingClientResponse ? (
              <button onClick={() => handleOpen(quote)} 
              style={{ backgroundColor: '#ffa500', color: '#fff', padding: '5px 10px', border: 'none', borderRadius: '4px' }}>
              View Request (Awaiting Client)
              </button>
              ) : (
              <button onClick={() => handleOpen(quote)} 
              style={{ backgroundColor: '#008000', color: '#fff', padding: '5px 10px', border: 'none', borderRadius: '4px' }}>
              Respond to Quote (Awaiting Your Response)
              </button>
            )}
            </td>
            </tr>
          ))}
        </tbody>
        </table>

        <Modal isOpen={open} onClose={handleClose}>
        {selectedQuote && (
        <>
<h2>Quote Details</h2>
      <div style={{ marginBottom: '5px' }}>
        <strong>ID:</strong> {selectedQuote.id}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Username:</strong> {selectedQuote.username}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Address:</strong> {selectedQuote.address}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Square Feet:</strong> {selectedQuote.squareFeet} sq. ft.
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Proposed Price:</strong> ${selectedQuote.proposedPrice}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Note:</strong> {selectedQuote.note}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Created at:</strong> {new Date(selectedQuote.createdAt).toLocaleString('en-US')}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Images:</strong> {'Add images when figured out'}
      </div>


{/* Conditional rendering for the quote response form */}
{!selectedQuote.awaitingClientResponse ? (
        <>
          <h1>Send Counter Quote</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRespondToQuote();
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <label>
                <strong>Start Date & Time:</strong>
              </label>
              <input
                type="datetime-local"
                value={response.startDatetime}
                onChange={(e) =>
                  setResponse({ ...response, startDatetime: e.target.value })
                }
                required
                style={{ marginLeft: '10px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>
                <strong>End Date & Time:</strong>
              </label>
              <input
                type="datetime-local"
                value={response.endDatetime}
                onChange={(e) =>
                  setResponse({ ...response, endDatetime: e.target.value })
                }
                required
                style={{ marginLeft: '10px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>
                <strong>Price:</strong>
              </label>
              <input
                type="number"
                value={response.price}
                onChange={(e) =>
                  setResponse({ ...response, price: e.target.value })
                }
                required
                style={{ marginLeft: '10px' }}
              />
            </div>
            <button
              type="submit"
              style={{ padding: '10px 20px', marginTop: '10px' }}
            >
              Submit Response
            </button>

            </form>

      <h1>Reject Quote</h1>
      <form
      onSubmit={(e) => {
        e.preventDefault();
        handleRejectQuote();
      }}>
      <div style={{ marginBottom: '10px' }}>
        <label>
          <strong>Rejection Note:</strong>
        </label>
        <textarea
          value={rejectionNote}
          onChange={(e) => setRejectionNote(e.target.value)}
          style={{ marginLeft: '10px', width: '100%' }}
          placeholder="Provide a reason for rejecting this quote"
          required
        />
      </div>
      <button
        type="submit"
        style={{ padding: '10px 20px', marginTop: '10px', backgroundColor: '#f44336', color: 'white' }}
      >
        Reject Quote
      </button>
      </form>
        </>
      ) : (
        <div style={{ marginTop: '20px', color: '#888' }}>
          <h3>This quote is waiting for Client Response. No actions can be taken</h3>
        </div>
      )}

      </>
        )}
    </Modal>

        <h2> All pending Quotes/Requests</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Quote REQ ID</th>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Username</th>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Address</th>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Square Feet</th>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Proposed Price</th>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Note</th>
            <th style={{ border: '1px solid #ddd', padding: '6px' }}>Expand/Respond</th>
            {/* <th style={{ border: '1px solid #ddd', padding: '6px' }}>Accept</th> */}
          </tr>
        </thead>
        <tbody>
          {pendingQuotes.map((quote) => (
            <tr key={quote.id}>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.username}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.address}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.squareFeet}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>${quote.proposedPrice}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.note}</td>
              <td>
              {quote.awaitingClientResponse ? (
              <button onClick={() => handleOpen(quote)} 
              style={{ backgroundColor: '#ffa500', color: '#fff', padding: '5px 10px', border: 'none', borderRadius: '4px' }}>
              View Request (Awaiting Client)
              </button>
              ) : (
              <button onClick={() => handleOpen(quote)} 
              style={{ backgroundColor: '#008000', color: '#fff', padding: '5px 10px', border: 'none', borderRadius: '4px' }}>
              Respond to Quote (Awaiting Your Response)
              </button>
            )}
            </td>
            {/* <td style={{ border: '1px solid #ddd', padding: '6px' }}>
        {!quote.awaitingClientResponse && quote.proposed_start  ? (
              <button onClick={() => handleAcceptQuote(quote.id)} 
              style={{ backgroundColor: '#008000', color: '#fff', padding: '5px 10px', border: 'none', borderRadius: '4px' }}>
              Accept
              </button>
              ) : (
              <p>Can't Accept yet</p>
              )}
        </td> */}
            </tr>
          ))}
        </tbody>
        </table>

        <Modal isOpen={open} onClose={handleClose}>
        {selectedQuote && (
        <>
<h2>Quote Details</h2>
      <div style={{ marginBottom: '5px' }}>
        <strong>ID:</strong> {selectedQuote.id}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Username:</strong> {selectedQuote.username}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Address:</strong> {selectedQuote.address}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Square Feet:</strong> {selectedQuote.squareFeet} sq. ft.
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Proposed Price:</strong> ${selectedQuote.proposedPrice}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Note:</strong> {selectedQuote.note}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Created at:</strong> {new Date(selectedQuote.createdAt).toLocaleString('en-US')}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Images:</strong> {'Add images when figured out'}
      </div>

{/* Conditional rendering for the quote response form */}
{!selectedQuote.awaitingClientResponse ? (
        <>
          <h1>Send Counter Quote</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRespondToQuote();
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <label>
                <strong>Start Date & Time:</strong>
              </label>
              <input
                type="datetime-local"
                value={response.startDatetime}
                onChange={(e) =>
                  setResponse({ ...response, startDatetime: e.target.value })
                }
                required
                style={{ marginLeft: '10px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>
                <strong>End Date & Time:</strong>
              </label>
              <input
                type="datetime-local"
                value={response.endDatetime}
                onChange={(e) =>
                  setResponse({ ...response, endDatetime: e.target.value })
                }
                required
                style={{ marginLeft: '10px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>
                <strong>Price:</strong>
              </label>
              <input
                type="number"
                value={response.price}
                onChange={(e) =>
                  setResponse({ ...response, price: e.target.value })
                }
                required
                style={{ marginLeft: '10px' }}
              />
            </div>
            <button
              type="submit"
              style={{ padding: '10px 20px', marginTop: '10px' }}
            >
              Submit Response
            </button>

            </form>

      <h1>Reject Quote</h1>
      <form
      onSubmit={(e) => {
        e.preventDefault();
        handleRejectQuote();
      }}>
      <div style={{ marginBottom: '10px' }}>
        <label>
          <strong>Rejection Note:</strong>
        </label>
        <textarea
          value={rejectionNote}
          onChange={(e) => setRejectionNote(e.target.value)}
          style={{ marginLeft: '10px', width: '100%' }}
          placeholder="Provide a reason for rejecting this quote"
          required
        />
      </div>
      <button
        type="submit"
        style={{ padding: '10px 20px', marginTop: '10px', backgroundColor: '#f44336', color: 'white' }}
      >
        Reject Quote
      </button>
      </form>
        </>
      ) : (
        <div style={{ marginTop: '20px', color: '#888' }}>
          <h3>This quote is waiting for Client Response. No actions can be taken</h3>
        </div>
      )}

      </>
        )}
    </Modal>

    <h2> Find quote history</h2>
      <input
        type="text"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        placeholder="Search for quote history by ID"
        style={{ padding: '10px', width: '200px' }}
      />
      <button onClick={handleQuotesLogSearch} style={{ padding: '5px 10px', marginTop: '10px'}}>
        Search
      </button>
      <div style={{ marginTop: '20px' }}>
        {quotes_log.length > 0 && (
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Address</th>
                <th>Square Feet</th>
                <th>Proposed Price</th>
                <th>Note</th>
                <th>Logged At</th>
                <th>Username</th>
                <th>Proposed Start</th>
                <th>Proposed End</th>
                <th>Status</th>
                <th>LOG#</th>
              </tr>
            </thead>
            <tbody>
              {quotes_log.map((quote) => (
                <tr key={quotes_log.logID}>
                  <td>{quote.id}</td>
                  <td>{quote.address}</td>
                  <td>{quote.squareFeet}</td>
                  <td>{quote.proposedPrice}</td>
                  <td>{quote.note}</td>
                  <td>{quote.createdAt}</td>
                  <td>{quote.username}</td>
                  <td>{new Date(quote.proposed_start).toLocaleString('en-US')}</td>
                  <td>{new Date(quote.proposed_end).toLocaleString('en-US')}</td>
                  <td>{quote.quote_status}</td>
                  <td>{quote.logID}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {quotes_log.length === 0 && <p>No results found.</p>}
      </div>

        <h2>Work Orders</h2>

        <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Address</th>
                <th>Square Feet</th>
                <th>Proposed Price</th>
                <th>Note</th>
                <th>Logged At</th>
                <th>Username</th>
                <th>Proposed Start</th>
                <th>Proposed End</th>
                <th>Status</th>
                <th>Work Complete/Generate Bill</th>
              </tr>
            </thead>
            <tbody>
              {ordersOfWork.map((workOrder) => (
                <tr key={workOrder.id}>
                  <td>{workOrder.id}</td>
                  <td>{workOrder.address}</td>
                  <td>{workOrder.squareFeet}</td>
                  <td>{workOrder.proposedPrice}</td>
                  <td>{workOrder.note}</td>
                  <td>{new Date(workOrder.createdAt).toLocaleString('en-US')}</td>
                  <td>{workOrder.username}</td>
                  <td>{new Date(workOrder.proposed_start).toLocaleString('en-US')}</td>
                  <td>{new Date(workOrder.proposed_end).toLocaleString('en-US')}</td>
                  <td>{workOrder.quote_status}</td>
                  <td>
                     <button onClick={() => generateBill(workOrder)} >
                      Generate Bill
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        <h2>Disputed Bills (resend to client)</h2>

        <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
              <th>Bill ID</th>
                <th>Quote ID</th>
                <th>Address</th>
                <th>Square Feet</th>
                <th>Price</th>
                <th>Username</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Note</th>
                <th>Resend bill</th>
              </tr>
            </thead>
            <tbody>
              {disputedBills.map((bill) => (
                <tr key={bill.bill_id}>
                  <td>{bill.bill_id}</td>
                  <td>{bill.quote_id}</td>
                  <td>{bill.address}</td>
                  <td>{bill.squareFeet}</td>
                  <td>{bill.price}</td>
                  <td>{bill.username}</td>
                  <td>{new Date(bill.createdAt).toLocaleString('en-US')}</td>
                  <td>{bill.bill_status}</td>
                  <td>{bill.note}</td>
                  <td>
                    <textarea
                      value={billResendNotes[bill.bill_id] || ''} 
                      onChange={(e) => handleBillResendNoteChange(bill.bill_id, e.target.value)} 
                      placeholder="Add note with new bill" 
                      rows="4" 
                      style={{padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />

                    <input
                        type="number"
                        value={billResendPrices[bill.bill_id] || ''}
                        onChange={(e) => handleBillResendPriceChange(bill.bill_id, e.target.value)}
                        placeholder="Price"
                        style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '4px', margin: '4px' }}
                      />
                      <button onClick={() =>handleResendBill(bill.bill_id)} >
                        Resend Bill
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        <h2>Full Bill Log History</h2>

        <input
        type="text"
        value={billSearchID}
        onChange={(e) => setBillSearchID(e.target.value)}
        placeholder="Find complete bill history by ID"
        style={{ padding: '10px', width: '200px' }}
      />
      <button onClick={handleBillsLogSearch} style={{ padding: '5px 10px', marginTop: '10px'}}>
        Search
      </button>


      <div style={{ marginTop: '20px' }}>
        {billsLog.length > 0 && (
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
              <th>Bill ID</th>
                <th>Quote ID</th>
                <th>Address</th>
                <th>Square Feet</th>
                <th>Price</th>
                <th>Username</th>
                <th>Note</th>                
                <th>Created At</th>
                <th>Log DATETIME</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {billsLog.map((bill) => (
                <tr key={bill.bill_log_id}>
                  <td>{bill.bill_id}</td>
                  <td>{bill.quote_id}</td>
                  <td>{bill.address}</td>
                  <td>{bill.squareFeet}</td>
                  <td>{bill.price}</td>
                  <td>{bill.username}</td>
                  <td>{bill.note}</td>                  
                  <td>{new Date(bill.createdAt).toLocaleString('en-US')}</td>
                  <td>{new Date(bill.modifiedAt).toLocaleString('en-US')}</td>
                  <td>{bill.bill_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {quotes_log.length === 0 && <p>No results found.</p>}
      </div>

        <h2>Generate Revenue Report</h2>
        <RevenueReportForm/>

        <h2>Additional Queries</h2>
        <h3>This Months Quotes</h3>
        <p>List all the AGREED quotes in this month (Say December 2024).</p>

        {thisMonthsQuotes.length > 0 && (
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Address</th>
                <th>Square Feet</th>
                <th>Proposed Price</th>
                <th>Note</th>
                <th>Logged At</th>
                <th>Username</th>
                <th>Proposed Start</th>
                <th>Proposed End</th>
                <th>Status</th>
                <th>LOG#</th>
              </tr>
            </thead>
            <tbody>
              {thisMonthsQuotes.map((quote) => (
                <tr key={quote.logID}>
                  <td>{quote.id}</td>
                  <td>{quote.address}</td>
                  <td>{quote.squareFeet}</td>
                  <td>{quote.proposedPrice}</td>
                  <td>{quote.note}</td>
                  <td>{new Date(quote.createdAt).toLocaleString('en-US')}</td>
                  <td>{quote.username}</td>
                  <td>{new Date(quote.proposed_start).toLocaleString('en-US')}</td>
                  <td>{new Date(quote.proposed_end).toLocaleString('en-US')}</td>
                  <td>{quote.quote_status}</td>
                  <td>{quote.logID}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {thisMonthsQuotes.length === 0 && <p>No results found.</p>}

        <h3>Late Bills</h3>
        <p>Lists bills which are unpaid after one week, OR were paid over one week after creation</p>

        {latePaidBills.length > 0 && (
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
              <th>Bill ID</th>
                <th>Quote ID</th>
                <th>Address</th>
                <th>Square Feet</th>
                <th>Price</th>
                <th>Username</th>
                <th>Note</th>                
                <th>Created At</th>
                <th>Paid At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {latePaidBills.map((bill) => (
                <tr key={bill.bill_id}>
                  <td>{bill.bill_id}</td>
                  <td>{bill.quote_id}</td>
                  <td>{bill.address}</td>
                  <td>{bill.squareFeet}</td>
                  <td>{bill.price}</td>
                  <td>{bill.username}</td>
                  <td>{bill.note}</td>                  
                  <td>{new Date(bill.createdAt).toLocaleString('en-US')}</td>
                  <td>{new Date(bill.paidAt).toLocaleString('en-US')}</td>
                  <td>{bill.bill_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {latePaidBills.length === 0 && <p>No results found.</p>}

        <h3>Prospective Clients</h3>
        <p>Lists users who never requested a quote</p>

        {prospectiveClients.length > 0 && (
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
              <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {prospectiveClients.map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {prospectiveClients.length === 0 && <p>No results found.</p>}

        <h3>Bad Clients</h3>
        <p>Lists users who never paid a bill on time</p>

        {badClients.length > 0 && (
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
              <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {badClients.map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {badClients.length === 0 && <p>No results found.</p>}

        <h3>Good Clients</h3>
        <p>Lists users who paid every bill in less than one day</p>
        {goodClients.length > 0 && (
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
              <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {goodClients.map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {goodClients.length === 0 && <p>No results found.</p>}

        <h3>Largest Driveway</h3>
        <p>List the locations of the driveways that have the largest square feet that
David Smith ever worked, list all locations if there is a tie or list just one location if there is no
tie</p>

        {largestDriveway.length > 0 && (
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
              <th>Address</th>
              <th>Square Feet</th>
              </tr>
            </thead>
            <tbody>
              {largestDriveway.map((quote_log, index) => (
                <tr key={index}>
                  <td>{quote_log.address}</td>
                  <td>{quote_log.squareFeet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {largestDriveway.length === 0 && <p>No results found.</p>}

        <h3>Big Clients</h3>
        <p>List the clients that David Smith completed the most number of orders. List one
        client if there is no tie, list all the top clients if there is a tie. </p>

        {bigClients.length > 0 && (
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
              <th>Username</th>
              <th># of Orders completed</th>
              </tr>
            </thead>
            <tbody>
              {bigClients.map((bigClients, index) => (
                <tr key={index}>
                  <td>{bigClients.username}</td>
                  <td>{bigClients.order_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {bigClients.length === 0 && <p>No results found.</p>}

        <h3>Difficult Clients</h3>
        <p>List the clients who sent three different requests to David Smith but then
        never followed up afterwards</p>

        {difficultClients.length > 0 && (
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
              <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {difficultClients.map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {difficultClients.length === 0 && <p>No results found.</p>}
        </>

      ) : (
        /* CLIENT'S VIEW */
        <>
        <br/><h1 style={{ color: '#006400'}}>Welcome, {username}</h1><br/>

        <h2>Most Recent Quote from David</h2>
        {recentQuoteClient.length > 0 && (
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
              <th style={{ border: '1px solid #ddd', padding: '6px' }}>Quote REQ ID</th>
              <th style={{ border: '1px solid #ddd', padding: '6px' }}>Username</th>
              <th style={{ border: '1px solid #ddd', padding: '6px' }}>Address</th>
              <th style={{ border: '1px solid #ddd', padding: '6px' }}>Square Feet</th>
              <th style={{ border: '1px solid #ddd', padding: '6px' }}>Proposed Price</th>
              <th style={{ border: '1px solid #ddd', padding: '6px' }}>Note</th>
              <th style={{ border: '1px solid #ddd', padding: '6px' }}>Start Time</th>
              <th style={{ border: '1px solid #ddd', padding: '6px' }}>End Time</th>
              <th style={{ border: '1px solid #ddd', padding: '6px' }}>Accept</th>
              <th style={{ border: '1px solid #ddd', padding: '6px',width: '200px' }}>Respond</th>
              </tr>
            </thead>
            <tbody>
              {recentQuoteClient.map((quote) => (
                <tr key={quote.id}>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.username}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.address}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.squareFeet}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>${quote.proposedPrice}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.note}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{new Date(quote.proposed_start).toLocaleString('en-US')}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{new Date(quote.proposed_end).toLocaleString('en-US')}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>
        {quote.awaitingClientResponse ? (
              <button onClick={() => handleAcceptQuote(quote.id)} 
              style={{ backgroundColor: '#008000', color: '#fff', padding: '5px 10px', border: 'none', borderRadius: '4px' }}>
              Accept
              </button>
              ) : (
              <p>Awaiting David</p>
              )}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>
              {quote.awaitingClientResponse ? (
                    <>
                    <textarea
                    value={clientResponseNotes[quote.id] || ''} 
                    onChange={(e) => handleNoteChange(quote.id, e.target.value)} 
                    placeholder="Enter response here..." 
                    rows="4" 
                    style={{padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <button onClick={() => handleClientResponseToQuote(quote.id)} >
                  Respond
                    </button>
                    </>
                    ) : (
                    <p>Awaiting David</p>
                    )}
              </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {recentQuoteClient.length === 0 && <p>No recent quote available to respond to.</p>}

        <h2> Submit a request for quote</h2>
          <QuoteRequestForm />

        <h2>My pending quotes</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
  <thead>
    <tr>
    <th style={{ border: '1px solid #ddd', padding: '6px' }}>Quote REQ ID</th>
      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Username</th>
      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Address</th>
      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Square Feet</th>
      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Proposed Price</th>
      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Note</th>
      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Start Time</th>
      <th style={{ border: '1px solid #ddd', padding: '6px' }}>End Time</th>
      <th style={{ border: '1px solid #ddd', padding: '6px' }}>Accept</th>
      <th style={{ border: '1px solid #ddd', padding: '6px',width: '200px' }}>Respond</th>
    </tr>
  </thead>
  <tbody>
    {pendingQuotesByUsername.map((quote) => (
      <tr key={quote.id}>
        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.id}</td>
        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.username}</td>
        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.address}</td>
        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.squareFeet}</td>
        <td style={{ border: '1px solid #ddd', padding: '6px' }}>${quote.proposedPrice}</td>
        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quote.note}</td>
        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{new Date(quote.proposed_start).toLocaleString('en-US')}</td>
        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{new Date(quote.proposed_end).toLocaleString('en-US')}</td>
        <td style={{ border: '1px solid #ddd', padding: '6px' }}>
        {quote.awaitingClientResponse ? (
              <button onClick={() => handleAcceptQuote(quote.id)} 
              style={{ backgroundColor: '#008000', color: '#fff', padding: '5px 10px', border: 'none', borderRadius: '4px' }}>
              Accept
              </button>
              ) : (
              <p>Awaiting David</p>
              )}
        </td>
        <td style={{ border: '1px solid #ddd', padding: '6px' }}>
        {quote.awaitingClientResponse ? (
              <>
              <textarea
              //  value={clientResponseNote}
              //  onChange={(e) => setClientResponseNote(e.target.value)}
              //updated clientResponseNote to handle rows independently
              value={clientResponseNotes[quote.id] || ''} 
              onChange={(e) => handleNoteChange(quote.id, e.target.value)} 
              placeholder="Enter response here..." 
              rows="4" 
              style={{padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <button onClick={() => handleClientResponseToQuote(quote.id)} >
             Respond
              </button>
              </>
              ) : (
              <p>Awaiting David</p>
              )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
        <h2>Bills to Pay</h2>
        <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Quote ID</th>
                <th>Address</th>
                <th>Square Feet</th>
                <th>Price</th>
                <th>Username</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Note</th>
                <th>PAY NOW</th>
                <th>REJECT</th>
              </tr>
            </thead>
            <tbody>
              {clientBills.map((bill) => (
                <tr key={bill.bill_id}>
                  <td>{bill.bill_id}</td>
                  <td>{bill.quote_id}</td>
                  <td>{bill.address}</td>
                  <td>{bill.squareFeet}</td>
                  <td>{bill.price}</td>
                  <td>{bill.username}</td>
                  <td>{new Date(bill.createdAt).toLocaleString('en-US')}</td>
                  <td>{bill.bill_status}</td>
                  <td>{bill.note}</td>
                  <td>
                  <button onClick={() => handlePayBill(bill.bill_id)} >
                      Pay Now
                    </button>
                  </td>
                  <td>
                    <textarea
                    value={billRejectionNotes[bill.bill_id] || ''} 
                    onChange={(e) => handleClientBillNoteChange(bill.bill_id, e.target.value)} 
                    placeholder="Reason For Rejecting Bill" 
                    rows="4" 
                    style={{padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <button onClick={() => handleRejectBill(bill.bill_id)} >
                      Dispute
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        <h2>My Quote History</h2>
        <div style={{ marginTop: '20px' }}>
        {quotes_log_for_client.length > 0 && (
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Address</th>
                <th>Square Feet</th>
                <th>Proposed Price</th>
                <th>Note</th>
                <th>Logged At</th>
                <th>Username</th>
                <th>Proposed Start</th>
                <th>Proposed End</th>
                <th>Status</th>
                <th>LOG#</th>
              </tr>
            </thead>
            <tbody>
              {quotes_log_for_client.map((quote) => (
                <tr key={quote.logID}>
                  <td>{quote.id}</td>
                  <td>{quote.address}</td>
                  <td>{quote.squareFeet}</td>
                  <td>{quote.proposedPrice}</td>
                  <td>{quote.note}</td>
                  <td>{new Date(quote.createdAt).toLocaleString('en-US')}</td>
                  <td>{quote.username}</td>
                  <td>{new Date(quote.proposed_start).toLocaleString('en-US')}</td>
                  <td>{new Date(quote.proposed_end).toLocaleString('en-US')}</td>
                  <td>{quote.quote_status}</td>
                  <td>{quote.logID}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {quotes_log_for_client.length === 0 && <p>No results found.</p>}
      </div>
        <h2>My Active Orders of Work (Contract created, work) </h2>

        <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Address</th>
                <th>Square Feet</th>
                <th>Proposed Price</th>
                <th>Note</th>
                <th>Logged At</th>
                <th>Username</th>
                <th>Proposed Start</th>
                <th>Proposed End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ordersOfWorkForClient.map((workOrder) => (
                <tr key={workOrder.id}>
                  <td>{workOrder.id}</td>
                  <td>{workOrder.address}</td>
                  <td>{workOrder.squareFeet}</td>
                  <td>{workOrder.proposedPrice}</td>
                  <td>{workOrder.note}</td>
                  <td>{new Date(workOrder.createdAt).toLocaleString('en-US')}</td>
                  <td>{workOrder.username}</td>
                  <td>{new Date(workOrder.proposed_start).toLocaleString('en-US')}</td>
                  <td>{new Date(workOrder.proposed_end).toLocaleString('en-US')}</td>
                  <td>{workOrder.quote_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};


export default Dashboard;
