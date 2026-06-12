# Menggunakan image Python resmi yang ringan
FROM python:3.9-slim

# Install dependencies sistem yang mungkin dibutuhkan
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set direktori kerja
WORKDIR /code

# Copy file requirements
COPY requirements.txt .

# Install library Python
RUN pip install --no-cache-dir -r requirements.txt

# Hugging Face Spaces merekomendasikan penggunaan non-root user
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy seluruh file project ke dalam container dengan hak akses user
COPY --chown=user . $HOME/app

# Expose port standar Hugging Face
EXPOSE 7860

# Jalankan server FastAPI menggunakan uvicorn di port 7860
CMD ["uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "7860"]
