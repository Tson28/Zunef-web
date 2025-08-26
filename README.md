# ZuneF - Source Code Marketplace

## 🚀 Project Overview

ZuneF is a comprehensive full-stack e-commerce platform designed specifically for selling and purchasing source code. Built with modern technologies, it provides a seamless experience for developers to buy, sell, and manage source code projects. This platform revolutionizes how developers discover and acquire quality source code.

## ✨ Features

### 🛒 E-commerce Capabilities
- **Product Catalog**: Browse and search through available source code projects with advanced filtering
- **Shopping Cart**: Add items to cart and manage purchases with real-time updates
- **Secure Checkout**: Integrated payment processing with multiple payment methods and fraud protection
- **Order Management**: Track order status and download purchased code instantly
- **User Dashboard**: Manage profile, orders, and account settings efficiently

### 🔐 Authentication & Security
- **User Registration & Login**: Secure authentication system with advanced security and biometric support
- **Email Verification**: Email-based account verification with instant delivery and spam protection
- **Password Reset**: Secure password recovery system with enhanced encryption and rate limiting
- **JWT Tokens**: Stateless authentication with JSON Web Tokens and refresh capability with secure storage
- **Role-based Access**: Admin and user role management with granular permissions and audit logging

### 📱 Modern UI/UX
- **Responsive Design**: Mobile-first approach with modern UI components and adaptive layouts with touch optimization
- **Dark/Light Theme**: Customizable theme system with automatic detection and custom color schemes
- **Component Library**: Reusable UI components built with shadcn/ui and custom extensions with animation support
- **Next.js 14**: Latest React framework with App Router and server-side rendering

### 🛠️ Admin Panel
- **User Management**: Admin control over user accounts with detailed analytics
- **Product Management**: Add, edit, and manage source code listings with version control
- **Category Management**: Organize products by categories with hierarchical structure
- **Order Monitoring**: Track all transactions and orders with real-time notifications
- **Analytics Dashboard**: Business insights and statistics with predictive analytics

## 🏗️ Architecture

### Frontend (Next.js 14) - Modern React Architecture
```
FrontEnd/
├── app/                    # App Router pages
│   ├── admin/             # Admin panel routes
│   ├── dashboard/         # User dashboard
│   ├── product/           # Product pages
│   └── auth/              # Authentication pages
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
└── types/                 # TypeScript type definitions
```

### Backend (Node.js + Express) - Scalable Server Architecture
```
BackEnd/
├── src/
│   ├── controllers/       # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── middlewares/      # Request processing
│   └── config/           # Configuration files
├── public/               # Static files
└── utils/                # Helper functions
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router and TypeScript support
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS + shadcn/ui components with custom design system
- **State Management**: React Context + Custom Hooks with persistent state
- **UI Components**: shadcn/ui component library with accessibility features
- **Icons**: Lucide React icons with custom icon set

### Backend
- **Runtime**: Node.js with performance optimization
- **Framework**: Express.js with middleware architecture
- **Database**: MongoDB with Mongoose ODM and connection pooling
- **Authentication**: JWT tokens with refresh mechanism
- **File Upload**: Multer middleware with file validation
- **Email**: Nodemailer with templates and delivery tracking
- **API Documentation**: Swagger/OpenAPI with interactive testing
- **Validation**: Custom validation middleware with error handling

### Development Tools
- **Package Manager**: npm/pnpm with workspace support
- **Code Quality**: ESLint, Prettier with custom rules
- **Version Control**: Git with branching strategy
- **Environment**: Environment variables with .env and configuration management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ with LTS support and npm
- MongoDB database with replica set and Atlas support
- npm or pnpm package manager with latest version and workspace features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tson28/Zunef-web.git
   cd Zunef-web
   ```

2. **Install Frontend dependencies**
   ```bash
   cd FrontEnd
   npm install
   # or
   pnpm install
   ```

3. **Install Backend dependencies**
   ```bash
   cd ../BackEnd
   npm install
   ```

4. **Environment Setup**
   ```bash
   # Backend .env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   
   # Frontend .env.local
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

5. **Start Development Servers**
   ```bash
   # Backend (from BackEnd directory)
   npm run dev
   
   # Frontend (from FrontEnd directory)
   npm run dev
   ```

## 📁 Project Structure

### Key Directories
- **`/FrontEnd`**: Next.js frontend application
- **`/BackEnd`**: Node.js backend API server
- **`/public`**: Static assets and files
- **`/components`**: Reusable UI components
- **`/src`**: Source code for backend services

### Important Files
- **`package.json`**: Project dependencies and scripts
- **`next.config.mjs`**: Next.js configuration
- **`tsconfig.json`**: TypeScript configuration
- **`.env`**: Environment variables
- **`README.md`**: Project documentation

## 🔧 Configuration

### Backend Configuration
- Database connection settings
- JWT secret configuration
- Email service setup
- File upload limits
- CORS settings

### Frontend Configuration
- API endpoint configuration
- Theme settings
- Component library setup
- Build optimization

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and start the Node.js server
3. Configure reverse proxy (nginx)
4. Set up SSL certificates

### Frontend Deployment
1. Build the Next.js application
2. Deploy to Vercel, Netlify, or custom server
3. Configure environment variables
4. Set up custom domain

## 🤝 Contributing

1. Fork the repository and clone locally
2. Create a feature branch with descriptive name
3. Make your changes following coding standards
4. Test thoroughly with automated tests
5. Submit a pull request with detailed description

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🔮 Future Roadmap

- [ ] Mobile app development with React Native
- [ ] Advanced analytics dashboard with real-time data
- [ ] Multi-language support with localization
- [ ] Advanced search and filtering with AI
- [ ] AI-powered code recommendations and analysis
- [ ] Code review system with collaboration tools
- [ ] Developer marketplace features with ratings
- [ ] Integration with popular IDEs and editors

## 📊 Project Status

- **Frontend**: ✅ Complete with modern UI/UX
- **Backend**: ✅ Complete with scalable architecture
- **Database**: ✅ Complete with optimized queries
- **Authentication**: ✅ Complete with security features
- **Payment Integration**: ✅ Complete with multiple gateways
- **Admin Panel**: ✅ Complete with analytics dashboard
- **Documentation**: ✅ Complete with comprehensive guides

---

**Built with ❤️ by the ZuneF Development Team**

---

*Last updated: August 2024*
*Version: 1.0.0*
*License: MIT*
