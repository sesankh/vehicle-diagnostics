# Vehicles Dashboard

A comprehensive vehicle diagnostic monitoring system built with Angular (Frontend) and NestJS (Backend) using Nx monorepo architecture.

## 🚀 Features

### Frontend (Angular)
- **Vehicle Management**: View, search, and manage vehicle diagnostic data
- **Real-time Monitoring**: Live diagnostic logs with filtering and pagination
- **Responsive Design**: Modern UI with search, pagination, and sorting capabilities
- **Diagnostic Dashboard**: Comprehensive log analysis and statistics
- **Vehicle Details**: Detailed view with diagnostic statistics and log history

### Backend (NestJS)
- **RESTful API**: Complete CRUD operations for diagnostic logs
- **File Upload**: Support for log file uploads
- **Webhook Integration**: Real-time log ingestion via webhooks
- **Search & Filtering**: Advanced search capabilities with date ranges
- **Data Persistence**: JSON-based file storage with automatic backup

## 🏗️ Architecture

### Monorepo Structure
```
vehicles-dashboard/
├── apps/
│   ├── frontend/          # Angular application
│   └── backend/           # NestJS API server
├── libs/
│   ├── diagnostic-api/    # Diagnostic API library
│   ├── diagnostic-ui/     # Diagnostic UI components
│   ├── shared-ui/         # Shared UI components
│   ├── ui-api-service/    # Frontend API service
│   └── data-model/        # Shared data models
└── data/                  # JSON data storage
```

### Technology Stack
- **Frontend**: Angular 20, TypeScript, SCSS
- **Backend**: NestJS, TypeScript, Express
- **Build Tool**: Nx, Webpack
- **Package Manager**: npm
- **Development**: ESLint, Prettier, Jest

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vehicles-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development servers**
   ```bash
   # Start backend API server
   npm run start:backend
   
   # Start frontend application (in another terminal)
   npm run start:frontend
   ```

## 🚀 Development

### Available Scripts
```bash
# Development
npm run start:frontend    # Start frontend dev server
npm run start:backend     # Start backend dev server
npm run start:all         # Start both servers

# Building
npm run build:frontend    # Build frontend
npm run build:backend     # Build backend
npm run build:all         # Build all applications

# Testing
npm run test              # Run all tests
npm run test:frontend     # Test frontend
npm run test:backend      # Test backend

# Linting
npm run lint              # Lint all code
npm run lint:fix          # Fix linting issues
```

### Project Structure

#### Frontend (Angular)
- **Components**: Reusable UI components with proper separation of concerns
- **Services**: API communication and data management
- **Modules**: Feature-based module organization
- **Routing**: Lazy-loaded routes for optimal performance

#### Backend (NestJS)
- **Controllers**: REST API endpoints with proper validation
- **Services**: Business logic and data processing
- **DTOs**: Data transfer objects with validation
- **Interceptors**: Request/response logging and transformation
- **Filters**: Global exception handling

## 📡 API Endpoints

### Diagnostic Logs API
```
GET    /api/logs          # Search logs with filters
GET    /api/logs/all      # Get all logs
GET    /api/logs/count    # Get logs count
POST   /api/logs/upload   # Upload log content
POST   /api/logs/upload-file  # Upload log file
POST   /api/logs/webhook  # Webhook endpoint
DELETE /api/logs          # Clear all logs
GET    /api/logs/test     # Health check
```

### Request/Response Format
```typescript
// Standard API Response
{
  success: boolean;
  data?: any;
  count?: number;
  message?: string;
  error?: string;
}

// Search Parameters
{
  vehicle?: number;    // Vehicle ID filter
  code?: string;       // Error code filter
  from?: string;       // Start date (ISO)
  to?: string;         // End date (ISO)
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Backend (.env)
PORT=3000
WEBHOOK_SECRET=your-webhook-secret
NODE_ENV=development
```

### Data Storage
- **Location**: `data/diagnostic-logs.json`
- **Format**: JSON array of diagnostic log entries
- **Auto-backup**: Automatic file creation and backup

## 🧪 Testing

### Frontend Testing
```bash
npm run test:frontend
```
- Unit tests for components and services
- Integration tests for API communication
- E2E tests for critical user flows

### Backend Testing
```bash
npm run test:backend
```
- Unit tests for controllers and services
- Integration tests for API endpoints
- Mock data for consistent testing

## 📊 Features in Detail

### Vehicle Management
- **List View**: Paginated table with search and sorting
- **Details View**: Comprehensive vehicle information
- **Diagnostic Statistics**: Error, warning, info, and debug counts
- **Log History**: Complete diagnostic log timeline

### Diagnostic Dashboard
- **Real-time Logs**: Live monitoring of diagnostic data
- **Advanced Search**: Multi-criteria filtering
- **File Upload**: Support for various log file formats
- **Webhook Integration**: Real-time data ingestion

### Data Processing
- **Log Parsing**: Automatic parsing of diagnostic log formats
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error management
- **Performance**: Optimized data processing and caching

## 🔒 Security

### API Security
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses
- **Webhook Authentication**: Optional webhook secret validation
- **CORS Configuration**: Proper cross-origin resource sharing

### Data Security
- **File Permissions**: Secure file system access
- **Data Validation**: Input sanitization and validation
- **Error Logging**: Secure error logging without sensitive data

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build:all

# Start production servers
npm run start:prod
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📈 Performance

### Frontend Optimizations
- **Lazy Loading**: Route-based code splitting
- **Caching**: API response caching
- **Bundle Optimization**: Tree shaking and minification
- **CDN Ready**: Static asset optimization

### Backend Optimizations
- **Request Logging**: Performance monitoring
- **Error Handling**: Efficient error processing
- **Data Caching**: In-memory caching for frequently accessed data
- **File I/O**: Optimized file operations

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow ESLint and Prettier configurations
2. **Testing**: Write tests for new features
3. **Documentation**: Update documentation for API changes
4. **Commits**: Use conventional commit messages

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues
- **Port Conflicts**: Ensure ports 3000 and 4200 are available
- **File Permissions**: Check write permissions for data directory
- **Dependencies**: Clear node_modules and reinstall if needed

### Getting Help
- Check the [Issues](../../issues) page
- Review the [Documentation](./docs)
- Contact the development team

## 🔄 Changelog

### Version 1.0.0
- Initial release with core functionality
- Vehicle management and diagnostic monitoring
- RESTful API with webhook support
- Modern Angular frontend with responsive design

---

