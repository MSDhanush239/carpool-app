# Carpool App - Full-Stack Ride Sharing Application

A comprehensive carpooling web application built with Next.js, Node.js, Express, and MongoDB. This app allows users to create and join carpool rides, reducing travel costs and promoting sustainable transportation.

## Features

### Core Features
- **User Authentication**: Secure login/signup with JWT tokens
- **User Profiles**: Complete profile management with name, gender, and contact info
- **Ride Creation**: Create carpool invitations with detailed information
- **Ride Search & Join**: Search and filter rides, join available rides
- **Dashboard**: View all rides, created rides, and joined rides
- **Real-time Chat**: Basic messaging between drivers and passengers

### Technical Features
- **Responsive Design**: Works on both mobile and desktop
- **Modern UI**: Built with Tailwind CSS and Lucide React icons
- **Type Safety**: Full TypeScript implementation
- **Real-time Communication**: Socket.io for chat functionality
- **Secure Authentication**: JWT-based authentication with password encryption
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icons
- **Date-fns** - Date utilities

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Socket.io** - Real-time communication
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

## Project Structure

```
carpool-app/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── contexts/      # React contexts
│   │   └── lib/          # Utilities and API functions
│   └── package.json
├── server/                # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── package.json
└── package.json          # Root package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 2. Environment Setup

#### Server Environment
Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/carpool-app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

#### Client Environment
Create a `.env.local` file in the `client/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (if installed locally)
mongod

# Or use MongoDB Atlas connection string in your .env file
```

### 4. Running the Application

#### Development Mode (Both Frontend and Backend)
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

#### Individual Services

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

### 5. Production Build

```bash
# Build the frontend
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Rides
- `GET /api/rides` - Get all rides (with filters)
- `POST /api/rides` - Create a new ride
- `GET /api/rides/:id` - Get specific ride
- `POST /api/rides/:id/join` - Join a ride
- `DELETE /api/rides/:id/leave` - Leave a ride
- `GET /api/rides/user/created` - Get user's created rides
- `GET /api/rides/user/joined` - Get user's joined rides
- `PUT /api/rides/:id` - Update ride (driver only)
- `DELETE /api/rides/:id` - Delete ride (driver only)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID

### Chat
- `GET /api/chat/:rideId` - Get messages for a ride
- `POST /api/chat/:rideId` - Send message to ride chat

## Usage

### For Users

1. **Registration/Login**: Create an account or sign in
2. **Browse Rides**: View available rides with filters
3. **Create Rides**: Post your own carpool invitations
4. **Join Rides**: Join rides that match your needs
5. **Chat**: Communicate with other ride participants
6. **Manage Profile**: Update your personal information

### For Developers

1. **Frontend Development**: All React components are in `client/src/app/`
2. **Backend Development**: API routes are in `server/routes/`
3. **Database Models**: Defined in `server/models/`
4. **Authentication**: JWT middleware in `server/middleware/auth.js`

## Features in Detail

### Ride Creation Form
- Destination and start location
- Date and time selection
- Available seats (1-8)
- Cost per person
- Gender preference (any/male/female)
- Optional description
- Optional vehicle information

### Search & Filtering
- Search by destination or start location
- Filter by date, gender preference, and maximum cost
- Pagination for large result sets

### Real-time Chat
- Socket.io integration for instant messaging
- Ride-specific chat rooms
- Message history persistence

### Responsive Design
- Mobile-first approach
- Tailwind CSS for consistent styling
- Touch-friendly interface

## Security Features

- Password encryption with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

---

**Note**: Remember to change the JWT secret and other sensitive environment variables before deploying to production!

