# RenoFitness — Astro frontend + Express API

Calgary personal training and fitness kickboxing site. The marketing pages are an Astro static build; Express serves the API and, in production, the built `dist/` folder.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Frontend Pages](#frontend-pages)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Features

### Authentication
- User registration with password hashing
- User login with JWT tokens stored in `localStorage`
- Token verification
- Secure password storage using bcryptjs

### Email
- Newsletter subscription management
- Welcome emails for new subscribers
- Newsletter broadcasting to multiple subscribers
- Contact form email notifications

### Contact
- Contact form submissions via `POST /api/contact`
- Confirmation emails and admin notifications
- Contact history in JSON storage

### Frontend
- Astro pages with a shared layout
- Hydrated islands only for forms and mobile nav
- Login, register, newsletter, and contact flows

### Security
- Helmet.js HTTP headers
- CORS origins from `CORS_ORIGINS`
- JWT authentication without a fallback secret
- Password hashing with bcryptjs
- Environment variable protection

---

## Project Structure

```
renotesting.github.io/
├── src/
│   ├── pages/                 # Astro routes: /, /blog, /login, /register, /subscribe, /contact
│   ├── layouts/BaseLayout.astro
│   ├── components/            # Static sections + Preact form islands
│   ├── scripts/               # Shared client fetch + validation
│   ├── styles/global.css
│   ├── assets/                # Optimized images
│   ├── routes/                # Express API
│   ├── middleware/            # JWT verification
│   └── utils/                 # token, storage, email, sanitize
├── static/                    # Astro public dir (favicon)
├── dist/                      # Astro build output (gitignored)
├── data/                      # JSON storage (gitignored)
├── server.js
├── astro.config.mjs
├── package.json
├── .env.example
└── README.md
```

The older `public/*.html` files are leftover from the pre-Astro site and are not served by Express.

---

## Prerequisites

- **Node.js** >= 18.17.0
- **npm** >= 9.0.0
- **Git**
- **Gmail account** (optional, for email)

### Gmail Setup (for Email Features)

1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character app-specific password
6. Paste it in `.env` as `EMAIL_PASSWORD`

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/renotesting/renotesting.github.io.git
cd renotesting.github.io
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env
```

### 4. Edit `.env` Configuration
Set `JWT_SECRET` (required, no default), `CORS_ORIGINS`, and optional email credentials. Leave `PUBLIC_API_URL` empty when the browser talks to the same host as Express.

---

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret key for JWT tokens (required) | long random string |
| `JWT_EXPIRATION` | Token expiration time | `7d` or `24h` |
| `EMAIL_PROVIDER` | Email service provider | `gmail` or `outlook` |
| `EMAIL_USER` | Sender email address | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Email password/app password | app password |
| `ADMIN_EMAIL` | Admin email for notifications | `admin@example.com` |
| `EMAIL_FROM_NAME` | Sender display name | `RenoFitness` |
| `DATA_DIR` | Path to data directory | `./data` |
| `BCRYPT_ROUNDS` | Password hash rounds | `10` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:4321,http://localhost:3000` |
| `PUBLIC_API_URL` | API base for the frontend; empty = same origin | `http://localhost:3000` |
| `PUBLIC_GTM_ID` | Optional Google Tag Manager id | `GTM-XXXX` |
| `PUBLIC_GA_ID` | Optional Google Analytics id | `G-XXXX` |

---

## Running Locally

### Frontend + API together (recommended in development)
```bash
npm run dev:all
```

- Astro: http://localhost:4321
- Express API: http://localhost:3000

Set `PUBLIC_API_URL=http://localhost:3000` and `CORS_ORIGINS=http://localhost:4321` so the Astro dev server can call the API.

### API only
```bash
npm run dev
```

### Production-style (Astro build served by Express)
```bash
npm run build
npm start
```

Then open:
- http://localhost:3000
- http://localhost:3000/login
- http://localhost:3000/register
- http://localhost:3000/subscribe
- http://localhost:3000/contact
- http://localhost:3000/blog

---

## 📡 API Endpoints

### Authentication Endpoints

#### Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful!",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful!",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Verify Token
```bash
POST /api/auth/verify-token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "id": "1234567890",
    "email": "john@example.com",
    "name": "John Doe",
    "iat": 1234567890,
    "exp": 1235000000
  }
}
```

---

### Email Endpoints

#### Subscribe to Newsletter
```bash
POST /api/email/subscribe
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Subscription successful! Check your email for confirmation.",
  "subscriber": {
    "id": "1234567890",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

---

#### Unsubscribe from Newsletter
```bash
POST /api/email/unsubscribe
Content-Type: application/json

{
  "email": "jane@example.com"
}
```

---

#### Get All Subscribers (Admin)
```bash
GET /api/email/subscribers
Authorization: Bearer <valid-jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "subscribers": [
    {
      "id": "1234567890",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "subscriptionDate": "2024-01-15T10:30:00Z",
      "status": "active"
    }
  ]
}
```

---

#### Send Newsletter (Admin)
```bash
POST /api/email/send-newsletter
Authorization: Bearer <valid-jwt-token>
Content-Type: application/json

{
  "subject": "January Training Tips",
  "html": "<h1>Welcome to RenoFitness Newsletter</h1><p>This month we're excited to...</p>"
}
```

---

### Contact Form Endpoints

#### Submit Contact Form
```bash
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "403-555-1234",
  "subject": "Question about classes",
  "message": "I'm interested in learning more about your kickboxing classes..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Thank you for contacting us! We will get back to you soon.",
  "submissionId": "1234567890"
}
```

---

#### Get Contact Submission
```bash
GET /api/contact/:submissionId
```

---

## Frontend Pages

- `/` — home (about, photos, testimonials, services, contact island)
- `/blog` — resistance training and kickboxing notes
- `/login` — login island (`client:load`)
- `/register` — register island (`client:load`)
- `/subscribe` — newsletter island
- `/contact` — contact island (`client:load`)

Forms call `/api/auth/*`, `/api/email/*`, and `/api/contact`. Successful login and register store the JWT in `localStorage`.

---

## 🧪 Testing

### Using cURL

#### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

#### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Test Newsletter Subscribe
```bash
curl -X POST http://localhost:3000/api/email/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Subscriber",
    "email": "subscriber@example.com"
  }'
```

#### Test Contact Form
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Contact",
    "email": "contact@example.com",
    "phone": "403-123-4567",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'
```

### Using Postman

1. Import the API endpoints into Postman
2. Set variables for `baseUrl` (http://localhost:3000)
3. Test each endpoint with sample data
4. Check response status codes and JSON

---

## 🚢 Deployment

### Deploy to Heroku

```bash
# 1. Create Heroku app
heroku create your-app-name

# 2. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-secret-key"
heroku config:set EMAIL_USER="your-email@gmail.com"
heroku config:set EMAIL_PASSWORD="your-app-password"
heroku config:set ADMIN_EMAIL="admin@example.com"

# 3. Deploy
git push heroku redesign:main

# 4. View logs
heroku logs --tail
```

### Deploy to Render.com

1. Connect your GitHub repository
2. Select the `redesign` branch
3. Add environment variables in the dashboard
4. Deploy automatically

### Deploy to Railway

1. Connect GitHub repository
2. Create a new project
3. Add environment variables
4. Deploy

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=3001

# Or kill the process using port 3000
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows
```

### Email Not Sending
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Check if Gmail app password is correct (not regular password)
- Ensure 2-Step Verification is enabled in Gmail
- Check server logs for error messages

### JWT Token Errors
- Token has expired: Login again to get new token
- Invalid token: Check if token was copied correctly
- No token provided: Add `Authorization: Bearer <token>` header

### CORS Errors
- Verify frontend is running on correct origin
- Check CORS_ORIGINS in `.env`
- Clear browser cache and cookies

### Database (JSON Files) Not Creating
- Ensure `data/` directory exists
- Check file permissions
- Verify NODE_ENV is set correctly

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [JWT.io - JWT Debugger](https://jwt.io/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) - Detailed migration strategy

---

## 📝 License

ISC License - See LICENSE file for details

---

## 👨‍💼 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: RenoStudio@hotmail.com

---

**Happy training! 🏋️💪**
