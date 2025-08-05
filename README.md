# Vehicle Diagnostics & Configuration Dashboard

A fullstack application for processing, storing, and displaying vehicle diagnostic logs with a modern web interface.

## 🚀 Features

### Frontend (Angular 20.1.0)
- **Search Panel**: Filter logs by Vehicle ID, Error Code, and Timestamp range
- **File Upload**: Drag & drop or browse to upload diagnostic log files (up to 50MB)
- **Logs Table**: Display filtered results with sorting and CSV export
- **Real-time Updates**: Automatic refresh after file uploads
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, accessible interface with status indicators

### Backend (NestJS 11.x)
- **REST API**: Complete CRUD operations for diagnostic logs
- **File Upload**: Handles large files (up to 50MB) with validation
- **Webhook Support**: External systems can send diagnostic data via webhook
- **Search & Filter**: Advanced filtering by multiple criteria
- **Data Parsing**: Automatically parses diagnostic log format
- **Error Handling**: Comprehensive error handling and validation

## 📋 Requirements

- Node.js 20.19.0 or higher
- npm 10.0.0 or higher
- Angular CLI 20.1.0
- Nx CLI (latest)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vehicles-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend**
   ```bash
   npx nx serve backend
   ```
   Backend will be available at: http://localhost:3000/api

4. **Start the frontend** (in a new terminal)
   ```bash
npx nx serve frontend
   ```
   Frontend will be available at: http://localhost:4200

## 📁 Project Structure

```
vehicles-dashboard/
├── apps/
│   ├── backend/                 # NestJS backend application
│   ├── frontend/                # Angular frontend application
│   ├── backend-e2e/             # Backend end-to-end tests
│   └── frontend-e2e/            # Frontend end-to-end tests
├── libs/
│   ├── data-model/              # Shared data models and DTOs
│   ├── db-services/             # Database and business logic services
│   ├── diagnostic-api/          # Backend API controllers and modules
│   └── diagnostic-ui/           # Frontend UI components and services
├── sample-large-logs.txt        # Sample diagnostic log file for testing
└── README.md                    # This file
```

## 🔧 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Search Logs
```http
GET /logs?vehicle=1234&code=U0420&from=2025-07-24T00:00:00Z&to=2025-07-24T23:59:59Z
```

**Query Parameters:**
- `vehicle` (optional): Vehicle ID number
- `code` (optional): Error code to filter by
- `from` (optional): Start timestamp (ISO format)
- `to` (optional): End timestamp (ISO format)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-07-24T14:21:08.000Z",
      "vehicleId": 1234,
      "level": "ERROR",
      "code": "U0420",
      "message": "Steering angle sensor malfunction"
    }
  ],
  "count": 1,
  "filters": {
    "vehicle": 1234,
    "code": "U0420"
  }
}
```

#### 2. Get All Logs
```http
GET /logs/all
```

#### 3. Get Logs Count
```http
GET /logs/count
```

#### 4. Upload Log Content
```http
POST /logs/upload
Content-Type: application/json

{
  "content": "[2025-07-24 14:21:08] [VEHICLE_ID:1234] [ERROR] [CODE:U0420] [Steering angle sensor malfunction]"
}
```

#### 5. Upload Log File
```http
POST /logs/upload-file
Content-Type: multipart/form-data

file: <file>
```

**Supported file types:** `.txt`, `.log`
**Maximum file size:** 50MB

#### 6. Webhook Endpoint
```http
POST /logs/webhook
Content-Type: application/json
X-Webhook-Secret: your-secret-key (optional)

{
  "logs": [
    "[2025-07-24 14:21:08] [VEHICLE_ID:1234] [ERROR] [CODE:U0420] [Steering angle sensor malfunction]"
  ]
}
```

**Webhook Authentication:**
- Optional authentication via `X-Webhook-Secret` header
- Default secret: `default-webhook-secret-2024`
- Can be overridden with `WEBHOOK_SECRET` environment variable

#### 7. Clear All Logs
```http
DELETE /logs
```

## 📝 Diagnostic Log Format

The application parses diagnostic logs in the following format:

```
[TIMESTAMP] [VEHICLE_ID:ID] [LEVEL] [CODE:CODE] [MESSAGE]
```

**Example:**
```
[2025-07-24 14:21:08] [VEHICLE_ID:1234] [ERROR] [CODE:U0420] [Steering angle sensor malfunction]
```

**Components:**
- `TIMESTAMP`: Date and time in format `YYYY-MM-DD HH:mm:ss`
- `VEHICLE_ID`: Numeric vehicle identifier
- `LEVEL`: Log level (ERROR, WARNING, INFO)
- `CODE`: Diagnostic trouble code (e.g., U0420, P0300)
- `MESSAGE`: Human-readable description of the issue

## 🎯 Usage Examples

### 1. Upload a Diagnostic Log File
1. Open the frontend application
2. Drag and drop a `.txt` or `.log` file onto the upload area
3. Click "Upload File"
4. View the uploaded logs in the table

### 2. Search for Specific Logs
1. Use the search panel to filter by:
   - Vehicle ID (e.g., 1234)
   - Error Code (e.g., U0420)
   - Date range
2. Click "Search" to see filtered results
3. Export results to CSV if needed

### 3. Send Data via Webhook
```bash
curl -X POST http://localhost:3000/api/logs/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: default-webhook-secret-2024" \
  -d '{
    "logs": [
      "[2025-07-24 14:21:08] [VEHICLE_ID:1234] [ERROR] [CODE:U0420] [Steering angle sensor malfunction]"
    ]
  }'
```

## 🏗️ Architecture

### Frontend Architecture
- **Angular 20.1.0**: Modern framework with standalone components
- **Reactive Forms**: For search functionality
- **HTTP Client**: For API communication
- **Component-based**: Modular, reusable UI components
- **TypeScript**: Type-safe development

### Backend Architecture
- **NestJS 11.x**: Enterprise-grade Node.js framework
- **Modular Design**: Organized into feature modules
- **DTO Validation**: Input validation using class-validator
- **Error Handling**: Comprehensive error responses
- **CORS Support**: Configured for frontend communication

### Data Flow
1. **File Upload**: Frontend → Backend → Parse → Store in Memory
2. **Search**: Frontend → Backend → Filter → Return Results
3. **Webhook**: External System → Backend → Parse → Store in Memory

## 🔒 Security Features

- **File Type Validation**: Only `.txt` and `.log` files accepted
- **File Size Limits**: Maximum 50MB per file
- **Input Validation**: All inputs validated using DTOs
- **CORS Configuration**: Restricted to frontend origin
- **Webhook Authentication**: Optional secret-based authentication

## 🧪 Testing

### Backend Tests
```bash
npx nx test backend
```

### Frontend Tests
```bash
npx nx test frontend
```

### E2E Tests
```bash
npx nx e2e frontend-e2e
npx nx e2e backend-e2e
```

## 🚀 Deployment

### Development
```bash
# Start both applications
npx nx run-many --target=serve --projects=backend,frontend
```

### Production Build
```bash
# Build backend
npx nx build backend

# Build frontend
npx nx build frontend
```

## 📊 Performance

- **File Upload**: Supports files up to 50MB
- **Memory Storage**: In-memory storage for fast access
- **Search Performance**: Optimized filtering and sorting
- **Response Time**: Sub-second response times for typical queries

## 🔧 Configuration

### Backend Configuration
- **Port**: 3000 (configurable via `PORT` environment variable)
- **API Prefix**: `/api`
- **CORS**: Enabled for `http://localhost:4200`
- **File Upload**: 50MB limit
- **Webhook Secret**: `default-webhook-secret-2024` (configurable)

### Frontend Configuration
- **Port**: 4200
- **API URL**: `http://localhost:3000/api`
- **File Upload**: 50MB limit
- **Supported Formats**: `.txt`, `.log`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the API documentation above
2. Review the sample log file: `sample-large-logs.txt`
3. Check the browser console for frontend errors
4. Check the backend logs for server errors

## 🔄 Future Enhancements

- [ ] Database persistence (PostgreSQL, MongoDB)
- [ ] Real-time notifications
- [ ] Advanced analytics and reporting
- [ ] User authentication and authorization
- [ ] Bulk operations
- [ ] API rate limiting
- [ ] Docker containerization
- [ ] CI/CD pipeline
