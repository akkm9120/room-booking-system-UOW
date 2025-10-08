# Room Booking System - Admin Frontend

A modern React-based admin dashboard for managing the Room Booking System.

## Features

- 🔐 Admin Authentication
- 📊 Dashboard with Analytics
- 📅 Booking Management (Approve/Reject/View)
- 🏢 Room Management (Add/Edit/Delete)
- 👥 User Management
- 📱 Responsive Design
- 🎨 Modern UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Room Booking System Backend running on http://localhost:3000

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3001](http://localhost:3001) to view the admin dashboard

## Default Admin Credentials

- Email: `admin@uow.edu.au`
- Password: `admin123`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API services
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── contexts/           # React contexts
└── styles/             # CSS and styling files
```

## API Integration

This frontend connects to the Room Booking System backend API. Make sure the backend is running on `http://localhost:3000` before starting the frontend.

## Build for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.