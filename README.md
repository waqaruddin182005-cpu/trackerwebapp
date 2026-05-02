# Expense Tracker Web App

A full-stack expense tracking application built with React (frontend) and Node.js/Express (backend).

## Features

- User authentication (register/login)
- Add, view, and delete expenses
- Dashboard with expense summary
- Analytics page with charts
- Responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios for API calls
- Chart.js for analytics
- React Router for navigation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- Git

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your MongoDB URI and choose a secure JWT secret.

4. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:3000`.

### Environment Variables

#### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens

#### Frontend
- `VITE_API_URL`: API base URL (optional, defaults to `http://localhost:5000`)

Copy the `.env.example` files to `.env` in both backend and frontend directories and fill in your values.

## Deployment

### Backend Deployment
- Deploy to platforms like Render, Heroku, or Vercel
- Set environment variables in the deployment platform
- Update the frontend proxy or API URL to point to the deployed backend

### Frontend Deployment
- Build the frontend: `npm run build`
- Deploy the `dist` folder to platforms like Netlify, Vercel, or GitHub Pages
- Ensure the API URL points to the deployed backend

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses` - Get all expenses (authenticated)
- `POST /api/expenses` - Add new expense (authenticated)
- `DELETE /api/expenses/:id` - Delete expense (authenticated)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).