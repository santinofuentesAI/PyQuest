FROM python:3.11-slim

# Isolated execution image with the data-science stack preinstalled.
RUN pip install --no-cache-dir numpy pandas matplotlib seaborn scikit-learn fastapi uvicorn pydantic \
    && useradd --create-home --uid 10001 sandbox

WORKDIR /opt/sandbox
COPY sandbox/runner.py /opt/sandbox/runner.py
USER sandbox
EXPOSE 8001
CMD ["uvicorn", "runner:app", "--host", "0.0.0.0", "--port", "8001"]
