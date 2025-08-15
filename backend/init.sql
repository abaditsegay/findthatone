-- Initialize the findthatone database
CREATE DATABASE IF NOT EXISTS findthatone;
USE findthatone;

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON findthatone.* TO 'findthatone_user'@'%';
FLUSH PRIVILEGES;
