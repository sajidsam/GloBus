# 🛒 GloBus - Full-Stack E-Commerce Platform

![GloBus Homepage](./Globus_FrontEnd/src/assets/globusHOME.png)

GloBus is a modern, feature-rich, and scalable e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It offers a seamless shopping experience for users with a clean UI, secure payments, and a powerful admin dashboard for store management.

## Features

### For Users

- **Browse & Search Products**: Categorized product browsing (Top Deals, New Arrivals, Food, Electronics, etc.).
- **Dark & Light Mode**: Seamlessly toggle between themes with persistent user preference using Tailwind CSS v4 and Context API.
- **Multi-language Support**: Fully localized interface using `i18next`.
- **Shopping Cart & Checkout**: Interactive cart management and seamless checkout process.
- **Secure Payments**: Integrated with **SSLCommerz** for secure online transactions in Bangladesh.
- **Authentication**: Secure user signup, login, and profile management with email/password (Bcrypt & Nodemailer OTP reset) and Google OAuth with Firebase ID Token (JWT) verification on the backend.
- **AI Customer Support**: Intelligent customer support chatbot powered by Google's Gemini AI, supporting Bengali and Banglish queries.
- **Newsletter Subscription**: Keep up with the latest deals and offers.

### For Admins

- **Product Management**: Full CRUD operations for products (Add, Update, Delete).
- **Order Management**: View all orders, update statuses, and analyze order statistics.
- **User Management**: View user lists, toggle active status, or delete users.

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4
- **State/Routing**: React Router DOM
- **Internationalization**: i18next, react-i18next
- **HTTP Client**: Axios
- **BaaS/Auth**: Firebase

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Native Driver)
- **Payment Gateway**: SSLCommerz (`sslcommerz-lts`)
- **AI Integration**: Google GenAI for chatbot capabilities
- **Other Utilities**: Multer (File Uploads), Bcrypt (Password Hashing), Nodemailer (Email & OTP verification), Firebase ID Token (JWT) Verification, CORS, Dotenv

# Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Connection URI
- Firebase Project setup
- SSLCommerz Sandbox/Live Store ID & Password
- Gemini API Key (for Chatbot)
- Docker & Docker Compose (optional, for containerized setup)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/GloBus.git
   cd GloBus
   ```

2. **Environment Variables Setup:**

   Create a `.env` file in the `Globus_Backend` directory:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

   Create a `.env.local` file in the `Globus_FrontEnd` directory:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_API_URL=http://localhost:5000
   ```

3. **Install Dependencies:**
   From the root folder (`GloBus`), run the following command to install dependencies for both the frontend and backend simultaneously:

   ```bash
   npm run install:all
   ```

4. **Run the Application:**
   Start both the frontend and backend concurrently from the root folder:

   ```bash
   npm run dev
   ```

### Running with Docker

Alternatively, you can run the entire application using Docker:

```bash
docker-compose up --build
```
This will start both the frontend (http://localhost:5173) and backend (http://localhost:5000) services concurrently.

# Project Structure

```text
GloBus/
├── docker-compose.yml  # Docker configuration for easy deployment
├── Globus Latex/       # LaTeX source files for project documentation and reports
├── package.json        # Root package to run concurrently
├── Globus_FrontEnd/    # React/Vite Frontend
│   ├── src/            # Components, Pages, Assets
│   ├── package.json    # Frontend dependencies
│   └── vite.config.js  # Vite configuration
│
└── Globus_Backend/     # Node.js/Express Backend
    ├── Controllers/    # Business logic (User, Product, Order, Payment)
    ├── middleware/     # Auth & token validation middlewares
    ├── utils/          # Helper services (Firebase Auth, Email, Cache)
    ├── server.js       # Entry point & Routes
    └── package.json    # Backend dependencies
```

## License

This project is licensed under a custom **Educational and Personal Use License**. 
It is intended for learning and educational purposes only. **Professional and commercial use is strictly prohibited** without obtaining a separate commercial license from the author. See the [LICENSE](./LICENSE) file for more details.
