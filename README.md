# ShopSphere — Premium Multi-Category E-Commerce Marketplace

[![Stack](https://img.shields.io/badge/Stack-MERN-315FEA.svg)](https://react.dev/)
[![Design](https://img.shields.io/badge/Palette-Cobalt%20%26%20Tangerine-FF8A35.svg)](https://getbootstrap.com/)
[![Docker](https://img.shields.io/badge/Containers-NO%20DOCKER%20(Pure%20Local)-16A36A.svg)](#non-containerized-development-no-docker)
[![License](https://img.shields.io/badge/License-MIT-gray.svg)](LICENSE)

**ShopSphere** is a commercial-grade, fully responsive MERN stack e-commerce platform designed with a distinctive **Cobalt & Tangerine** brand identity (`#315FEA` & `#FF8A35`). It features complete customer storefront capabilities, verified customer reviews, dynamic shopping cart & wishlist, multi-step checkout with **Razorpay** test mode and **Cash on Delivery**, order tracking timeline, and an **Administrator Management Console** with real-time **Recharts** sales analytics.

---

## Table of Contents
- [Brand Identity & UI/UX](#brand-identity--uiux)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Non-Containerized Development (NO DOCKER)](#non-containerized-development-no-docker)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Step-by-Step Installation](#step-by-step-installation)
- [Database Setup (MongoDB Atlas & Local)](#database-setup-mongodb-atlas--local)
- [Environment Configuration](#environment-configuration)
- [Database Seeding & Test Credentials](#database-seeding--test-credentials)
- [Running the Application](#running-the-application)
- [Key Features](#key-features)
- [REST API Reference](#rest-api-reference)
- [Production Deployment Guide (Zero-Docker)](#production-deployment-guide-zero-docker)

---

## Brand Identity & UI/UX

- **Primary Cobalt Blue (`#315FEA`)**: Primary actions, badges, links, active states.
- **Secondary Tangerine Orange (`#FF8A35`)**: Promotional tags, countdown highlights, rating stars, flash deals.
- **Light Theme Surface**: `#FFFFFF` & `#EDF3FF`
- **Dark Theme Surface**: Deep navy surfaces (`#151C32` & `#1E2746`)
- **Theme Engine**: Centralized CSS custom property system (`data-theme="light"` / `data-theme="dark"`) with system preference detection (`prefers-color-scheme`) and persistent `localStorage` synchronization.
- **Responsive Viewports**: Thoroughly optimized across 320px, 375px, 576px, 768px, 1024px, 1280px, and 1440px+.

---

## Architecture & Tech Stack

### Frontend Client
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6 (declarative public, protected, and admin routes)
- **Styling**: Bootstrap 5 + CSS Custom Variable Design Token Engine
- **State Management**: React Context API (`AuthContext`, `ThemeContext`, `CartContext`, `WishlistContext`, `NotificationContext`)
- **API Client**: Axios instance with automatic JWT Bearer injection & 401 handling
- **Visualizations**: Recharts (Monthly Revenue AreaChart, Order Velocity BarChart, Category DonutChart)
- **Icons**: Lucide React

### Backend Server
- **Runtime**: Node.js (LTS) & Express.js RESTful API
- **Database**: MongoDB with Mongoose 8 ODM
- **Security**: JWT, bcryptjs password hashing, Helmet, Express-Rate-Limit, CORS
- **Media Storage**: Cloudinary with automatic local disk storage fallback (`server/uploads/`)
- **Payments**: Razorpay Node SDK (Test Mode) + simulated fallback for zero-credential local runs
- **Architecture**: Strict MVC with separate routes, controllers, middleware, and services

---

## Non-Containerized Development (NO DOCKER)

Strict development rules are enforced for this project:
- **No Docker**: No Dockerfiles, `docker-compose.yml`, or container engines are used.
- **Pure Local Execution**: Both client and server run natively using standard `npm` commands directly on your local operating system.
- **Database**: Connects directly via standard MongoDB connection strings to either **MongoDB Atlas** (cloud cluster) or local **MongoDB Community Server**.

---

## Folder Structure

```
shopsphere/
├── client/                     # Frontend React (Vite SPA)
│   ├── public/                 # Static assets & SVG Favicon
│   ├── src/
│   │   ├── assets/             # Brand logos & imagery
│   │   ├── components/
│   │   │   ├── common/         # ThemeToggle, RatingStars, Badge, Modal, Pagination, Breadcrumbs
│   │   │   ├── layout/         # Navbar, MobileNav, AnnouncementBar, Footer, AdminLayout, AdminSidebar
│   │   │   ├── products/       # ProductCard, ProductGrid, ProductFilters, ImageGallery, ReviewSection
│   │   │   ├── cart/           # CartItemRow, OrderSummaryCard, CouponWidget
│   │   │   └── admin/          # StatCard, RevenueChart, OrdersChart, CategoryPieChart
│   │   ├── context/            # AuthContext, ThemeContext, CartContext, WishlistContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── storefront/     # HomePage, ShopPage, ProductDetailPage, CartPage, WishlistPage
│   │   │   ├── checkout/       # CheckoutPage, OrderSuccessPage, OrderTrackingPage
│   │   │   ├── account/        # ProfilePage, OrdersPage, AddressesPage
│   │   │   ├── auth/           # LoginPage, RegisterPage, PasswordPages
│   │   │   └── admin/          # AdminDashboard, Products, Categories, Orders, Customers, Coupons, Reviews
│   │   ├── services/           # Centralized Axios API services
│   │   ├── styles/             # theme.css, bootstrap-custom.css, index.css
│   │   ├── App.jsx             # Top-level Router & Provider Tree
│   │   └── main.jsx            # Entry point
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Node.js / Express API
│   ├── config/                 # db.js, cloudinary.js, razorpay.js
│   ├── controllers/            # MVC Controllers (auth, product, cart, order, admin, etc.)
│   ├── middleware/             # authMiddleware, errorMiddleware, uploadMiddleware, rateLimitMiddleware
│   ├── models/                 # 10 Mongoose schemas (User, Product, Order, Category, etc.)
│   ├── routes/                 # Express REST route endpoints
│   ├── uploads/                # Local media fallback storage
│   ├── app.js                  # Express application setup
│   ├── server.js               # Server listener & DB initializer
│   ├── seed.js                 # 28-product database seeding engine
│   ├── .env.example
│   └── package.json
│
├── package.json                # Root workspace orchestration script
├── .gitignore
└── README.md
```

---

## Prerequisites

Ensure you have the following installed directly on your machine:
1. **Node.js**: Version 18.x or 20.x LTS ([Download Node.js](https://nodejs.org/))
2. **npm**: Version 9.x or 10.x (packaged with Node.js)
3. **MongoDB**:
   - **Recommended**: Free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database)
   - *OR* local [MongoDB Community Server](https://www.mongodb.com/try/download/community)

---

## Step-by-Step Installation

### 1. Install Dependencies
You can install dependencies for root, server, and client in one command from the project root:

```bash
# From the project root
npm run install:all
```

Or install individually:
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

---

## Database Setup (MongoDB Atlas & Local)

### Option A: MongoDB Atlas (Recommended Cloud Setup)
1. Sign up or log into [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2. Create a **Free Shared Cluster (M0)**.
3. Under **Security > Database Access**:
   - Click **Add New Database User**.
   - Create a user (e.g., `shopsphere_admin`) with a secure password and `Read and write to any database` privileges.
4. Under **Security > Network Access**:
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) for dev flexibility.
5. In your cluster dashboard, click **Connect > Drivers > Node.js**.
6. Copy the connection string and configure `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/shopsphere?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB Community Server
If you have MongoDB installed locally as a Windows service:
```env
MONGODB_URI=mongodb://localhost:27017/shopsphere
```

---

## Environment Configuration

### Server Configuration (`server/.env`)
Copy `server/.env.example` to `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/shopsphere?retryWrites=true&w=majority
JWT_SECRET=shopsphere_ultra_secure_jwt_secret_key_2026_change_in_production
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173

# Razorpay Test Credentials (Leave placeholder for simulated checkout mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Cloudinary (Optional - auto falls back to server/uploads/ directory)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Client Configuration (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

---

## Database Seeding & Test Credentials

Populate the database with **6 categories**, **28 realistic products** with high-resolution imagery, preconfigured customer accounts, and active coupon codes:

```bash
# Run from server directory
cd server
npm run seed
```

### Preconfigured Test Accounts
| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@shopsphere.com` | `Admin@12345` |
| **Customer 1** | `customer@example.com` | `Customer@12345` |
| **Customer 2** | `sarah.j@example.com` | `Sarah@12345` |

*(Note: The login page includes 1-click **Demo Autofill** buttons for instant testing).*

### Preconfigured Active Coupons
| Code | Discount Type | Criteria |
| :--- | :--- | :--- |
| `WELCOME10` | 10% Off | Minimum order: $50 |
| `FLAT50` | $50 Flat Discount | Minimum order: $200 |
| `SPHERE25` | 25% Off | Maximum cap: $75 |

---

## Running the Application

### Option A: Concurrent Dev Mode (Root)
From the root directory, launch both server (`:5000`) and client (`:5173`) in one terminal:
```bash
npm run dev
```

### Option B: Separate Terminals

**Terminal 1 — Backend Server:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 — Frontend Client:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## Key Features

1. **Brand Identity & Theming**:
   - Cobalt `#315FEA` & Tangerine `#FF8A35` design system.
   - Smooth light & dark mode toggle with system preference detection and localStorage persistence.
2. **Customer Storefront**:
   - Announcement bar & responsive navigation with live search, category megamenu, cart counter, and wishlist heart indicator.
   - Homepage with hero carousel, featured categories, Deal of the Day countdown timer, trending rail, best sellers, and new arrivals.
   - Catalogue with multi-faceted sidebar filters (categories, price range, rating, in-stock switch), dynamic sorting, and active filter chips.
   - Product details page with multi-angle image gallery, stock badge, quantity stepper, specs table, verified buyer reviews, and related products rail.
3. **Cart & Wishlist**:
   - Server-side inventory bounds checking and atomic price recalculation. Client prices are never trusted.
   - Promotional coupon engine with instant savings breakdown.
   - One-click "Move to Cart" from Wishlist.
4. **Checkout & Payments**:
   - Saved address selector with inline address creation.
   - **Cash on Delivery** and **Razorpay Test Mode** payment gateway with cryptographic HMAC SHA256 signature verification.
   - Simulated test checkout fallback for immediate local testing without Razorpay keys.
   - Interactive 6-stage order tracking pipeline (`Pending` ➔ `Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`) and printable receipts.
5. **Admin Console**:
   - **Analytics Dashboard**: Revenue AreaChart, Order Velocity BarChart, Category Sales DonutChart using real MongoDB aggregations.
   - **Product Manager**: Full CRUD, stock level tracking, multi-image management, specifications builder.
   - **Category Manager**: Tree hierarchy and visual banner updates.
   - **Order Fulfillment**: Status update workflow with audit tracking notes.
   - **Customer Directory**: Customer lifetime spend metrics and account suspension controls.
   - **Promotion Manager**: Coupon code generator and usage limits.
   - **Review Moderation**: Approve or delete customer product reviews.

---

## REST API Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register customer | Public |
| `POST` | `/api/auth/login` | Authenticate & get JWT | Public |
| `GET` | `/api/auth/me` | Current session user | Private |
| `GET` | `/api/products` | Search, filter, paginate products | Public |
| `GET` | `/api/products/:identifier` | Get product details by slug or ID | Public |
| `GET` | `/api/categories` | Get category hierarchy | Public |
| `GET` | `/api/cart` | Get hydrated cart with pricing | Private |
| `POST` | `/api/cart/items` | Add item to cart | Private |
| `POST` | `/api/cart/coupon` | Apply coupon code | Private |
| `GET` | `/api/wishlist` | Get user saved items | Private |
| `POST` | `/api/orders` | Create order from cart | Private |
| `POST` | `/api/payments/razorpay/create-order` | Generate Razorpay order ID | Private |
| `POST` | `/api/payments/razorpay/verify` | Verify payment signature | Private |
| `GET` | `/api/orders/my-orders` | User order history | Private |
| `GET` | `/api/admin/dashboard` | Aggregated analytics & charts | Admin |
| `POST` | `/api/admin/products` | Create product (with images) | Admin |
| `PUT` | `/api/admin/orders/:id/status` | Update fulfillment status | Admin |

---

## Production Deployment Guide (Zero-Docker)

Deploy ShopSphere cleanly to standard cloud providers without any containers:

### 1. Database — MongoDB Atlas
- Retain your MongoDB Atlas connection string configured in Step 5.

### 2. Backend — Render (Web Service)
1. Push your repository to GitHub.
2. Log into [Render](https://render.com) and create a **New Web Service**.
3. Select your repository.
4. Set:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `<Your MongoDB Atlas URI>`
   - `JWT_SECRET` = `<Your 32+ char secret>`
   - `CLIENT_URL` = `<Your Vercel/Netlify URL>`
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`

### 3. Frontend — Vercel or Netlify
1. Create a new project on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Under **Environment Variables**, add:
   - `VITE_API_URL` = `<Your Render Backend URL>/api`
   - `VITE_RAZORPAY_KEY_ID` = `<Your Razorpay Test Key>`
4. For single-page routing on Netlify/Vercel, standard rewrite rules redirect `/*` to `/index.html`.
