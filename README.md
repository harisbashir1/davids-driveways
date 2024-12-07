

## Prerequisites

Before you begin, ensure you have met the following requirements:
- **Node.js** (v14 or later) and npm (Node Package Manager)
- **MySQL** (Ensure that you have MySQL installed and running)

## How to Run the Project

Follow these steps to clone and run this project on your local machine.

### Step 1: Clone the Repository

First, clone this repository to your local machine.

 
After cloning, navigate into the project directory:


### Step 2: Set Up the Backend (Express & MySQL)

1. **Navigate to the `backend` directory**:

   ```bash
   cd backend
   ```

2. **Install the backend dependencies**:

   ```bash
   npm install
   ```

3. **Create the MySQL Database and Table**:

   - Start your MySQL service (using XAMPP, MAMP, or MySQL Workbench).
   - Open a MySQL client (like MySQL Workbench or the command line) and run the following SQL command to create the database and tables:

   ```sql
   CREATE DATABASE driveway_db;

   USE driveway_db;

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_type` varchar(20) NOT NULL DEFAULT 'Client'
);


   CREATE TABLE `bills` (
  `bill_id` int(11) NOT NULL,
  `quote_id` int(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `squareFeet` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `username` varchar(255) NOT NULL,
  `bill_status` varchar(100) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `paidAt` timestamp NULL DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL
); 


CREATE TABLE `bills_log` (
  `bill_log_id` int(11) NOT NULL,
  `bill_id` int(11) NOT NULL,
  `quote_id` int(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `squareFeet` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `username` varchar(255) NOT NULL,
  `bill_status` varchar(100) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `modifiedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `note` varchar(255) DEFAULT NULL,
  `paidAt` datetime DEFAULT NULL
);

CREATE TABLE `quotes` (
  `id` int(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `squareFeet` int(11) NOT NULL,
  `proposedPrice` decimal(10,2) NOT NULL,
  `note` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `username` varchar(100) DEFAULT NULL,
  `proposed_start` datetime DEFAULT NULL,
  `proposed_end` datetime DEFAULT NULL,
  `awaitingClientResponse` tinyint(1) DEFAULT 0,
  `quote_status` varchar(50) DEFAULT 'pending'
);


CREATE TABLE `quotes_log` (
  `id` int(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `squareFeet` int(11) NOT NULL,
  `proposedPrice` decimal(10,2) NOT NULL,
  `note` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `username` varchar(100) DEFAULT NULL,
  `proposed_start` datetime DEFAULT NULL,
  `proposed_end` datetime DEFAULT NULL,
  `quote_status` varchar(50) DEFAULT NULL,
  `logID` int(11) NOT NULL
); 


ALTER TABLE `bills`
  ADD PRIMARY KEY (`bill_id`);

--
-- Indexes for table `bills_log`
--
ALTER TABLE `bills_log`
  ADD PRIMARY KEY (`bill_log_id`);

--
-- Indexes for table `quotes`
--
ALTER TABLE `quotes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quotes_log`
--
ALTER TABLE `quotes_log`
  ADD PRIMARY KEY (`logID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bills`
--
ALTER TABLE `bills`
  MODIFY `bill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1009;

--
-- AUTO_INCREMENT for table `bills_log`
--
ALTER TABLE `bills_log`
  MODIFY `bill_log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT for table `quotes`
--
ALTER TABLE `quotes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `quotes_log`
--
ALTER TABLE `quotes_log`
  MODIFY `logID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;




DELIMITER $$
CREATE TRIGGER `after_quote_insert` AFTER INSERT ON `quotes` FOR EACH ROW BEGIN
    -- Insert into quotes_log when a new quote is added
    INSERT INTO quotes_log (id, address, squareFeet, proposedPrice, note, createdAt, username, proposed_start, proposed_end, quote_status)
    VALUES (NEW.id, NEW.address, NEW.squareFeet, NEW.proposedPrice, NEW.note, NEW.createdAt, NEW.username, NEW.proposed_start, NEW.proposed_end, NEW.quote_status);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `log_quote_updates` AFTER UPDATE ON `quotes` FOR EACH ROW BEGIN
  INSERT INTO quotes_log( id, address, squareFeet, proposedPrice, note, createdAt, username, proposed_start,proposed_end, quote_status)
  VALUES (
    NEW.id, -- Use NEW for the current updated value
    NEW.address, 
    NEW.squareFeet, 
    NEW.proposedPrice, 
    NEW.note, 
    NOW(), -- Current timestamp for log creation
    NEW.username, 
    NEW.proposed_start, 
    NEW.proposed_end, 
    NEW.quote_status -- Use NEW for the updated status
  );
END
$$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER `after_bill_insert` AFTER INSERT ON `bills` FOR EACH ROW BEGIN
  INSERT INTO bills_log (bill_id, quote_id, address, squareFeet, price, username, bill_status, createdAt, note)
  VALUES (NEW.bill_id, NEW.quote_id, NEW.address, NEW.squareFeet, NEW.price, NEW.username, NEW.bill_status, NEW.createdAt, NEW.note);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_bill_update` AFTER UPDATE ON `bills` FOR EACH ROW BEGIN
  INSERT INTO bills_log (bill_id, quote_id, address, squareFeet, price, username, bill_status, createdAt, note, paidAt)
  VALUES (NEW.bill_id, NEW.quote_id, NEW.address, NEW.squareFeet, NEW.price, NEW.username, NEW.bill_status, OLD.createdAt, NEW.note, NEW.paidAt);
END
$$
DELIMITER ;
   ```

4. **Start the backend server**:

   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5050`.

### Step 3: Set Up the Frontend (React)

1. **Navigate to the `frontend` directory**:

   ```bash
   cd ../frontend
   ```

2. **Install the frontend dependencies**:

   ```bash
   npm install
   ```

3. **Start the frontend server**:

   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`.

### Step 4: Usage

1. **Access the Web Application**:

   Open your browser and go to `http://localhost:3000`. This will load the homepage of the application.
