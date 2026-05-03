# Job Portal — MEAN Stack (MongoDB · Express · Angular · Node.js)

A full-stack job portal where candidates find and apply for jobs, employers post listings and review applicants, and admins manage the platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17+, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js (ESM) |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT (httpOnly cookie + Bearer) |
| File Upload | Multer + Cloudinary |
| Validation | express-validator |
| Security | Helmet, rate-limit, bcryptjs |

---

## Project Structure

```
job-portal/
├── backend/
│   ├── src/
│   │   ├── config/         # DB + Cloudinary setup
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, roles, uploads, errors
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── utils/          # ApiError, ApiResponse, asyncHandler
│   │   └── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/               # Angular app (coming soon)
```

---

## API Endpoints

### Auth — `/api/auth`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Register candidate or employer |
| POST | `/login` | Public | Login and receive JWT |
| POST | `/logout` | Private | Clear session cookie |
| GET | `/me` | Private | Get logged-in user |
| PATCH | `/change-password` | Private | Change password |

### Jobs — `/api/jobs`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Public | List all jobs (with filters + pagination) |
| GET | `/:id` | Public | Get single job |
| POST | `/` | Employer | Post a new job |
| PUT | `/:id` | Employer/Admin | Edit a job |
| DELETE | `/:id` | Employer/Admin | Delete a job |
| GET | `/employer/my-jobs` | Employer | My posted jobs |

### Applications — `/api/applications`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/apply/:jobId` | Candidate | Apply to a job (+ resume upload) |
| GET | `/my` | Candidate | My applications |
| DELETE | `/:id` | Candidate | Withdraw application |
| GET | `/job/:jobId` | Employer/Admin | Applicants for a job |
| PATCH | `/:id/status` | Employer/Admin | Update application status |

### Users — `/api/users`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| PUT | `/profile` | Private | Update profile |
| POST | `/upload-resume` | Candidate | Upload resume PDF |
| POST | `/upload-logo` | Employer | Upload company logo |
| POST | `/save-job/:jobId` | Candidate | Save / unsave a job |
| GET | `/saved-jobs` | Candidate | Get saved jobs |
| GET | `/admin/all` | Admin | All users |
| GET | `/admin/stats` | Admin | Platform statistics |
| PATCH | `/admin/:id/toggle-active` | Admin | Activate/deactivate user |

---

## Getting Started

### Prerequisites
- Node.js >= 18
- npm
- MongoDB Atlas account
- Cloudinary account

### Backend Setup

```bash
cd backend
cp .env.example .env      # fill in your values
npm install
npm run dev               # starts on http://localhost:5000
```

### Environment Variables

See `.env.example` for all required variables.

### Health Check
```
GET http://localhost:5000/api/health
```

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **Candidate** | Browse jobs, apply, upload resume, track applications, save jobs |
| **Employer** | Post/manage jobs, view applicants, accept/reject |
| **Admin** | View all users/jobs, deactivate accounts, view platform stats |

---

## License
MIT