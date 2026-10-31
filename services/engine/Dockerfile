FROM python:3.12-slim

WORKDIR /app

COPY services/engine/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY services/engine ./services/engine

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "services.engine.main:app", "--host", "0.0.0.0", "--port", "8000"]

