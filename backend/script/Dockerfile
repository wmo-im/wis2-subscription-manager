FROM python:3.8
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["pyinstaller", "--onefile", "--paths=/usr/local/lib/python3.8/site-packages", "subscribe-backend.py"]