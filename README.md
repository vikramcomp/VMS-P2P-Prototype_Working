# VMS 2.0 - Vendor Management System

A modern, responsive Vendor Management System built with Next.js 15, TypeScript, and Tailwind CSS. This frontend application connects to a .NET 8 API backend to provide comprehensive vendor relationship management capabilities.

## Features

### Core Functionality
- **Dashboard**: Real-time overview of vendor metrics, contracts, and key indicators
- **Vendor Management**: Complete CRUD operations for vendor profiles and relationships
- **Contract Management**: Track and manage vendor contracts and agreements
- **User Management**: Role-based access control and user administration  
- **Reports**: Generate comprehensive vendor and spend analysis reports
- **Authentication**: Secure login/logout with JWT tokens and Microsoft SSO

### Technical Features
- 🚀 **Next.js 15** with App Router
- 🎯 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for modern styling
- 📱 **Responsive Design** (mobile-first approach)
- 🔐 **JWT Authentication** with protected routes
- 🔗 **API Integration** with .NET 8 backend
- 📋 **Form Validation** with React Hook Form & Zod
- 🎭 **Component Library** with Radix UI primitives

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- .NET 8 API backend running

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Update `.env.local` file with your API endpoint:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://localhost:7001/api
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## API Integration

The application integrates with a .NET 8 Web API backend with JWT authentication, full TypeScript support, and automatic error handling.

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable React components
├── services/         # API service layer
├── types/           # TypeScript type definitions
├── context/         # React context providers
└── utils/           # Utility functions
```
