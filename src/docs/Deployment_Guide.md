# Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Job Portal API to various platforms including cloud services, containerization, and production best practices.

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Git repository
- Domain name (optional but recommended)

## Environment Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jobportal?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=24h

# Admin Account
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# File Upload Configuration (optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Security Considerations

```env
# Production Security
SESSION_SECRET=another-super-secure-secret-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_SALT_ROUNDS=12
```

## Cloud Deployment Options

### 1. Heroku Deployment

#### Prerequisites

- Heroku CLI installed
- Heroku account

#### Steps

1. **Create Heroku App**

```bash
heroku create your-job-portal-api
```

2. **Add MongoDB Atlas**

```bash
heroku addons:create mongolab:sandbox
```

3. **Set Environment Variables**

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set ADMIN_EMAIL=admin@yourdomain.com
heroku config:set ADMIN_PASSWORD=secure-password
```

4. **Create Procfile**

```
web: npm start
```

5. **Deploy**

```bash
git push heroku main
```

6. **Scale Dynos**

```bash
heroku ps:scale web=1
```

#### Heroku Configuration

**package.json scripts:**

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "heroku-postbuild": "npm run build"
  }
}
```

### 2. Railway Deployment

#### Prerequisites

- Railway account
- GitHub repository

#### Steps

1. **Connect GitHub Repository**

   - Go to Railway dashboard
   - Click "New Project"
   - Connect your GitHub repository

2. **Environment Variables**

   - Add all required environment variables in Railway dashboard
   - Railway will automatically set PORT

3. **Deploy**
   - Railway automatically deploys on git push
   - Monitor deployment logs in dashboard

### 3. AWS EC2 Deployment

#### Prerequisites

- AWS account
- EC2 instance running Ubuntu 20.04+
- SSH key pair

#### Steps

1. **Launch EC2 Instance**

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip
```

2. **Install Dependencies**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

3. **Deploy Application**

```bash
# Clone repository
git clone https://github.com/yourusername/job-portal-api.git
cd job-portal-api

# Install dependencies
npm install

# Build TypeScript
npm run build

# Create .env file
nano .env
```

4. **Configure PM2**

```bash
# Create ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: "job-portal-api",
      script: "dist/index.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
```

5. **Start Application**

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

6. **Configure Nginx**

```bash
sudo nano /etc/nginx/sites-available/job-portal-api
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Enable Nginx Configuration**

```bash
sudo ln -s /etc/nginx/sites-available/job-portal-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Digital Ocean Deployment

#### Prerequisites

- Digital Ocean account
- Droplet with Ubuntu 20.04+

#### Steps

1. **Create Droplet**

   - Choose Ubuntu 20.04
   - Select appropriate size (minimum 1GB RAM)
   - Add SSH key

2. **Follow Similar Steps to AWS EC2**

   - SSH into droplet
   - Install Node.js, PM2, Nginx
   - Clone and deploy application

3. **Configure Firewall**

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/jobportal
      - JWT_SECRET=your-jwt-secret
      - ADMIN_EMAIL=admin@example.com
      - ADMIN_PASSWORD=secure-password
    depends_on:
      - mongo
      - redis
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  mongo:
    image: mongo:5.0
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
```

### Docker Commands

```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Scale application
docker-compose up -d --scale app=3

# Stop services
docker-compose down

# Remove volumes (careful!)
docker-compose down -v
```

## Kubernetes Deployment

### Deployment YAML

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: job-portal-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: job-portal-api
  template:
    metadata:
      labels:
        app: job-portal-api
    spec:
      containers:
        - name: job-portal-api
          image: your-registry/job-portal-api:latest
          ports:
            - containerPort: 5000
          env:
            - name: NODE_ENV
              value: "production"
            - name: MONGO_URI
              valueFrom:
                secretKeyRef:
                  name: job-portal-secrets
                  key: mongo-uri
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: job-portal-secrets
                  key: jwt-secret
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 5000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 5000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Service YAML

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: job-portal-api-service
spec:
  selector:
    app: job-portal-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5000
  type: LoadBalancer
```

### Ingress YAML

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: job-portal-api-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - api.yourdomain.com
      secretName: job-portal-tls
  rules:
    - host: api.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: job-portal-api-service
                port:
                  number: 80
```

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**

   - Go to MongoDB Atlas
   - Create new cluster
   - Choose appropriate tier

2. **Database Configuration**

   - Create database user
   - Configure IP whitelist
   - Get connection string

3. **Connection String**

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/jobportal?retryWrites=true&w=majority
```

### Self-Hosted MongoDB

```bash
# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Configure MongoDB
sudo nano /etc/mongod.conf
```

```yaml
# mongod.conf
net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled
```

## SSL/TLS Configuration

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx SSL Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring and Logging

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Reload application
pm2 reload all
```

### Application Logging

```typescript
// src/utils/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
```

### Health Check Endpoint

```typescript
// Health check for monitoring
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
  });
});
```

## Performance Optimization

### 1. Enable Gzip Compression

```typescript
import compression from "compression";
app.use(compression());
```

### 2. Caching Strategy

```typescript
// Redis caching
import redis from "redis";
const client = redis.createClient(process.env.REDIS_URL);

// Cache middleware
const cache = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl;
    const cachedData = await client.get(key);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };

    next();
  };
};
```

### 3. Database Optimization

```typescript
// Connection pooling
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
```

## Security in Production

### 1. Environment Variables

```bash
# Never commit .env files
echo ".env" >> .gitignore
```

### 2. Security Headers

```typescript
import helmet from "helmet";
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);
```

### 3. Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);
```

## Backup Strategy

### 1. Database Backup

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGO_URI" --out="/backup/mongodb_$DATE"
tar -czf "/backup/mongodb_$DATE.tar.gz" "/backup/mongodb_$DATE"
rm -rf "/backup/mongodb_$DATE"
```

### 2. Automated Backups

```bash
# Cron job for daily backups
0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**

```bash
sudo lsof -t -i tcp:5000 | xargs kill -9
```

2. **MongoDB Connection Issues**

```bash
# Check MongoDB status
sudo systemctl status mongod
```

3. **SSL Certificate Issues**

```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### Debugging

```typescript
// Debug mode
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connected and seeded
- [ ] SSL certificate installed
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Health check endpoint working
- [ ] Logging configured
- [ ] Error tracking setup
- [ ] Performance monitoring enabled
- [ ] Documentation updated

This comprehensive deployment guide covers multiple deployment strategies and production considerations for the Job Portal API.
