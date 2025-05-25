FROM python:3.11-slim AS base

# Set environment variables
ENV POETRY_VERSION=2.1.3 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv"

ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

# Builder stage for dependencies
FROM base AS builder

RUN --mount=type=cache,target=/root/.cache \
    pip install "poetry==$POETRY_VERSION"

WORKDIR $PYSETUP_PATH

# Copy only dependency files first for better caching
COPY poetry.lock pyproject.toml ./
COPY README.md ./

# Copy the source code
COPY src/ ./src/

# Install dependencies and the project itself
RUN --mount=type=cache,target=$POETRY_HOME/pypoetry/cache \
    poetry install --only main

# Final production stage
FROM base AS production

# Copy virtual environment and installed package from builder
COPY --from=builder $VENV_PATH $VENV_PATH
COPY --from=builder $PYSETUP_PATH/src/learn_kube /app/learn_kube

# Copy static and templates directories
COPY static/ /app/static/
COPY templates/ /app/templates/

WORKDIR /app

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["uvicorn", "learn_kube.main:app", "--host", "0.0.0.0", "--port", "8080"] 
