## How to Run the Project

Follow these steps to clone and run this project on your local machine.

### Step 1: Clone or Download the project

First, clone or download this project to your local machine.

 
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
   - Open a MySQL client (like MySQL Workbench or the command line) and run the following SQL commands to create the database and tables:

```sql
-- Create the database
CREATE DATABASE driveway_db;

-- Use the database
USE driveway_db;

-- Create the 'users' table
CREATE TABLE `users` (
    `id` int(11) NOT NULL,
    `username` varchar(100) NOT NULL,
    `email` varchar(100) NOT NULL,
    `password` varchar(255) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `user_type` varchar(20) NOT NULL DEFAULT 'Client',
    `first_name` varchar(100),
    `last_name` varchar(100),
    `address` TEXT,
    `credit_card` varchar(20),
    `phone_number` varchar(15)
);

-- Create the 'bills' table
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

-- Create the 'bills_log' table
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

-- Create the 'quotes' table
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
    `quote_status` varchar(50) DEFAULT 'pending',
    `p1` varchar(255) DEFAULT NULL,
    `p2` varchar(255) DEFAULT NULL,
    `p3` varchar(255) DEFAULT NULL,
    `p4` varchar(255) DEFAULT NULL,
    `p5` varchar(255) DEFAULT NULL
);

-- Create the 'quotes_log' table
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
    `logID` int(11) NOT NULL,
    `p1` varchar(255) DEFAULT NULL,
    `p2` varchar(255) DEFAULT NULL,
    `p3` varchar(255) DEFAULT NULL,
    `p4` varchar(255) DEFAULT NULL,
    `p5` varchar(255) DEFAULT NULL
);

-- Set primary keys for tables
ALTER TABLE `bills` ADD PRIMARY KEY (`bill_id`);
ALTER TABLE `bills_log` ADD PRIMARY KEY (`bill_log_id`);
ALTER TABLE `quotes` ADD PRIMARY KEY (`id`);
ALTER TABLE `quotes_log` ADD PRIMARY KEY (`logID`);
ALTER TABLE `users` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `username` (`username`);

-- Set AUTO_INCREMENT for tables
ALTER TABLE `bills` MODIFY `bill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1009;
ALTER TABLE `bills_log` MODIFY `bill_log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;
ALTER TABLE `quotes` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;
ALTER TABLE `quotes_log` MODIFY `logID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;
ALTER TABLE `users` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

-- Create triggers for 'quotes' and 'bills' tables

DELIMITER $$
CREATE TRIGGER `after_quote_insert` AFTER INSERT ON `quotes` FOR EACH ROW BEGIN
    -- Insert into quotes_log when a new quote is added
    INSERT INTO quotes_log (id, address, squareFeet, proposedPrice, note, createdAt, username, proposed_start, proposed_end, quote_status,p1,p2,p3,p4,p5)
    VALUES (NEW.id, NEW.address, NEW.squareFeet, NEW.proposedPrice, NEW.note, NEW.createdAt, NEW.username, NEW.proposed_start, NEW.proposed_end, NEW.quote_status,NEW.p1,NEW.p2,NEW.p3,NEW.p4,NEW.p5);
END
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `log_quote_updates` AFTER UPDATE ON `quotes` FOR EACH ROW BEGIN
    -- Insert into quotes_log when a quote is updated, including p1-p5
    INSERT INTO quotes_log (
        id, address, squareFeet, proposedPrice, note, createdAt, username, 
        proposed_start, proposed_end, quote_status, p1, p2, p3, p4, p5
    )
    VALUES (
        NEW.id, NEW.address, NEW.squareFeet, NEW.proposedPrice, NEW.note, NOW(),
        NEW.username, NEW.proposed_start, NEW.proposed_end, NEW.quote_status,
        OLD.p1, OLD.p2, OLD.p3, OLD.p4, OLD.p5
    );
END
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `after_bill_insert` AFTER INSERT ON `bills` FOR EACH ROW BEGIN
    -- Insert into bills_log when a new bill is added
    INSERT INTO bills_log (bill_id, quote_id, address, squareFeet, price, username, bill_status, createdAt, note)
    VALUES (NEW.bill_id, NEW.quote_id, NEW.address, NEW.squareFeet, NEW.price, NEW.username, NEW.bill_status, NEW.createdAt, NEW.note);
END
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `after_bill_update` AFTER UPDATE ON `bills` FOR EACH ROW BEGIN
    -- Insert into bills_log when a bill is updated
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
