CREATE TABLE users(user_id VARCHAR(50) PRIMARY KEY, email VARCHAR(50), hashed_password VARCHAR(200), confirmation_code VARCHAR(10), confirmed TINYINT);
