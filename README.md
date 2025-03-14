# Project: E-Commerce Application CI/CD Pipeline

This project builds a full-stack ecommerce platform with a Node.js/Express backend (`api/`) and a React frontend (`webapp/`), containerized with Docker, and deployed to AWS ECS via GitHub Actions. Below is a detailed chronicle of its creation, including every step, error encountered, and resolution applied.

My goal with this project is ato automate the integration and deployment process for both components using GitHub Actions, ensuring continuous integration and delivery.

## Project Structure

I started out by defining my project structure. Below is my directory structure:

ecommerce-platform/
├── api/                    # Node.js/Express backend
│   ├── node_modules/
│   ├── public/
│   ├── tests/
│   ├── package.json
│   └── server.js
├── webapp/                 # React frontend
│   ├── node_modules/
│   ├── src/
│   ├── build/
│   ├── package.json
│   └── ...
├── .aws/                   # AWS configuration
│   └── ecomm-plat-task-definition.json
├── .github/
│   └── workflows/
│       └── build-and-test.yml
├── Dockerfile              # Multi-stage Docker build
└── README.md


## Step 1: Creating the Node.js Backend (`api/`)

### Initial Setup

1. **Directory Creation**:
   ```
   mkdir -p ecommerce-platform/api
   cd ecommerce-platform/api
   npm init -y
   ```

- Generated package.json.

2. Install Dependencies:
    ```
    npm install express cors
    npm install --save-dev mocha chai chai-http
    ```

- express: Web server.
- cors: Enable CORS for React frontend.
- mocha, chai, chai-http: Testing tools.

3. Backend Code (server.js):
   
    ```
    const express = require('express');
    const path = require('path');
    const cors = require('cors');
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));

    const products = [
        { id: 1, name: 'T-Shirt', price: 20 },
        { id: 2, name: 'Jeans', price: 40 },
        { id: 3, name: 'Sneakers', price: 60 }
    ];

    app.get('/api/message', (req, res) => {
        res.json({ message: 'Hello from the backend!' });
    });

    app.get('/api/products', (req, res) => {
        res.json(products);
    });

    app.post('/api/login', (req, res) => {
        const { username, password } = req.body;
        if (username === 'user' && password === 'pass') {
            res.json({ success: true, token: 'mock-token' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });

    app.post('/api/orders', (req, res) => {
        const { userId, productIds } = req.body;
        res.json({ success: true, orderId: Math.floor(Math.random() * 1000) });
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

    module.exports = app;
    ```

4. Static File (public/index.html):

    ```
    <!DOCTYPE html>
    <html>
    <head><title>Static Page</title></head>
    <body><h1>Welcome to the Static Page</h1></body>
    </html>
    ```

5. Unit Tests (tests/server.test.js):

    ```
    const chai = require('chai');
    const chaiHttp = require('chai-http');
    const app = require('../server.js');

    chai.use(chaiHttp);
    const { expect } = chai;

    describe('Server Tests', () => {
        it('should return static HTML page', (done) => {
            chai.request(app)
                .get('/')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.html;
                    expect(res.text).to.include('Welcome to the Static Page');
                    done();
                });
        });

        it('should return JSON from /api/message', (done) => {
            chai.request(app)
                .get('/api/message')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.have.property('message', 'Hello from the backend!');
                    done();
                });
        });

        it('should return 200 for unknown routes', (done) => {
            chai.request(app)
                .get('/random-route')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.html;
                    done();
                });
        });

        it('should return product list', (done) => {
            chai.request(app)
                .get('/api/products')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('array').with.lengthOf(3);
                    done();
                });
        });

        it('should login with correct credentials', (done) => {
            chai.request(app)
                .post('/api/login')
                .send({ username: 'user', password: 'pass' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('success', true);
                    done();
                });
        });

        it('should place an order', (done) => {
            chai.request(app)
                .post('/api/orders')
                .send({ userId: 1, productIds: [1, 2] })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('success', true);
                    done();
                });
        });
    });
    ```

6. Run Locally:

    ```
    npm start  # http://localhost:3000
    npm test   # 6 passing tests
    ```

### Step 2: Creating the React Frontend (webapp/)

Initial Setup

1. Directory Creation:

    ```
    cd ecommerce-platform
    mkdir webapp
    cd webapp
    npx create-react-app .
    ```

2. Install Dependencies:

    ```
    npm install axios
    ```

3. Frontend Code (src/App.js)

    ```
    import { useState, useEffect } from 'react';
    import axios from 'axios';
    import './App.css';

    function App() {
        const [message, setMessage] = useState('Loading;');
        const [products, setProducts] = useState([]);
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const [orderStatus, setOrderStatus] = useState('');

        useEffect(() => {
            axios.get('http://localhost:3000/api/message')
                .then(response => setMessage(response.data.message))
                .catch(error => {
                    console.error('Error fetching message:', error);
                    setMessage('Failed to connect to backend');
                });

            axios.get('http://localhost:3000/api/products')
                .then(response => setProducts(response.data))
                .catch(error => console.error('Error fetching products:', error));
        }, []);

        const handleLogin = () => {
            axios.post('http://localhost:3000/api/login', { username, password })
                .then(response => {
                    if (response.data.success) {
                        setIsLoggedIn(true);
                        setUsername('');
                        setPassword('');
                    } else {
                        alert('Login failed: ' + response.data.message);
                    }
                })
                .catch(error => console.error('Login error:', error));
        };

        const handleOrder = () => {
            const productIds = products.map(p => p.id);
            axios.post('http://localhost:3000/api/orders', { userId: 1, productIds })
                .then(response => {
                    if (response.data.success) {
                        setOrderStatus(`Order placed! ID: ${response.data.orderId}`);
                    }
                })
                .catch(error => console.error('Order error:', error));
        };

        return (
            <div className="App">
                <header className="App-header">
                    <h1>React Webapp</h1>
                    <p>Backend says: {message}</p>
                    {!isLoggedIn ? (
                        <div>
                            <h2>Login</h2>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button onClick={handleLogin}>Login</button>
                        </div>
                    ) : (
                        <div>
                            <h2>Welcome, User!</h2>
                            <h3>Products</h3>
                            <ul>
                                {products.map(product => (
                                    <li key={product.id}>
                                        {product.name} - ${product.price}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={handleOrder}>Place Order</button>
                            {orderStatus && <p>{orderStatus}</p>}
                        </div>
                    )}
                </header>
            </div>
        );
    }

    export default App;
    ```

4. Styling (src/App.css)

    ```
    .App {
        text-align: center;
    }

    .App-header {
        background-color: #282c34;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: calc(10px + 2vmin);
        color: white;
    }

    input, button {
        margin: 5px;
        padding: 5px;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    li {
        margin: 10px 0;
    }
    ```

5. Run Locally:

    ```
    npm start # http://localhost:3001
    ```

- Start api/ first (cd ../api && npm start), then webapp/ to see the UI connect to the backend.

### Step 3: Initial Errors and Fixes

**Backend Errors**

1. JSON Parsing Error:
   - Error: EJSONPARSE on npm install due to a comment in package.json
   - Fix: Removed // March chai-http@4... from devDependencies.

2. Test Setup:
   - Fix: Added chai.use(chaiHttp) to server.test.js

**Frontend Errors**

1. CORS Issue:
   - Error: React couldn't fetch from localhost:3000
   - Fix: Added cors to api/server.js.

2. Missing web-vitals:
   - Error: Module not found: Error: Can't resolve 'web-vitals'.
   - Fix: npm install web-vitals.

3. Dependency Conflicts:
   - Error: npm install axios showed vulnerabilities; npm ci failed with typescript mismatches.
   - Fix: Pinned typescript to ^4.9.5 to match react-scripts@5.0.1.
  
4. ESLint Issues:

- Error: EJSONPARSE from comments, JSX parsing failures, and version conflicts (eslint@9 vs 8)
- Fix: Used ESLint 8, pinned @eslint/compat@1.1.1, removed comments, fixed eslint.config.js

5. Test Errors:

- Error: Cannot find module '@testing-library/dom'.
- Fix: npm install -save-dev @testing-library/dom.


### Step 4: Dockerizing the App

Dockerfile Creation
- Multi-stage Build:

    ```
    # Build frontend
    FROM node:18 AS frontend-build
    WORKDIR /app/webapp
    COPY webapp/package*.json ./
    RUN npm ci
    COPY webapp/ ./
    RUN npm run build

    # Build backend with frontend assets
    FROM node:18
    WORKDIR /app/api
    COPY api/package*.json ./
    RUN npm ci
    COPY api/ ./
    COPY --from=frontend-build /app/webapp/build ./webapp
    EXPOSE 3000
    CMD ["node", "server.js"]
    ```

- Build and Run:

    ```
    cd ecommerce-platform
    docker build -t ecomm-local .
    docker run -p 3000:3000 ecomm-local
    ```

### Docker Errors

1. Dependency Conflicts:
   - Error: npm ci failed due to @eslint/compat@1.2.7 needing eslint@9.
   - Fix: Pinned @eslint/compat@1.1.1.
2. TypeScript Mismatch:
   - Error: typescript@5.8.2 vs 4.9.5.
   - Fix: Set "typescript": "^4.9.5" in webapp/package.json.

## Step 5: GitHub Actions CI/CD

Workflow File (.github/workflows/node.js.yml)

    ```
    name: Build and Test

    on:
    push:
        branches: [main]

    jobs:
    build-and-test:
        runs-on: ubuntu-latest
        defaults:
        run:
            working-directory: ./webapp

        steps:
        - uses: actions/checkout@v4

        - name: Set up Node.js
            uses: actions/setup-node@v4
            with:
            node-version: '18'

        - name: Install dependencies
            run: npm ci

        - name: Lint Frontend
            run: npm run lint

        - name: Test Frontend
            run: npm test -- --watchAll=false

        - name: Build Frontend
            run: npm run build

        - name: Set up Docker Buildx
            uses: docker/setup-buildx-action@v3

        - name: Login to Docker Hub
            uses: docker/login-action@v3
            with:
            username: ${{ secrets.DOCKER_USERNAME }}
            password: ${{ secrets.DOCKER_PASSWORD }}

        - name: Configure AWS Credentials
            uses: aws-actions/configure-aws-credentials@v4
            with:
            aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
            aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
            aws-region: us-east-1

        - name: Login to Amazon ECR
            id: login-ecr
            uses: aws-actions/amazon-ecr-login@v2

        - name: Create ECR Repository if Not Exists
            working-directory: .
            run: |
            aws ecr describe-repositories --repository-names ecommerce-platform --region us-east-1 || aws ecr create-repository --repository-name ecommerce-platform --region us-east-1
            env:
            AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
            AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
            AWS_REGION: us-east-1

        - name: Build and Push to Docker Hub and ECR
            working-directory: .
            run: |
            docker build -t ecomm-local:latest .
            docker tag ecomm-local:latest ${{ secrets.DOCKER_USERNAME }}/ecommerce-platform:latest
            docker push ${{ secrets.DOCKER_USERNAME }}/ecommerce-platform:latest
            docker tag ecomm-local:latest 239783743771.dkr.ecr.us-east-1.amazonaws.com/ecommerce-platform:latest
            docker push 239783743771.dkr.ecr.us-east-1.amazonaws.com/ecommerce-platform:latest

        - name: Update ECS Task Definition
            working-directory: .
            run: |
            aws ecs register-task-definition --cli-input-json file://$GITHUB_WORKSPACE/.aws/ecomm-plat-task-definition.json
            env:
            AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
            AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
            AWS_REGION: us-east-1

        - name: Deploy to ECS
            working-directory: .
            run: |
            aws ecs update-service --cluster ecommerce-platform --service ecomm-service --force-new-deployment
            env:
            AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
            AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
            AWS_REGION: us-east-1
    ```

### CI/CD Errors

1. JSON Parsing (api/package.json):
   - Error: EJSONPARSE due to comments.
   - Fix: Removed comments.
2. Vulnerabilities:
   - Error: nth-check and postcss vulnerabilities.
   - Fix: Ran npm audit fix, accepted minor risks.
3. TypeScript Mismatch:
   - Error: typescript@5.8.2 vs 4.9.5.
   - Fix: Pinned to ^4.9.5.
4. ECR Login:
   - Error: Region is missing.
   - Fix: Added configure-aws-credentials@v4 before amazon-ecr-login@v2.
5. ECR Push:
   - Error: ECR push failed.
   - Fix: Added repository creation step.
6. Task Definition:
   - Errors: File not found, invalid JSON (comments), read-only fields, empty tags.
   - Fixes: Moved to .aws/, removed comments, stripped invalid fields, removed empty tags.
  
## Final Verification
   - Local: docker run -p 3000:3000 ecomm-local shows the app at localhost:3000.
   - CI/CD: Workflow pushes to Docker Hub (distinctugo/ecommerce-platform:latest) and ECR (239783743771.dkr.ecr.us-east-1.amazonaws.com/ecommerce-platform:latest), deploys to ECS (ecommerce-platform cluster, ecomm-service).