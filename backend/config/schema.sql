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
  job_code VARCHAR(50) NULL,
  title VARCHAR(200) NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(100) DEFAULT 'Sudair Industrial City, KSA',
  type VARCHAR(50) DEFAULT 'Full-Time',
  experience VARCHAR(50) DEFAULT '3+ years',
  overview TEXT NULL,
  description TEXT NULL,
  requirements TEXT NULL,
  responsibilities JSON NULL,
  qualifications JSON NULL,
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

-- Partners Page Settings (Hero banner and page configuration)
CREATE TABLE IF NOT EXISTS partners_page_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hero_badge VARCHAR(100) DEFAULT 'OUR PARTNERS',
  hero_title VARCHAR(255) DEFAULT 'Stronger Together.',
  hero_title_line2 VARCHAR(255) DEFAULT 'Building Better Futures.',
  hero_accent VARCHAR(100) DEFAULT 'Futures.',
  hero_description TEXT NULL,
  hero_image VARCHAR(500) DEFAULT 'partner_banner.jpg',
  cta_text VARCHAR(100) DEFAULT 'Partner With Us',
  stats_json JSON NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Strategic Partners & Alliances Table
CREATE TABLE IF NOT EXISTS partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(150) NOT NULL,
  tier VARCHAR(100) DEFAULT 'Strategic Alliance',
  logo VARCHAR(500) NOT NULL,
  website VARCHAR(500) NULL,
  description TEXT NOT NULL,
  featured TINYINT(1) DEFAULT 1,
  order_index INT DEFAULT 0,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dynamic Partnership Content Sections (Pillars, Collaboration Models, Vision 2030 highlights)
CREATE TABLE IF NOT EXISTS partnership_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(100) DEFAULT 'custom_section',
  badge VARCHAR(100) NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NULL,
  content TEXT NULL,
  bullet_points JSON NULL,
  image_url VARCHAR(500) NULL,
  icon VARCHAR(100) NULL,
  cta_text VARCHAR(100) NULL,
  cta_url VARCHAR(255) NULL,
  layout_type VARCHAR(50) DEFAULT 'card',
  order_index INT DEFAULT 0,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Partnership Inquiries Table (Submissions from public modal)
CREATE TABLE IF NOT EXISTS partnership_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  organization VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  category VARCHAR(100) DEFAULT 'Technology Transfer',
  message TEXT NULL,
  status ENUM('New', 'Under Review', 'Contacted', 'Archived') DEFAULT 'New',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- About Us Page Content (Hero, Overview modal, Vision & Mission, Vision 2030)
CREATE TABLE IF NOT EXISTS about_page_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(80) NOT NULL UNIQUE,
  title VARCHAR(255) NULL,
  subtitle VARCHAR(255) NULL,
  badge VARCHAR(100) NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  content_json JSON NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- About Us Leaders & Founding Partners
CREATE TABLE IF NOT EXISTS about_leaders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  title VARCHAR(255) NOT NULL,
  role TEXT NOT NULL,
  badge VARCHAR(100) NOT NULL DEFAULT 'Executive Board',
  initials VARCHAR(10) NULL,
  image VARCHAR(500) NULL,
  bio_sections JSON NULL,
  order_index INT DEFAULT 0,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


