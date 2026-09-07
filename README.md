# 🏋️ RenoFitness - Node.js/Express Migration

**Static website transformed into a dynamic Node.js/Express application with authentication, email system, and contact management.**

## 📋 Table of Contents

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

## ✨ Features

### ✅ Authentication System
- User registration with password hashing
- User login with JWT tokens
- Token verification
- Secure password storage using bcryptjs

### ✅ Email System
- Newsletter subscription management
- Welcome emails for new subscribers
- Newsletter broadcasting to multiple subscribers
- Contact form email notifications
- Support for Gmail, Outlook, and custom SMTP

### ✅ Contact Management
- Contact form submissions
- Automatic confirmation emails
- Admin notifications
- Contact history tracking

### ✅ Frontend Pages
- Login page with validation
- Registration page with password confirmation
- Newsletter subscription form
- Contact form with admin notifications

### ✅ Security Features
- Helmet.js for HTTP headers security
- CORS protection
- JWT authentication
- Password hashing with bcryptjs
- Environment variable protection

---

## 📁 Project Structure

```
renoFitness/
├── public/                    # Static files (served by Express)
│   ├── index.html
│   ├── blog.html
│   ├── login.html            # NEW: Login page
│   ├── register.html         # NEW: Registration page
│   ├── subscribe.html        # NEW: Newsletter subscription page
│   ├── contact.html          # Existing contact page (enhanced)
│   ├── img/                  # Images
│   ├── carousel1/            # Carousel assets
│   ├── carousel2/            # Carousel assets
│   ├── resources/            # CSS, JS, fonts
│   ├── vendors/              # Third-party libraries
│   └── widgets/              # UI components
│
├── src/
│   ├── routes/               # API route handlers
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── email.js         # Email/newsletter endpoints
│   │   └── contact.js       # Contact form endpoints
│   │
│   ├── middleware/           # Express middleware
│   │   └── auth.js          # JWT verification middleware
│   │
│   └── utils/                # Utility functions
│       ├── tokenService.js   # JWT token generation/verification
│       ├── storage.js        # JSON file storage operations
│       └── emailService.js   # Email sending with Nodemailer
│
├── data/                      # Local JSON data storage (gitignored)
│   ├── users.json            # Registered users
│   ├── subscribers.json      # Newsletter subscribers
│   └── contact-submissions.json  # Contact form submissions
│
├── server.js                  # Express server entry point
├── package.json              # Dependencies
├── .env.example              # Environment variables template
├── .env                       # Actual environment variables (gitignored)
├── .gitignore               # Git ignore rules
├── reorganize.sh            # Repository reorganization script
└── README.md                # This file
```

---

## 🔧 Prerequisites

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0
- **Git** for version control
- **Gmail account** (for email functionality) - optional

### Gmail Setup (for Email Features)

1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character app-specific password
6. Paste it in `.env` as `EMAIL_PASSWORD`

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/renotesting/renotesting.github.io.git
cd renotesting.github.io
git checkout redesign
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
```bash
# Open .env and update with your settings:
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
ADMIN_EMAIL=RenoStudio@hotmail.com
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key-...` |
| `JWT_EXPIRATION` | Token expiration time | `7d` or `24h` |
| `EMAIL_PROVIDER` | Email service provider | `gmail` or `outlook` |
| `EMAIL_USER` | Sender email address | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Email password/app password | `xxxx xxxx xxxx xxxx` |
| `ADMIN_EMAIL` | Admin email for notifications | `admin@example.com` |
| `EMAIL_FROM_NAME` | Sender display name | `RenoFitness` |
| `DATA_DIR` | Path to data directory | `./data` |
| `BCRYPT_ROUNDS` | Password hash rounds | `10` |

---

## 🚀 Running Locally

### Development Mode (with auto-reload)
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════════════════════╗
║          🏋️  RenoFitness Server Started Successfully           ║
╚════════════════════════════════════════════════════════════════╝

📍 Server running on: http://localhost:3000
🌍 Environment: development
```

### Production Mode
```bash
npm start
```

### Access the Application
- **Website**: http://localhost:3000
- **Login Page**: http://localhost:3000/login.html
- **Register Page**: http://localhost:3000/register.html
- **Subscribe Page**: http://localhost:3000/subscribe.html
- **Contact Page**: http://localhost:3000/contact.html

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

## 🌐 Frontend Pages

### Login Page (`public/login.html`)
- User email and password fields
- Client-side form validation
- JWT token storage in localStorage
- Error message display
- Link to registration page

### Register Page (`public/register.html`)
- Name, email, password fields
- Password confirmation validation
- Client-side validation before submission
- Success message with redirect to login
- Error handling

### Newsletter Subscribe Page (`public/subscribe.html`)
- Name and email fields
- Success message after subscription
- Email confirmation notice
- Unsubscribe link

### Contact Form (`public/contact.html`)
- Name, email, phone, subject, message fields
- Client-side validation
- Automatic admin notification
- User confirmation email
- Form reset on success

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
