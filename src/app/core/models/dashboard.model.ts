import { ContactInquiry } from './contact.model';
import { AdminNewsArticle } from './news.model';

export interface DashboardStats {
  totalUsers: number;
  totalNews: number;
  publishedNews: number;
  totalMedia: number;
  totalInquiries: number;
  newInquiries: number;
  totalJobs: number;
  totalApplications: number;
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  recentInquiries: ContactInquiry[];
  recentNews: AdminNewsArticle[];
  newsCategoryStats: { category: string; count: number }[];
  mediaFormatStats: { format: string; count: number }[];
  systemStatus: {
    dbConnected: boolean;
    serverUptime: number;
    timestamp: string;
  };
}
