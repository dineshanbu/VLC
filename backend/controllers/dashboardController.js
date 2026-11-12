const { getPool } = require('../config/db');

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const pool = getPool();

    // 1. Total counts
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalNews }]] = await pool.query('SELECT COUNT(*) as totalNews FROM news_articles');
    const [[{ publishedNews }]] = await pool.query("SELECT COUNT(*) as publishedNews FROM news_articles WHERE status = 'Published'");
    const [[{ totalMedia }]] = await pool.query('SELECT COUNT(*) as totalMedia FROM media_assets');
    const [[{ totalInquiries }]] = await pool.query('SELECT COUNT(*) as totalInquiries FROM contact_inquiries');
    const [[{ newInquiries }]] = await pool.query("SELECT COUNT(*) as newInquiries FROM contact_inquiries WHERE status = 'New'");
    const [[{ totalJobs }]] = await pool.query('SELECT COUNT(*) as totalJobs FROM job_postings');
    const [[{ totalApplications }]] = await pool.query('SELECT COUNT(*) as totalApplications FROM job_applications');

    // 2. Recent contact inquiries (last 5)
    const [recentInquiries] = await pool.query(
      'SELECT id, full_name, email, company, subject, status, is_starred, created_at FROM contact_inquiries ORDER BY created_at DESC LIMIT 5'
    );

    // 3. Recent news (last 5)
    const [recentNews] = await pool.query(
      'SELECT id, slug, title, category, date_str, formatted_date, status, views, created_at FROM news_articles ORDER BY id DESC LIMIT 5'
    );

    // 4. Category breakdown for news
    const [newsCategoryStats] = await pool.query(
      'SELECT category, COUNT(*) as count FROM news_articles GROUP BY category ORDER BY count DESC'
    );

    // 5. Media format breakdown
    const [mediaFormatStats] = await pool.query(
      'SELECT format, COUNT(*) as count FROM media_assets GROUP BY format ORDER BY count DESC'
    );

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalNews,
        publishedNews,
        totalMedia,
        totalInquiries,
        newInquiries,
        totalJobs,
        totalApplications
      },
      recentInquiries,
      recentNews,
      newsCategoryStats,
      mediaFormatStats,
      systemStatus: {
        dbConnected: true,
        serverUptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate dashboard statistics', error: error.message });
  }
};
