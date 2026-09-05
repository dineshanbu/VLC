-- VIC (Vaccine Industrial Company) Database Schema for XAMPP MySQL

CREATE DATABASE IF NOT EXISTS vic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vic_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Super Admin', 'Admin', 'Editor', 'Viewer') DEFAULT 'Admin',
  department VARCHAR(100) DEFAULT 'Executive',
  status ENUM('Active', 'Inactive', 'Pending') DEFAULT 'Active',
  avatar VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  last_login DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- News Articles Table
CREATE TABLE IF NOT EXISTS news_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'Company Updates',
  categories JSON NULL,
  date_str VARCHAR(50) NULL,
  formatted_date VARCHAR(50) NULL,
  read_time VARCHAR(50) DEFAULT '3 min read',
  image VARCHAR(255) DEFAULT NULL,
  badge VARCHAR(60) DEFAULT 'NEWS',
  summary TEXT NULL,
  content_html LONGTEXT NULL,
  official_link VARCHAR(500) DEFAULT NULL,
  status ENUM('Published', 'Draft', 'Archived') DEFAULT 'Published',
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Media Assets Table
CREATE TABLE IF NOT EXISTS media_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  category VARCHAR(80) DEFAULT 'General',
  format VARCHAR(20) DEFAULT 'IMAGE',
  file_size VARCHAR(50) DEFAULT '0 KB',
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Inquiries Table (Populated from Public Contact Form)
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  company VARCHAR(150) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  subject VARCHAR(200) DEFAULT 'General Inquiry',
  message TEXT NOT NULL,
  status ENUM('New', 'In Progress', 'Resolved', 'Archived') DEFAULT 'New',
  is_starred TINYINT(1) DEFAULT 0,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Postings Table
CREATE TABLE IF NOT EXISTS job_postings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(100) DEFAULT 'Sudair Industrial City, KSA',
  type ENUM('Full-time', 'Part-time', 'Contract', 'Internship') DEFAULT 'Full-time',
  experience VARCHAR(50) DEFAULT '3+ years',
  description TEXT NULL,
  requirements TEXT NULL,
  status ENUM('Active', 'Closed', 'Draft') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NULL,
  candidate_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  resume_url VARCHAR(500) NULL,
  cover_letter TEXT NULL,
  status ENUM('Submitted', 'Reviewing', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired') DEFAULT 'Submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
