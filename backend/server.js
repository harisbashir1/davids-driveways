const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5050;

// Middleware to parse JSON data and handle CORS (Cross-Origin Resource Sharing)
app.use(bodyParser.json());
app.use(cors());


// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',  // Database host, usually 'localhost' in local development
  user: 'root',       // Default username in XAMPP
  password: '',       // Leave blank if no password is set in XAMPP
  database: 'driveway_db',  // Database name
});

// Connect to the MySQL database
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Start the server and listen on port defined
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// User registration route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;  // Extract username, email, and password from request body
  const hashedPassword = await bcrypt.hash(password, 10);  // Hash the password using bcrypt with 10 salt rounds

  // Insert the new user into the 'users' table
  db.query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'User registration failed', error: err });  // Send error response if registration fails
      }
      res.status(201).json({ message: 'User registered successfully' });  // Send success response
    }
  );
});

// User login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;  // Extract username and password from request body

  // Query the database for the user with the provided username
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: 'User not found' });  // Send error response if user is not found
    }

    const user = results[0];  // Get the user record from the query result
    const passwordMatch = await bcrypt.compare(password, user.password);  // Compare the provided password with the hashed password

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });  // Send error response if the password does not match
    }

    // Generate a JWT token with the user ID and a secret key, valid for 3 hour
    const token = jwt.sign({ userId: user.id, userType: user.user_type, username: user.username }, 'your_jwt_secret', { expiresIn: '3h' });

    // Send the JWT token as the response
    res.json({ token });
  });
});

// Middleware function to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];  // Get the token from the 'Authorization' header

  if (!token) return res.status(401).json({ message: 'Access denied' });  // If no token is provided, deny access

  // Verify the JWT token
  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });  // If the token is invalid, send a 403 error
    req.user = user;  // Store the decoded user data in the request object
    next();  // Proceed to the next middleware/route handler
  });
};

// Protected route that requires JWT authentication
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the dashboard. You are authenticated!' });  // Send a success message if authentication is valid
});


app.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;  // Extract userId from the decoded JWT token

  // Query the database to get the user data based on the userId
  db.query('SELECT username, email FROM users WHERE id = ?', [userId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: 'User not found' });  // Send error if user not found
    }

    // Send user profile data as response
    res.json({ username: result[0].username, email: result[0].email });
  });
});

//submit a quote endpoint
app.post('/submit_quote', async (req, res) => {
  const {address, squareFeet, proposedPrice, note, username} = req.body;  
  db.query(
    'INSERT INTO quotes (address, squareFeet, proposedPrice, note, username) VALUES (?, ?, ?, ?, ?)',
    [address, squareFeet, proposedPrice, note, username],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error Submitting Quote', error: err });  
      }
      res.status(201).json({ message: 'Quote submit successfully' });  
    }
  );
});

//get pending quotes for David
app.get('/pendingQuotes', authenticateToken, (req, res) => {
  db.query('SELECT * FROM quotes WHERE quote_status = "pending" ', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve quotes', error: err });
    }
    res.json(results);
  });
});

//get pending quotes for user
app.get('/pendingQuotesByUsername', authenticateToken, (req, res) => {
  const username = req.user.username;
  db.query('SELECT * FROM quotes WHERE username = ? AND quote_status = "pending"', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve quotes', error: err });
    }
    res.json(results);
  });
});

//respond to quote endpoint
app.post('/respondToQuote', authenticateToken, (req, res) => {
  const { id, startDatetime, endDatetime, price} = req.body;
  db.query(`
    UPDATE quotes 
    SET 
      proposed_start = ?, 
      proposed_end = ?, 
      proposedPrice = ?, 
       awaitingClientResponse = TRUE 
    WHERE id = ?`,
     [startDatetime,endDatetime,price,id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to update quote', error: err });
    }
    res.json(results);
  });
});

//reject quote endpoint
app.post('/rejectQuote', authenticateToken, (req, res) => {
  const { id, note } = req.body;
  db.query(`
    UPDATE quotes 
    SET 
      note = ?,
      quote_status = 'rejected'
    WHERE id = ?`,
     [note,id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to reject quote', error: err });
    }
    res.json(results);
  });
});

//respond to quote (client)
app.post('/clientResponseToQuote', authenticateToken, (req, res) => {
  const { id, note } = req.body;
  const updatedNote = `${note} - CLIENT`;
  db.query(`
    UPDATE quotes 
    SET 
      note = ?,
      awaitingClientResponse = FALSE 
    WHERE id = ?`,
     [updatedNote,id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to respond to quote', error: err });
    }
    res.json(results);
  });
});

//accept quotes
app.post('/acceptQuote', authenticateToken, (req, res) => {
  const { id } = req.body;
  db.query(`
    UPDATE quotes 
    SET 
      quote_status = 'accepted'
    WHERE id = ?`,
     [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to accept quote', error: err });
    }
    res.json(results);
  });
});

//get quotes from quotes_log by ID
app.get('/quotesLogByID', authenticateToken, (req, res) => {
  const { id } = req.query;
  db.query('SELECT * FROM quotes_log WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve quotes', error: err });
    }
    res.json(results);
  });
});

//get quotes by username
app.get('/quotesLogByUsername', authenticateToken, (req, res) => {
  const username = req.user.username;
  db.query('SELECT * FROM quotes_log WHERE username = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve quotes', error: err });
    }
    res.json(results); 
  });
});

//most recent quote where client can respond
app.get('/mostRecentQuoteForClient', authenticateToken, (req, res) => {
  const username = req.user.username;
  const query = `
SELECT * 
FROM quotes 
WHERE id = (
    SELECT id
    FROM quotes_log 
    WHERE quote_status = 'pending' AND username = ? 
    AND id IN (
        SELECT id 
        FROM quotes 
        WHERE awaitingClientResponse = 1 AND quote_status = 'pending' 
    )
    ORDER BY createdAt DESC 
    LIMIT 1
);
  `;
  db.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve the most recent quote', error: err });
    }
    res.json(results);
  });
});
//most recent quote where david can respond
app.get('/mostRecentQuoteForDavid', authenticateToken, (req, res) => {
  const username = req.user.username;
  const query = `
SELECT * 
FROM quotes 
WHERE id = (
    SELECT id
    FROM quotes_log 
    WHERE quote_status = 'pending' 
    AND id IN (
        SELECT id 
        FROM quotes 
        WHERE awaitingClientResponse = 0 AND quote_status = 'pending' 
    )
    ORDER BY createdAt DESC 
    LIMIT 1
);
  `;
  db.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve the most recent quote', error: err });
    }
    res.json(results);
  });
});

//ORDERS OF WORK-------------------------------------------------------------------------
//get all orders of work for Davids dashboard
app.get('/ordersOfWork', authenticateToken, (req, res) => {
  db.query('SELECT * FROM quotes WHERE quote_status = "accepted"', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve orders of work', error: err });
    }
    res.json(results);
  });
});

//get orders of work by user
app.get('/ordersOfWorkByUser', authenticateToken, (req, res) => {
  const username = req.user.username;
  db.query('SELECT * FROM quotes WHERE quote_status = "accepted" && username = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve orders of work for user', error: err });
    }
    res.json(results); 
  });
});


//BILLS---------------------------------------------------------------------------
app.post('/generateBill', authenticateToken, (req, res) => {
  const { id, address, squareFeet, price, username } = req.body;

  db.query(`
    INSERT INTO bills (quote_id, address, squareFeet, price, username, bill_status) 
    VALUES (?, ?, ?, ?, ?, 'pending')`, 
    [id, address, squareFeet, price, username], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to create bill', error: err });
      }

  db.query(`
    UPDATE quotes 
    SET 
      quote_status = 'work_complete'
    WHERE id = ?`,
     [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to generate bill', error: err });
    }
    res.json(results);
    });
  });
});

//fetch bills by User endpoint
app.get('/billsByUser', authenticateToken, (req, res) => {
  const username = req.user.username;
  db.query('SELECT * FROM bills WHERE bill_status = "pending" && username = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve quotes', error: err });
    }
    res.json(results); 
  });
});
//fetch bills by ID enpoint
app.get('/billsByID', authenticateToken, (req, res) => {
  const { id } = req.query;
  db.query('SELECT * FROM bills_log WHERE bill_id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve bills', error: err });
    }
    res.json(results); 
  });
});

//dispute bills endpoint
app.get('/disputedBills', authenticateToken, (req, res) => {
  db.query('SELECT * FROM bills WHERE bill_status = "disputed"', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to dispute bill', error: err });
    }
    res.json(results); 
  });
});


app.post('/rejectBill', authenticateToken, (req, res) => {
  const { id, note } = req.body;
  console.log(req.body)
  const updatedNote = `${note} - CLIENT`;
  db.query(`
    UPDATE bills 
    SET 
      note = ?,
      bill_status = 'disputed'
    WHERE bill_id = ?`,
     [updatedNote,id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to reject bill', error: err });
    }
    res.json(results);
  });
});

//resubmit bill endpoint
app.post('/resubmitBill', authenticateToken, (req, res) => {
  const { id, note, price } = req.body;
  console.log(req.body);

  let query = 'UPDATE bills SET bill_status = "pending"';
  const queryParams = [];

  if (note !== undefined) {
    query += ', note = ?';
    queryParams.push(`${note} - DAVID`);
  }
  else {
    query += ', note = ?';
    queryParams.push("No note from David");
  }
  if (price !== undefined) {
    query += ', price = ?';
    queryParams.push(price);
  }

  query += ' WHERE bill_id = ?';
  queryParams.push(id);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to resubmit bill', error: err });
    }
    res.json(results);
  });
});


app.post('/payBill', authenticateToken, (req, res) => {
  const { id } = req.body;
  db.query(`
    UPDATE bills 
    SET 
      bill_status = 'paid',
      paidAt = NOW()
    WHERE bill_id = ?`,
     [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to reject bill', error: err });
    }
    res.json(results);
  });
});


//THIS MONTHS QUOTES
app.get('/thisMonthsQuotes', authenticateToken, (req, res) => {
  const query = `
    SELECT * FROM quotes_log
    WHERE quote_status = 'accepted'
      AND YEAR(createdAt) = YEAR(CURRENT_DATE)
      AND MONTH(createdAt) = MONTH(CURRENT_DATE)
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve this months quotes', error: err });
    }
    res.json(results); 
  });
});

//OVERDUE BILLS
app.get('/overdueBills', authenticateToken, (req, res) => {
  const query = `
    SELECT * FROM bills
    WHERE bill_status != 'paid'
      AND createdAt < NOW() - INTERVAL 1 WEEK
  `;
  const queryLatePaid = `
    SELECT * FROM bills
    WHERE bill_status = 'paid'
      AND paidAt > createdAt + INTERVAL 1 WEEK
  `;
  db.query(query, (err1, unpaidResults) => {
    if (err1) {
      return res.status(500).json({ message: 'Failed to retrieve unpaid bills', error: err1 });
    }

    db.query(queryLatePaid, (err2, latePaidResults) => {
      if (err2) {
        return res.status(500).json({ message: 'Failed to retrieve late paid bills', error: err2 });
      }
      const allLateBills = [...unpaidResults, ...latePaidResults];
      res.json(allLateBills);
    });
  });
});

//PROSPECTIVE CLIENTS
app.get('/prospectiveClients', authenticateToken, (req, res) => {
  const query = `
    SELECT username
    FROM users
    WHERE username NOT IN (
      SELECT DISTINCT username
      FROM quotes
    )
    AND username != 'david_smith';
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve prospective clients', error: err });
    }
    res.json(results);
  });
});

//bad clients endpoint
app.get('/badClients', authenticateToken, (req, res) => {
  const query = 
  `SELECT username
FROM users
WHERE NOT EXISTS (
    SELECT 1 
    FROM bills 
    WHERE bills.username = users.username 
    AND bills.paidAt <= DATE_ADD(bills.createdAt, INTERVAL 1 WEEK)
)
AND EXISTS (
    SELECT 1 
    FROM bills 
    WHERE bills.username = users.username 
    AND (
        bills.paidAt > DATE_ADD(bills.createdAt, INTERVAL 1 WEEK) OR
        (bills.paidAt IS NULL AND bills.createdAt < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 WEEK))
    )
)
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve bad clients', error: err });
    }
    res.json(results);
  });
});

//good clients endpoint
app.get('/goodClients', authenticateToken, (req, res) => {
  const query = 
  `SELECT username
FROM users
WHERE EXISTS (
    SELECT 1
    FROM bills 
    WHERE bills.username = users.username 
    AND bills.paidAt IS NOT NULL 
    AND bills.paidAt <= DATE_ADD(bills.createdAt, INTERVAL 1 DAY)  -- Paid within 24 hours
)
AND NOT EXISTS (
    SELECT 1 
    FROM bills 
    WHERE bills.username = users.username 
    AND bills.paidAt IS NOT NULL 
    AND bills.paidAt > DATE_ADD(bills.createdAt, INTERVAL 1 DAY)  -- Paid after 24 hours
);
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve good clients', error: err });
    }
    res.json(results);
  });
});

//largest driveway endpoint
app.get('/largestDriveway', authenticateToken, (req, res) => {
  const query = 
  `
SELECT * 
FROM quotes_log 
WHERE squareFeet = (
    SELECT MAX(squareFeet)
    FROM quotes_log
    WHERE quote_status = 'work_complete')
AND quote_status = 'work_complete';
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve largest driveway', error: err });
    }
    res.json(results);
  });
});

//big clients endpoint
app.get('/bigClients', authenticateToken, (req, res) => {
  const query = 
  `
SELECT username, COUNT(*) AS order_count 
FROM quotes_log 
WHERE quote_status = 'work_complete' 
GROUP BY username 
HAVING order_count = (
    SELECT MAX(order_count) 
    FROM (
        SELECT COUNT(*) AS order_count 
        FROM quotes_log 
        WHERE quote_status = 'work_complete' 
        GROUP BY username
    ) AS subquery
)
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve big clients', error: err });
    }
    res.json(results);
  });
});

//generate revenue report endpoint
app.post('/generateRevenueReport', (req, res) => {
  const { startDate, endDate } = req.body;
  console.log(req.body)
  const query = 
  `
   SELECT SUM(price) AS revenue
    FROM bills
    WHERE paidAt BETWEEN ? AND ?;
  `;
  db.query(query, [startDate, endDate], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve specified revenue report', error: err });
    }

    const totalRevenue = results && results.length > 0 && results[0].revenue !== null 
      ? (results[0].revenue) 
      : 0;
  res.json({ totalRevenue });
});
});



