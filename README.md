<<<<<<< HEAD
# Vehicles Dashboard

A comprehensive vehicle diagnostic monitoring system built with Angular (Frontend) and NestJS (Backend) using Nx monorepo architecture. This system provides real-time monitoring, diagnostic log analysis, and vehicle management capabilities.

## 🚀 Features

### Frontend (Angular)
- **Vehicle Management**: View, search, and manage vehicle diagnostic data
- **Real-time Monitoring**: Live diagnostic logs with filtering and pagination
- **Responsive Design**: Modern UI with search, pagination, and sorting capabilities
- **Diagnostic Dashboard**: Comprehensive log analysis and statistics
- **Vehicle Details**: Detailed view with diagnostic statistics and log history
- **Level-based Filtering**: Filter logs by ERROR, WARNING, INFO, and DEBUG levels

### Backend (NestJS)
- **RESTful API**: Complete CRUD operations for diagnostic logs
- **File Upload**: Support for log file uploads
- **Webhook Integration**: Real-time log ingestion via webhooks
- **Search & Filtering**: Advanced search capabilities with date ranges
- **Data Persistence**: JSON-based file storage with automatic backup
- **OBD-II Code Classification**: Automatic classification of diagnostic trouble codes
- **Vehicle Statistics**: Real-time vehicle-specific diagnostic statistics

## 🏗️ Architecture

### Monorepo Structure
```
vehicles-dashboard/
├── apps/
│   ├── frontend/          # Angular application (Port: 4200)
│   └── backend/           # NestJS API server (Port: 3000)
├── libs/
│   ├── diagnostic-api/    # Diagnostic API library (controllers, modules)
│   ├── diagnostic-ui/     # Diagnostic UI components
│   ├── shared-ui/         # Shared UI components
│   ├── ui-api-service/    # Frontend API service
│   ├── db-services/       # Database services and data processing
│   ├── data-model/        # Shared data models and interfaces
│   └── api-utils/         # API utilities and helpers
├── data/                  # JSON data storage
│   ├── diagnostic-db.json # Main database file
│   └── diagnostic-logs.json # Log storage file
└── nx.json               # Nx workspace configuration
```

### Technology Stack
- **Frontend**: Angular 20, TypeScript, SCSS
- **Backend**: NestJS 11, TypeScript, Express
- **Build Tool**: Nx 21, Webpack
- **Package Manager**: npm
- **Development**: ESLint, Prettier, Jest
- **Data Storage**: JSON file-based storage with fs operations

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup from GitHub
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vehicles-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npx nx graph
   ```

## 🚀 Running the Application

### Development Mode

#### Start Backend Server
```bash
# Navigate to project directory
cd vehicles-dashboard

# Start backend API server (Port: 3000)
npx nx serve backend
```

#### Start Frontend Application
```bash
# In a new terminal, navigate to project directory
cd vehicles-dashboard

# Start frontend application (Port: 4200)
npx nx serve frontend
```


## 🔧 Development Commands

### Available Nx Commands
```bash
# Development
npx nx serve backend          # Start backend dev server
npx nx serve frontend         # Start frontend dev server
npx nx run-many --target=serve --projects=frontend,backend  # Start both

# Building
npx nx build backend          # Build backend
npx nx build frontend         # Build frontend
npx nx build backend --configuration=production  # Production build

# Testing
npx nx test backend           # Test backend
npx nx test frontend          # Test frontend
npx nx test                   # Test all projects

# Linting
npx nx lint backend           # Lint backend
npx nx lint frontend          # Lint frontend
npx nx lint                   # Lint all projects

# Code Generation
npx nx generate @nx/angular:component --project=frontend --name=my-component
npx nx generate @nx/nest:controller --project=backend --name=my-controller
```

### Quick Reference URLs
```bash
# Application URLs (when running)
Frontend Application:    http://localhost:4200
Backend API:            http://localhost:3000/api
Swagger Documentation:   http://localhost:3000/api/docs
```

### Project Structure Details

#### Frontend (Angular - Port 4200)
- **Location**: `apps/frontend/`
- **Main Entry**: `apps/frontend/src/main.ts`
- **Proxy Configuration**: `apps/frontend/proxy.conf.json` (routes `/api` to backend)
- **Features**:
  - Vehicle listing with search and pagination
  - Vehicle details with diagnostic statistics
  - Real-time log monitoring
  - File upload interface
  - Responsive design with modern UI

#### Backend (NestJS - Port 3000)
- **Location**: `apps/backend/`
- **Main Entry**: `apps/backend/src/main.ts`
- **API Base**: `http://localhost:3000/api`
- **Features**:
  - RESTful API endpoints
  - File upload handling
  - Webhook integration
  - Data persistence with JSON files
  - OBD-II diagnostic code classification

#### Shared Libraries
- **diagnostic-api**: API controllers and modules
- **diagnostic-ui**: Angular components for diagnostic features
- **ui-api-service**: Frontend API communication service
- **db-services**: Database operations and data processing
- **data-model**: Shared TypeScript interfaces and types
- **shared-ui**: Reusable UI components
- **api-utils**: API utilities and helpers

## 📡 API Documentation

### Swagger UI Documentation
The API documentation is available through Swagger UI when the backend is running:

**🌐 Swagger Documentation URL**: `http://localhost:3000/api/docs`

This interactive documentation provides:
- Complete API endpoint documentation
- Request/response schemas
- Interactive testing interface
- Example requests and responses
- Authentication details (if applicable)

### API Endpoints

#### Diagnostic Logs API
```
GET    /api/logs                    # Search logs with filters
GET    /api/logs/all                # Get all logs
GET    /api/logs/count              # Get logs count
GET    /api/logs/vehicle/:id/stats  # Get vehicle statistics
GET    /api/logs/vehicles           # Get unique vehicle IDs
GET    /api/logs/db-info            # Get database information
POST   /api/logs/upload             # Upload log content
POST   /api/logs/upload-file        # Upload log file
POST   /api/logs/webhook            # Webhook endpoint
DELETE /api/logs                    # Clear all logs
GET    /api/logs/test               # Health check
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

// Vehicle Statistics Response
{
  success: true;
  message: "Vehicle 1000 statistics";
  data: {
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    debugCount: number;
  }
}

// Search Parameters
{
  vehicle?: number;    // Vehicle ID filter
  code?: string;       // Error code filter
  from?: string;       // Start date (ISO)
  to?: string;         // End date (ISO)
  level?: string;      // Log level filter (ERROR, WARNING, INFO, DEBUG)
}
```

## 🔧 Configuration

### Environment Setup
The application uses default configurations for development:

- **Frontend**: `http://localhost:4200`
- **Backend**: `http://localhost:3000`
- **API Base**: `http://localhost:3000/api`
- **Proxy**: Frontend proxies `/api` requests to backend

### Data Storage
- **Location**: `data/` directory
- **Files**:
  - `diagnostic-db.json`: Main database with processed logs
  - `diagnostic-logs.json`: Raw log storage
- **Format**: JSON with automatic backup and recovery



## 🧪 Testing

### Running Tests
```bash
# Run all tests
npx nx test

# Run specific project tests
npx nx test backend
npx nx test frontend

# Run tests with coverage
npx nx test backend --coverage
```

### Test Structure
- **Unit Tests**: Individual component and service tests
- **Integration Tests**: API endpoint testing
- **E2E Tests**: End-to-end user flow testing

## 📊 Features in Detail

### Vehicle Management
- **List View**: Paginated table with search, sorting, and filtering
- **Details View**: Comprehensive vehicle information with diagnostic statistics
- **Real-time Updates**: Live data updates without page refresh
- **Level-based Filtering**: Filter by ERROR, WARNING, INFO, DEBUG levels

### Diagnostic Dashboard
- **Real-time Logs**: Live monitoring of diagnostic data
- **Advanced Search**: Multi-criteria filtering with date ranges
- **File Upload**: Support for various log file formats
- **Webhook Integration**: Real-time data ingestion
- **Statistics**: Vehicle-specific diagnostic statistics

### Data Processing
- **Log Parsing**: Automatic parsing of diagnostic log formats
- **Level Classification**: Intelligent classification of log levels
- **Data Validation**: Input validation and sanitization
- **Performance**: Optimized data processing and caching

## 🔒 Security

### API Security
- **Input Validation**: Comprehensive request validation using class-validator
- **Error Handling**: Secure error responses without sensitive data exposure
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Request Logging**: Detailed request/response logging for monitoring

### Data Security
- **File Permissions**: Secure file system access
- **Data Validation**: Input sanitization and validation
- **Error Logging**: Secure error logging without sensitive data


## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow ESLint and Prettier configurations
2. **Testing**: Write tests for new features
3. **Documentation**: Update documentation for API changes
4. **Commits**: Use conventional commit messages

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Run linting and tests
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues and Solutions

#### Port Conflicts
```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :4200

# Kill processes if needed
taskkill /PID <process-id> /F
```

#### Build Issues
```bash
# Clear cache and rebuild
npx nx reset
npm install
npx nx run-many --target=build --projects=frontend,backend
```

#### Data Issues
```bash
# Check data files
ls -la data/
# Ensure write permissions
chmod 755 data/
```


### Version 1.0.0 (Current)
- **Core Features**:
  - Vehicle management and diagnostic monitoring
  - RESTful API with webhook support
  - Modern Angular frontend with responsive design
  - OBD-II diagnostic code classification
  - Real-time vehicle statistics
  - File upload and webhook integration
  - Level-based log filtering (ERROR, WARNING, INFO, DEBUG)

- **Technical Improvements**:
  - Nx monorepo architecture
  - TypeScript throughout the stack
  - Comprehensive error handling
  - Performance optimizations
  - Security enhancements

---

**Note**: This is a development-ready application. For production deployment, ensure proper environment configuration, security measures, and monitoring setup.

=======
# vehicle-diagnostics
Vehicle Diagnostics &amp; Configuration Dashboard
>>>>>>> 833c626793d31c456fe61e8759e29dcb1d8e5cdf
