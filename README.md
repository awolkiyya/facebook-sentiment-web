
# Mayor Sentiment Analytics — Frontend

A modern, multilingual web application for municipal Facebook analytics, public sentiment monitoring, and AI-powered insights. Built with Next.js and deployed using Docker on ASI Serv.

## Overview

The Mayor Sentiment Analytics frontend provides an interface for authorized municipal users to monitor Facebook content, explore sentiment trends, review AI-generated insights, and manage analytics workflows.

### Key Features

- **Facebook Analytics** — Explore synchronized Facebook pages, posts, and comments.
- **Sentiment Analysis** — Review sentiment classifications and analytics produced by the backend.
- **AI Insights** — Access AI-generated summaries and insights where supported by the API.
- **Multilingual Interface** — English, Afaan Oromo, and Amharic.
- **Authentication and Authorization** — Integrate with the backend authentication and permission system.
- **Responsive Dashboard** — Access analytics and administrative features across supported screen sizes.

## Technology Stack

- Next.js — React framework
- React and TypeScript
- Tailwind CSS
- Redux and TanStack Query
- next-intl — Internationalization
- Docker — Containerized deployment
- Traefik — Shared reverse proxy and HTTPS routing
- GitHub Actions — Automated deployment

Refer to `package.json` for the exact versions and dependencies used by this project.

## Requirements

For local development:

- Node.js 20 or a compatible version supported by the project dependencies
- npm
- Git

For production deployment:

- Docker Engine
- Docker Compose
- An accessible Laravel API
- A configured Traefik reverse proxy and `traefik-public` network
- Production environment variables

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/awolkiyya/facebook-sentiment-web.git
cd facebook-sentiment-web
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Configure environment variables

Create a local `.env.local` file using the project's required environment variables.

For example:

```dotenv
# Replace with the actual API base URL.
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Use the variable name expected by your application. The example above is illustrative; verify your existing API client configuration before adopting it.

**Security:** Never put private API credentials, signing keys, or server-side secrets in `NEXT_PUBLIC_*` variables. Next.js exposes these variables to browser code.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

Check `package.json` for the exact scripts configured in this repository. Common Next.js commands include:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

A script is only available if it is defined in `package.json`.

## Production Deployment

The production environment runs on ASI Serv under:

```text
/opt/asi-platform/apps/facebook-sentiment-web
```

The frontend is containerized with Docker and routed through the shared Traefik reverse proxy.

### Deployment Architecture

```text
User's Browser
      |
      | HTTPS
      v
Shared Traefik Proxy
      |
      v
Next.js Frontend Container
      |
      | API requests
      v
Laravel Backend API
```

The frontend does not publish its application port directly to the public host. Traefik handles external routing and HTTPS.

### Deploy with Docker Compose

After configuring `Dockerfile`, `compose.yaml`, and the production environment file:

```bash
docker compose -f compose.yaml config --quiet
docker compose -f compose.yaml build frontend
docker compose -f compose.yaml up -d frontend
docker compose -f compose.yaml ps
```

Inspect logs when troubleshooting:

```bash
docker compose -f compose.yaml logs --tail=100 frontend
```

### Automated Deployment

GitHub Actions deploys changes pushed to the `main` branch.

The deployment workflow:

1. Connects to ASI Serv over SSH.
2. Verifies the repository state.
3. Fetches and fast-forwards the `main` branch.
4. Validates the Docker Compose configuration.
5. Builds the production image.
6. Starts the frontend container.
7. Performs an HTTP response check.
8. Reports deployment status and relevant logs.

Required GitHub Actions secrets:

- `SSH_HOST`
- `SSH_USER`
- `SSH_PRIVATE_KEY`

Production environment files must be configured securely on the server and excluded from Git.

## Environment Configuration

Keep environment-specific configuration outside source control.

| Environment | Configuration |
|---|---|
| Local development | `.env.local` |
| Production runtime | `.env.production` |
| Public client-side configuration | `NEXT_PUBLIC_*` variables, embedded during build |

**Important:** `NEXT_PUBLIC_*` values are normally embedded into the frontend bundle during the build. Configure these values correctly when building the production image.

Do not commit production credentials or secret keys.

## Project Structure

```text
facebook-sentiment-web/
├── app/              # Next.js routes and layouts
├── components/       # Shared UI and feature components
├── configs/          # Application configuration
├── data/             # Application data and fixtures
├── hooks/             # Custom React hooks
├── i18n/              # Translation resources and configuration
├── lib/               # Shared utilities and API infrastructure
├── providers/         # React context and application providers
├── public/            # Static assets
├── services/          # API and business-service clients
├── styles/            # Global styles and design tokens
├── types/             # TypeScript types
├── utils/             # Utility functions
├── Dockerfile         # Production container build
├── compose.yaml       # Frontend deployment configuration
├── next.config.ts     # Next.js configuration
├── package.json       # Dependencies and scripts
└── package-lock.json  # Locked dependency versions
```

The directory listing is representative; use the actual repository structure as the source of truth.

## Troubleshooting

### Frontend container is not running

```bash
docker compose -f compose.yaml ps
docker compose -f compose.yaml logs --tail=100 frontend
```

### API requests fail

Verify:

- The backend API is reachable from the browser or frontend runtime as appropriate.
- The configured API base URL is correct.
- CORS and authentication settings match the frontend origin.
- Required environment variables were available at build time or runtime, depending on their use.

### Deployment fails

Check the GitHub Actions logs, SSH connectivity, Docker permissions, repository state, environment configuration, and Traefik network.

## Development Guidelines

- Use TypeScript and reusable components.
- Keep API calls in the appropriate service modules.
- Follow existing authorization and permission checks.
- Use the project's established translation conventions for English, Afaan Oromo, and Amharic.
- Keep production configuration and secrets out of source control.
- Validate production builds before merging changes into `main`.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Repository

[facebook-sentiment-web](https://github.com/awolkiyya/facebook-sentiment-web)

---

**Mayor Sentiment Analytics**  
Municipal analytics and AI-powered decision support.
