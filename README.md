# IDSN Portal - Indian Digital School Network

<div align="center">
  <img src="https://z-cdn.chatglm.cn/z-ai/static/logo.svg" alt="IDSN Portal" width="200"/>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.19.2-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

  **Empowering Indian schools with digital excellence and recognition**
</div>

## 🌟 Overview

IDSN Portal is a comprehensive digital platform designed to transform Indian education through standardized certification, professional development, and networking. It provides schools with the tools to achieve digital excellence, educators with world-class training resources, and administrators with powerful management capabilities.

## 🎯 Key Features

### 🏫 **School Certification Module**
- **Dynamic Audit System**: Comprehensive digital infrastructure assessment
- **Star Rating Calculator**: 1-5 star rating based on audit scores
- **QR Code Verification**: Tamper-proof certificates with instant verification
- **Progress Tracking**: Real-time audit completion status
- **Document Upload**: Support for photos, videos, speed tests, and more

### 👥 **Membership Management**
- **Four-Tier System**: Basic, Silver, Gold, and Platinum memberships
- **Member Directory**: Searchable database of certified schools and educators
- **Networking Hub**: Connect with professionals across the education ecosystem
- **Tier-Based Benefits**: Exclusive features for premium members
- **Upgrade System**: Seamless membership tier transitions

### 📚 **Training & Pedagogy**
- **Course Library**: Extensive collection of educational courses
- **Assessment Engine**: Interactive quizzes with multiple question types
- **Progress Tracking**: Detailed learning analytics and completion metrics
- **Certification Badges**: "IDSN Certified Educator" achievements
- **Resource Repository**: Teaching materials, templates, and guides

### 📊 **Progress & Analytics**
- **Personal Dashboard**: Role-based dashboards for all user types
- **Learning Analytics**: Course progress, study time, and achievement tracking
- **ID Points System**: Gamified learning with rewards and leaderboards
- **Activity Logging**: Comprehensive audit trail of all user actions
- **Performance Metrics**: Detailed statistics and insights

### 🔔 **Notifications & Documents**
- **Real-time Alerts**: System notifications for important updates
- **Document Vault**: Secure file storage and management
- **Activity Feeds**: Recent activities and milestones
- **Communication Hub**: Centralized messaging and announcements

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/bun
- PostgreSQL or MySQL (production) / SQLite (development)
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jitenkr2030/Idsn.git
   cd Idsn
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your database connection and other settings in `.env.local`:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Set up the database**
   ```bash
   bun run db:push
   bun run db:generate
   ```

5. **Seed initial data** (optional)
   ```bash
   # Seed audit checklists
   curl -X POST http://localhost:3000/api/seed
   ```

6. **Start the development server**
   ```bash
   bun run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 User Roles & Access

### 🔑 **School Administrator (Principal/Trustee)**
- Submit school for digital certification
- Manage staff enrollments and progress
- Access membership benefits and networking
- View analytics and school performance metrics

### 👨‍🏫 **Educator (Teacher)**
- Enroll in training courses and workshops
- Complete assessments and earn certifications
- Access teaching resources and materials
- Network with other certified educators

### 🛡️ **Internal Admin (You)**
- Review and approve certification submissions
- Manage user accounts and permissions
- Create and manage course content
- Monitor platform analytics and performance

## 🏗️ Architecture

### **Frontend Stack**
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui
- **State Management**: React Context + Zustand
- **Forms**: React Hook Form + Zod validation

### **Backend Stack**
- **Database**: Prisma ORM with SQLite/PostgreSQL/MySQL
- **Authentication**: JWT with HTTP-only cookies
- **API**: RESTful endpoints with proper validation
- **File Storage**: Configurable for local/cloud storage

### **Infrastructure**
- **Deployment**: Ready for Vercel, AWS, Google Cloud
- **Monitoring**: Built-in error tracking and analytics
- **Security**: Input validation, SQL injection prevention, CORS
- **Performance**: Optimized queries and caching strategies

## 📁 Project Structure

```
idsn-portal/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main dashboard
│   │   ├── verify/            # Certificate verification
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── auth/             # Authentication components
│   │   ├── certification/    # Certification module
│   │   ├── membership/       # Membership management
│   │   ├── training/         # Training module
│   │   ├── progress/         # Progress tracker
│   │   ├── notifications/    # Notification system
│   │   └── dashboard/        # Dashboard components
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # Authentication logic
│   │   ├── db.ts            # Database client
│   │   └── utils.ts          # Helper functions
│   └── contexts/             # React contexts
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── public/                   # Static assets
├── docs/                     # Documentation
└── README.md                 # This file
```

## 🔧 Configuration

### **Database Setup**

The platform supports multiple databases:

**Development (SQLite)**
```env
DATABASE_URL="file:./dev.db"
```

**Production (PostgreSQL)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/idsn"
```

**Production (MySQL)**
```env
DATABASE_URL="mysql://user:password@localhost:3306/idsn"
```

### **Environment Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | - |
| `NEXT_PUBLIC_APP_URL` | Public application URL | `http://localhost:3000` |
| `JWT_SECRET` | JWT signing secret | - |
| `NODE_ENV` | Environment (development/production) | `development` |

## 🎨 Customization

### **Branding**
- Update colors in `tailwind.config.js`
- Modify logo in `public/` directory
- Customize theme in `src/app/globals.css`

### **Features**
- Add new modules in `src/components/`
- Extend database schema in `prisma/schema.prisma`
- Create new API routes in `src/app/api/`

### **Membership Tiers**
- Modify pricing and features in API endpoints
- Update UI components to reflect changes
- Configure payment integration as needed

## 🔒 Security

- **Authentication**: JWT tokens with HTTP-only cookies
- **Authorization**: Role-based access control
- **Validation**: Input sanitization and SQL injection prevention
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: API protection against abuse

## 📊 Monitoring & Analytics

### **Built-in Analytics**
- User registration and activity tracking
- Course completion rates
- Certification statistics
- Platform performance metrics

### **Error Tracking**
- Comprehensive error logging
- User feedback collection
- Performance monitoring
- Security event logging

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Docker**
```bash
# Build image
docker build -t idsn-portal .

# Run container
docker run -p 3000:3000 idsn-portal
```

### **Traditional Hosting**
```bash
# Build for production
bun run build

# Start production server
bun run start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Code Style**
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Document complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the excellent framework
- **Prisma** for the powerful ORM
- **shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Vercel** for the amazing hosting platform

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/jitenkr2030/Idsn/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jitenkr2030/Idsn/discussions)
- **Email**: support@idsn.portal

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=jitenkr2030/Idsn&type=Date)](https://star-history.com/#jitenkr2030/Idsn&Date)

---

<div align="center">
  <p>Made with ❤️ for the future of Indian education</p>
  <p>© 2024 IDSN Portal. All rights reserved.</p>
</div>