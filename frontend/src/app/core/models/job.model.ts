export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements?: string;
  postedBy: string | any;
  company: {
    name: string;
    logo?: string;
    website?: string;
  };
  location: string;
  jobType: 'full-time' | 'part-time' | 'remote' | 'hybrid' | 'contract' | 'internship';
  category: string;
  experienceLevel: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead';
  salary: {
    min?: number;
    max?: number;
    currency: string;
    isNegotiable: boolean;
  };
  skillsRequired: string[];
  deadline: string;
  isActive: boolean;
  applicationCount: number;
  views: number;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  keyword?: string;
  location?: string;
  jobType?: string;
  category?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
}

export interface JobsResponse {
  jobs: Job[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}