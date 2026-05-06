export interface Application {
  _id: string;
  job: any;
  applicant: any;
  resume: {
    url: string;
    publicId: string;
    originalName: string;
  };
  coverLetter?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';
  statusHistory: {
    status: string;
    changedAt: string;
    changedBy: string;
  }[];
  createdAt: string;
  updatedAt: string;
}