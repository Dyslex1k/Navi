FROM python:3.11-slim

# Create working directory
WORKDIR /app_api

# Copy dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire project
COPY . .

# Ensure Python can find the "app" package
ENV PYTHONPATH=/app_api

# Install pytest for unit tests
RUN pip install pytest

# Run unit tests during build
RUN pytest --disable-warnings --maxfail=1

# Run API
CMD ["uvicorn", "app.app:app", "--host", "0.0.0.0", "--port", "8000"]