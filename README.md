# QNext Admin

A modern admin dashboard application built with React, Vite, and SCSS. Features a responsive interface with data visualization using Recharts.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher recommended)
- **npm** or **yarn** package manager
- **Git** for version control

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd qnext-admin
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including React, Vite, and SCSS tools.

### 3. Run the Development Server

```bash
npm run start
```

This command runs both the SCSS watcher and Vite dev server concurrently. The application will be available at:
- **Local**: http://localhost:5173

The page will automatically reload when you make changes.

## Authentication

This application includes a complete JWT-based authentication system with the following features:

- ✅ **Login/Logout** functionality
- ✅ **Protected routes** - Must be logged in to access the dashboard
- ✅ **JWT token management** with automatic refresh
- ✅ **Persistent sessions** using localStorage
- ✅ **API-ready** with axios interceptors

### Mock Login (Development Mode)

For development, the app uses mock authentication. Enter **any email and password** to log in:

```
Email: admin@example.com
Password: demo123
```

### Connecting to Your Backend

1. Copy `.env.example` to `.env`
2. Update `VITE_API_URL` with your backend API URL
3. Replace mock API calls in `src/services/api.js` with real endpoints

📖 See **[AUTHENTICATION.md](AUTHENTICATION.md)** for complete setup guide and API integration instructions.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Runs SCSS watcher and dev server together (recommended) |
| `npm run dev` | Starts the Vite dev server only |
| `npm run build` | Creates production build in `dist/` folder |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Runs ESLint to check code quality |
| `npm run watch:scss` | Watches and compiles SCSS files to CSS |

## Project Structure

```
qnext-admin/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Body.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Header.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   └── Requests.jsx
│   ├── context/         # React Context providers
│   │   └── AuthContext.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── utils/           # Utility functions
│   │   └── auth.js
│   ├── styles/          # Component-specific styles
│   │   ├── Body.scss
│   │   ├── Header.scss
│   │   ├── Login.scss
│   │   └── Requests.scss
│   ├── assets/          # Images, fonts, etc.
│   ├── App.jsx          # Main App component
│   ├── App.scss         # Global app styles
│   ├── main.jsx         # Application entry point
│   └── index.scss       # Global styles
├── .env.example         # Environment variables template
├── AUTHENTICATION.md    # Auth setup guide
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── eslint.config.js     # ESLint configuration
└── package.json         # Project dependencies

```

## Technologies Used

- **React 18.2** - UI library
- **Vite 7.3** - Build tool and dev server
- **Axios** - HTTP client for API requests
- **SCSS/Sass** - CSS preprocessor for styling
- **Recharts 3.7** - Data visualization library
- **React Icons 5.5** - Icon library
- **ESLint** - Code linting and quality

## Building for Production

```bash
npm run build
```

The optimized production files will be generated in the `dist/` folder. You can preview the production build with:

```bash
npm run preview
```

## Git Workflow

### Working on Features

1. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. **Push to GitHub**:
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub to merge into `main`

### Branch Naming Conventions

- `feature/` - New features (e.g., `feature/add-user-auth`)
- `fix/` - Bug fixes (e.g., `fix/header-alignment`)
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

## Troubleshooting

### SCSS not compiling
Ensure you're using `npm start` instead of `npm run dev` to run both the SCSS watcher and dev server.

### Port already in use
If port 5173 is already in use, Vite will automatically try the next available port. Check the terminal output for the actual URL.

### Module not found errors
Try deleting `node_modules/` and `package-lock.json`, then run `npm install` again.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a Pull Request with a clear description of changes

## License

Private project - All rights reserved.
