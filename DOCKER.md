# 🐳 Docker-tuki

## Nopea käynnistys Dockerilla

```bash
# Rakenna ja käynnistä
docker-compose up -d

# Avaa selain
open http://localhost:8001

# Pysäytä
docker-compose down
```

## Yksityiskohtaiset ohjeet

### 1. Rakenna Docker-image
```bash
docker build -t replicate-testi .
```

### 2. Käynnistä kontti
```bash
docker run -d -p 8001:8001 --name replicate-testi replicate-testi
```

### 3. Tarkista tila
```bash
docker ps
docker logs replicate-testi
```

### 4. Pysäytä kontti
```bash
docker stop replicate-testi
docker rm replicate-testi
```

## Docker Compose (suositeltu)

### Käynnistys
```bash
docker-compose up -d
```

### Tila
```bash
docker-compose ps
docker-compose logs
```

### Pysäytys
```bash
docker-compose down
```

### Uudelleenkäynnistys
```bash
docker-compose restart
```

## 🎯 Dockerin edut

✅ Yhdenmukainen ympäristö  
✅ Helppo jakaminen tiimin kanssa  
✅ Ei riippuvuuksia paikallisesta Pythonista  
✅ Isoloidut resurssit  
✅ Helppo siirtää eri koneille  

## 🚨 Huomioitavaa

- Docker on asennettava ensin
- Portti 8001 pitää olla vapaa
- Volume-mountit mahdollistavat kehitystyön
- Healthcheck varmistaa palvelun toiminnan
