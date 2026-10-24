FROM ghcr.io/astral-sh/uv:python3.13-trixie-slim AS builder

# Use the system Python across both stages (don't download uv-managed Python)
ENV UV_PYTHON_DOWNLOADS=0

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies into .venv
RUN uv sync --frozen --no-install-project

FROM ghcr.io/astral-sh/uv:python3.13-trixie-slim

WORKDIR /app

# Copy the venv from builder
COPY --from=builder /app/.venv /app/.venv

# Copy pyproject.toml so `uv run` can find the project
COPY pyproject.toml ./

# Copy application code
COPY . /app

# Collect static files
RUN uv run manage.py collectstatic --noinput

EXPOSE 8000

ARG GITHUB_SHA=unknown
ENV GIT_HASH=${GITHUB_SHA}

CMD ["uv", "run", "gunicorn", "syndicatorapi.wsgi", "--bind", "0.0.0.0:8000"]
