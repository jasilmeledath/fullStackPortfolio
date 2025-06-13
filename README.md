# Portfolio Application

A full-stack portfolio application built with Node.js, Express.js, MongoDB, and EJS. This application allows you to showcase your skills, projects, and blog posts while providing a contact form for potential clients or employers to reach out.

## Features

- Responsive design with modern UI
- Admin dashboard for managing portfolio content
- Blog integration with Medium
- Contact form with email notifications
- JWT-based authentication
- MongoDB database integration
- RESTful API architecture

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your_jwt_secret
MEDIUM_USERNAME=your_medium_username
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
portfolio-app/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── blogController.js
│   │   ├── contactController.js
│   │   └── portfolioController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/
│   │   ├── Message.js
│   │   ├── Portfolio.js
│   │   └── User.js
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       └── main.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── blog.js
│   │   ├── contact.js
│   │   └── portfolio.js
│   ├── utils/
│   │   ├── email.js
│   │   └── medium.js
│   ├── views/
│   │   ├── admin/
│   │   │   ├── blog.ejs
│   │   │   ├── dashboard.ejs
│   │   │   ├── messages.ejs
│   │   │   └── portfolio.ejs
│   │   ├── partials/
│   │   │   ├── footer.ejs
│   │   │   └── header.ejs
│   │   ├── error.ejs
│   │   ├── index.ejs
│   │   └── login.ejs
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot reload
- `npm run lint`: Run ESLint to check code quality
- `npm run lint:fix`: Fix ESLint issues automatically
- `npm run format`: Format code using Prettier

## API Endpoints

### Authentication
- `POST /api/auth/login`: Login user
- `POST /api/auth/logout`: Logout user

### Portfolio
- `GET /api/portfolio`: Get portfolio data
- `PUT /api/portfolio`: Update portfolio data
- `POST /api/portfolio/skills`: Add new skill
- `DELETE /api/portfolio/skills/:id`: Remove skill
- `POST /api/portfolio/projects`: Add new project
- `DELETE /api/portfolio/projects/:id`: Remove project

### Blog
- `GET /api/blog`: Get blog posts

### Contact
- `POST /api/contact`: Send contact message
- `GET /api/messages`: Get contact messages (admin only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Bootstrap for the UI components
- Font Awesome for the icons
- Medium API for blog integration 