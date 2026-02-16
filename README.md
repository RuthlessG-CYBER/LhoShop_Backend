# Ecommerce Backend API

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Framework-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green.svg)](https://mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-blue.svg)](https://jwt.io/)
[![Deploy](https://img.shields.io/badge/Deploy-Render-purple.svg)]()
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)]()

Production-ready Ecommerce Backend built with Node.js, Express.js, and MongoDB.  
Supports authentication, cart, orders, payments, admin panel, analytics, reports, and role-based access control.

---

# Base URL:

http://localhost:5000/api/v1


# Production:

https://lhoshop-backend.onrender.com/api/v1

---

# Authentication and Roles

| Role        | Access Level |
|-------------|--------------|
| customer    | App usage    |
| admin       | Admin panel  |
| superadmin  | Full access  |
| manager     | Limited admin|
| support     | Support ops  |

Authentication uses JWT Bearer Token.

---

# API Endpoints

---

## Authentication

| Method | Endpoint            | Description          | Access |
|--------|---------------------|----------------------|--------|
| POST   | /register           | Register user        | Public |
| POST   | /login              | Login user           | Public |
| POST   | /admin/register     | Register admin       | Superadmin |
| POST   | /admin/login        | Admin login          | Public |

---

## Profile

| Method | Endpoint                        | Description             | Access |
|--------|----------------------------------|-------------------------|--------|
| PATCH  | /profile-image/:userId         | Upload profile image    | User |
| GET    | /profile-image/:userId         | Get profile image       | User |

---

## Address

| Method | Endpoint                             | Description         | Access |
|--------|--------------------------------------|---------------------|--------|
| POST   | /add-address/:userId                 | Add address         | User |
| GET    | /addresses/:userId                  | Get addresses       | User |
| DELETE | /addresses/:userId/:addressId       | Delete address      | User |

---

## Products

| Method | Endpoint                  | Description        | Access |
|--------|---------------------------|--------------------|--------|
| GET    | /products                 | Get all products   | Public |
| GET    | /products/:id            | Get product by id  | Public |
| POST   | /products/create         | Create product     | Admin |
| PUT    | /products/edit/:id       | Edit product       | Admin |
| DELETE | /products/delete/:id     | Delete product     | Admin |

---

## Cart

| Method | Endpoint          | Description        | Access |
|--------|-------------------|--------------------|--------|
| GET    | /cart/:userId    | Get cart           | User |
| POST   | /cart/add        | Add to cart        | User |
| DELETE | /cart/remove     | Remove from cart   | User |

---

## Orders

| Method | Endpoint                     | Description         | Access |
|--------|------------------------------|---------------------|--------|
| GET    | /orders                     | Get all orders      | Admin |
| GET    | /orders/:userId            | Get user orders     | User |
| PATCH  | /orders/status/:orderId    | Update status       | Admin |

---

## Payments

| Method | Endpoint              | Description          | Access |
|--------|-----------------------|----------------------|--------|
| POST   | /payment/order       | Create order         | User |
| POST   | /payment/verify     | Verify payment       | User |

---

## Notifications

| Method | Endpoint                               | Description       | Access |
|--------|----------------------------------------|-------------------|--------|
| GET    | /admin/notifications                   | Get notifications | Admin |
| GET    | /admin/notifications/total            | Total count       | Admin |
| GET    | /admin/notifications/unread           | Unread count      | Admin |
| GET    | /admin/notifications/read             | Read count        | Admin |
| PUT    | /admin/notifications/read/:id         | Mark as read      | Admin |

---

## Tickets

| Method | Endpoint                      | Description         | Access |
|--------|-------------------------------|---------------------|--------|
| POST   | /tickets                     | Create ticket       | User |
| GET    | /tickets                     | Get tickets         | Admin |
| PATCH  | /tickets/:id/status         | Update status       | Admin |
| DELETE | /tickets/:id                | Delete ticket       | Admin |
| GET    | /tickets/email/:email       | Get by email        | User |

---

## Returns

| Method | Endpoint           | Description         | Access |
|--------|--------------------|---------------------|--------|
| POST   | /returns           | Create return       | User |
| GET    | /returns           | Get returns         | Admin |
| PATCH  | /returns/:id      | Update return       | Admin |

---

## Admin Dashboard

| Method | Endpoint                         | Description            |
|--------|----------------------------------|------------------------|
| GET    | /admin/total-revenue            | Total revenue          |
| GET    | /admin/total-customers          | Customer count         |
| GET    | /admin/total-orders             | Order count            |
| GET    | /admin/total-products           | Product count          |
| GET    | /admin/users                    | All users              |
| GET    | /admin/payments                 | All payments           |

---

## Reports

| Method | Endpoint                                  | Description |
|--------|-------------------------------------------|-------------|
| GET    | /admin/reports/users                     | Users report |
| GET    | /admin/reports/products                  | Products report |
| GET    | /admin/reports/sales                     | Sales report |
| GET    | /admin/reports/admin-roles               | Admin roles report |

---

## Installation

# Clone repository
```
git clone https://github.com/yourusername/ecommerce-backend.git
```

# Install dependencies
```
npm install
```

# Create .env
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_unique_secret
```

# Run server
```
npx nodemon server.js
```

---

# Deployment

Supported platforms:

- Render
- Railway
- AWS EC2
- VPS

---

# Security

- JWT Authentication
- Role-based authorization
- Protected routes
- Secure API structure

---

# Author

Soumya Panda  
Full Stack Developer  

GitHub: https://github.com/RuthlessG-CYBER

