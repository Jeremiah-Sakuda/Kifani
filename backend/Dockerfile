# FORGED Backend - FastAPI on Cloud Run
# ══════════════════════════════════════════════════════════════════════════════

FROM python:3.12-slim

# Cloud Run uses PORT env variable
ENV PORT=8080
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Cloud Run expects port 8080
EXPOSE 8080

# Run with uvicorn - Cloud Run sets PORT env var
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
