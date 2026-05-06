export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'candidate' | 'employer' | 'admin';
  bio?: string;
  skills?: string[];
  experience?: string;
  location?: string;
  resume?: { url: string; publicId: string; originalName: string };
  savedJobs?: string[];
  company?: {
    name: string;
    website?: string;
    description?: string;
    logo?: { url: string; publicId: string };
    industry?: string;
    size?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}