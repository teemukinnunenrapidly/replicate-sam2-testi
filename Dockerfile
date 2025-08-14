FROM python:3.11-slim

# Aseta työhakemisto
WORKDIR /app

# Kopioi tarvittavat tiedostot
COPY . .

# Aseta oikeudet
RUN chmod +x *.sh

# Avaa portti
EXPOSE 8001

# Käynnistyskomento
CMD ["python3", "server.py"]
