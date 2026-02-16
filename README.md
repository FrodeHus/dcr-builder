# DCR Builder

A web-based tool for generating **Azure Data Collection Rules (DCRs)** from JSON schemas.

## About

DCR Builder simplifies the creation of Data Collection Rules for Azure Monitor. Instead of manually writing JSON configurations, you can:

- **Paste or upload** JSON data samples
- **Specify an API endpoint** that returns JSON
- **Automatically generate** valid DCR configurations with proper schema mappings
- **Deploy directly** to Azure using CLI, PowerShell, or ARM templates

The application intelligently analyzes your JSON structure and infers appropriate column types (string, int, long, real, boolean, dynamic, datetime) for your DCR stream declarations.

**Perfect for:**

- Azure Monitor administrators managing custom log ingestion
- DevOps teams automating DCR deployment
- Organizations standardizing data collection pipelines

---

## Quick Start

### Local Development (Node.js)

**Prerequisites:** Node.js 22+ and npm 10+

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start at `http://localhost:3000`

**Available scripts:**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests (Vitest)
npm run lint         # Run ESLint
npm run check        # Format & lint fixes
```

### Docker Deployment

**Prerequisites:** Docker and Docker Compose installed

**Development (local direct access):**

```bash
cp .env.example .env.docker
docker-compose up -d
```

Access at `http://localhost:3000`

**Production (with Traefik & HTTPS):**

```bash
cp .env.example .env.docker
# Edit .env.docker and set:
#   NODE_ENV=production
#   APP_HOST=your-domain.com
#   TRAEFIK_ENABLED=true
#   LETSENCRYPT_EMAIL=your-email@your-domain.com
docker-compose --profile prod up -d
```

Access at `https://your-domain.com` with automatic HTTPS via Let's Encrypt.

For more Docker options and production configuration, see the [Docker Deployment](#docker-deployment-detailed) section below.

---

## How to Use

### Step 1: Input JSON Data

The application supports two ways to provide JSON input:

1. **Paste JSON directly** - Copy your JSON sample and paste it in the "Source JSON" pane
2. **Fetch from API** - Provide an API endpoint URL (optionally with custom headers) to retrieve JSON data

JSON can be a single object or an array of objects. The application automatically infers column types.

**Supported types:** string, int, long, real, boolean, dynamic, datetime (ISO 8601 dates auto-detected)

### Step 2: Configure DCR Properties

In the **Form** tab, configure:

- **Basics** - Rule name, location, and description
- **Stream Declaration** - Define the schema with auto-inferred columns, customize names and types as needed
- **Destinations** - Specify Log Analytics workspace resource ID and destination name
- **Data Flows** - Map input streams to destinations with optional KQL transformations
- **Validation** - Check for configuration errors before generation

### Step 3: Generate DCR JSON

Click **Apply** to generate the DCR configuration JSON. The application validates all required fields and shows any errors.

### Step 4: Review & Deploy

Switch to the **JSON** tab to:

- Review the generated DCR configuration
- Copy to clipboard for manual deployment
- Download as a file (named after your rule)
- Switch between JSON, ARM template, and Bicep output formats
- Generate a shareable URL for the configuration
- View deployment instructions for Azure CLI, PowerShell, or ARM templates

---

## Features

- **Auto-detect JSON schema** - Intelligent type inference from JSON samples
- **Form-based editor** - Guided wizard with contextual tooltips for every field
- **Live validation** - Real-time error checking and feedback
- **Multiple input methods** - Paste JSON or fetch from API with custom headers
- **Multiple output formats** - Export as JSON, ARM template, or Bicep
- **TimeGenerated auto-management** - Automatically appends `| extend TimeGenerated=now()` when needed
- **Deployment helpers** - Built-in instructions for Azure CLI, PowerShell, and ARM deployment
- **Dark/Light mode** - Toggle theme for comfortable viewing
- **Responsive design** - Works on desktop, tablet, and mobile

---

## Docker Deployment (Detailed)

This application includes a consolidated Docker setup for both development and production deployments.

### Environment Configuration

All configuration is managed through a single `.env.docker` file based on [.env.example](.env.example):

```bash
cp .env.example .env.docker
```

Edit `.env.docker` to customize for your environment. Key variables:

- `NODE_ENV` - development/production
- `APP_PORT_HOST` - Port binding (3000 for dev, 127.0.0.1 for prod)
- `APP_HOST` - Hostname for routing (localhost for dev, your-domain.com for prod)
- `TRAEFIK_ENABLED` - Enable/disable reverse proxy (false for dev, true for prod)
- `LETSENCRYPT_EMAIL` - Email for Let's Encrypt certificate (production only)
- `RESOURCES_CPU_LIMIT/MEMORY_LIMIT` - Resource constraints
- `LOG_MAX_FILE` - Number of log files to retain

See [.env.example](.env.example) for all available options and detailed documentation.

### Architecture

The `docker-compose.yml` uses Docker Compose profiles to manage environment-specific services:

- **Always running:** `app` service (Node.js application)
- **Production only (profile: prod):** `traefik` service (reverse proxy with automatic HTTPS)

### Production Deployment

For production behind Traefik:

1. Copy `.env.example` to `.env.docker` and edit the following values:
   - `NODE_ENV=production`
   - `APP_PORT_HOST=127.0.0.1` (internal only)
   - `APP_HOST=your-domain.com`
   - `TRAEFIK_ENABLED=true`
   - `LETSENCRYPT_EMAIL=your-email@your-domain.com`
2. Ensure DNS points your domain to the server
3. Run: `docker-compose --profile prod up -d`

Traefik will automatically:

- Issue and manage SSL certificates via Let's Encrypt
- Redirect HTTP → HTTPS
- Apply security headers (HSTS, CSP, etc.)
- Route requests to the application

### Security Features

- Non-root container execution (UID 1001)
- Read-only filesystem with tmpfs for temporary data
- Dropped Linux capabilities
- Resource limits prevent DoS attacks
- Security headers configured in Traefik
- HTTPS with automatic certificate renewal

For more details, see [DOCKER.md](DOCKER.md) and [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md).

---

## Development

### Building for Production

To build the application for production:

```bash
npm run build
```

The build output will be in the `.output` directory.

### Testing

This project uses [Vitest](https://vitest.dev/) for testing:

```bash
npm run test
```

### Linting & Formatting

This project uses [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/):

```bash
npm run lint          # Check for linting errors
npm run format        # Check formatting
npm run check         # Fix both linting and formatting issues
```

---

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (SSR with React 19)
- **Routing:** [TanStack Router](https://tanstack.com/router) (file-based)
- **Forms:** [TanStack Form](https://tanstack.com/form)
- **Tables:** [TanStack Table](https://tanstack.com/table)
- **State Management:** React Context + useReducer
- **UI Components:** [Shadcn](https://ui.shadcn.com/) (based on Radix UI)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4
- **Validation:** [Zod](https://zod.dev/) v4
- **Language:** TypeScript

### Styling

Tailwind CSS v4 with CSS-first configuration — all design tokens are in `src/styles.css` using `@theme inline` blocks with `oklch` color values. Dark mode is toggled via the `.dark` class on `<html>`.

### UI Components

Shadcn components live in `src/components/ui/` and are project-owned. Add new ones with:

```bash
pnpm dlx shadcn@latest add <component-name>
```

---

## Project Structure

```
src/
├── routes/          # File-based routing (TanStack Router)
├── components/      # React components
│   ├── editor/      # DCR form editor and viewer
│   ├── source/      # JSON source input
│   ├── layout/      # Layout components
│   └── ui/          # Shadcn UI components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── types/           # TypeScript type definitions
├── data/            # Data and constants
└── store/           # State management
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and conventions.

---

## Troubleshooting

### Local Development

**Problem: Port 3000 already in use**

```bash
# Run on different port:
npm run dev -- --port 3001
```

**Problem: npm install fails**

```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem: TypeScript errors**

```bash
npm run check  # Fixes formatting and linting issues
```

### Docker Deployment

**Problem: Container exits immediately**

```bash
docker-compose logs app  # View error details
```

**Problem: Port already in use**

```bash
docker-compose down  # Stop all containers
docker ps -a        # Check for lingering containers
```

**Problem: Traefik not issuing certificates (production)**

- Ensure DNS points to the server IP
- Check `LETSENCRYPT_EMAIL` is set correctly in `.env.docker`
- Verify domain is accessible from the internet
- Check Traefik logs: `docker-compose logs traefik`

---

## System Requirements

### Local Development

- **Node.js:** 22+ (check with `node --version`)
- **npm:** 10+ (check with `npm --version`)
- **Disk space:** ~500MB for node_modules
- **RAM:** 2GB recommended
- **OS:** Windows, macOS, or Linux

### Docker Deployment

- **Docker:** 20.10+ (check with `docker --version`)
- **Docker Compose:** 2.0+ (check with `docker-compose --version`)
- **Disk space:** ~1GB for image
- **RAM:** 512MB minimum
- **Network:** Internet access for Let's Encrypt certificates (production only)

---

## Security Considerations

### Development

- Application runs on localhost only (not exposed to network)
- No sensitive data stored in browser
- Use `.env.docker` for local development only

### Production

- Application runs behind Traefik reverse proxy with HTTPS
- All communication encrypted (HTTP → HTTPS redirect)
- Container runs as non-root user (UID 1001)
- Read-only filesystem with restricted temporary directories
- Resource limits prevent DoS attacks
- Security headers automatically configured

**Important:** Never commit `.env.docker` with real values to version control. Use `.env.example` as template.

---

## Documentation

- **Docker Setup:** [DOCKER.md](DOCKER.md)
- **Docker Quick Start:** [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md)
- **Azure DCR Reference:** [Microsoft Learn - Data Collection Rules](https://learn.microsoft.com/en-us/azure/azure-monitor/data-collection/data-collection-rule-structure)

---

## License

[Add your license information here]
