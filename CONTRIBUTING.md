# Contributing to FORGED

Thank you for your interest in contributing to FORGED! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great together.

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker (optional)
- Google Cloud account (for full functionality)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Jeremiah-Sakuda/Kifani.git
cd Kifani

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Frontend setup
cd ../frontend
npm install
```

### Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm run test

# Type checking
cd backend && mypy app/ --ignore-missing-imports
cd frontend && npm run typecheck

# Linting
cd backend && ruff check app/ tests/
cd frontend && npm run lint
```

### Running Locally

```bash
# Backend (with mock responses, no GCP required)
cd backend
DEV_MODE=true uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
VITE_API_URL=http://localhost:8000/api npm run dev
```

## Development Guidelines

### Code Style

**Python (Backend)**
- Follow PEP 8
- Use type hints for all functions
- Use Ruff for linting
- Use MyPy for type checking

**TypeScript (Frontend)**
- Use strict TypeScript
- Follow ESLint configuration
- Use functional components with hooks
- Prefer named exports

### Commit Messages

Use clear, descriptive commit messages:

```
Add archetype clustering algorithm

Implement K-means clustering for matching users to archetypes.
Uses normalized Euclidean distance with Paralympic sample weighting.
```

### Branch Naming

- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation updates
- `refactor/description` — Code refactoring

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── models/           # Pydantic models
│   │   ├── routers/          # API endpoints
│   │   ├── services/         # Business logic
│   │   └── tools/            # ADK tool implementations
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API client
│   │   └── types/            # TypeScript types
│   └── tests/
└── docs/
```

## Adding New Features

### Adding a New Archetype

1. Add archetype data to `backend/app/models/archetypes.py`
2. Update clustering centroids if needed
3. Add sport alignments (both Olympic and Paralympic)
4. Update frontend archetype display

### Adding a New ADK Tool

1. Create tool in `backend/app/tools/`
2. Register in `backend/app/services/adk_agent.py`
3. Update system prompt if needed
4. Add tests

### Adding a New Component

1. Create component in `frontend/src/components/`
2. Add TypeScript types
3. Add unit tests
4. Update imports

## Data Compliance

**IMPORTANT:** This project is for a hackathon with strict data rules.

### Permitted
- Medal placement data (1st, 2nd, 3rd)
- Public athlete statistics (height, weight, sport, year)
- Public Team USA/IPC data

### Prohibited
- Finish times or specific scores
- Individual athlete names, images, or likenesses
- IOC intellectual property (Olympic rings, torch)
- International athlete data (US only)

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### PR Checklist

- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Documentation updated (if needed)
- [ ] No prohibited data included
- [ ] Commit messages are clear

## Questions?

Open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.
