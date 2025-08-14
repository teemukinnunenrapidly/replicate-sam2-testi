# 🚀 Kaikki käynnistystavat

## 🥇 Yksinkertaisin tapa (suositeltu)

```bash
./quick-start.sh
```

**Mitä tapahtuu:**
1. Käynnistää palvelimen
2. Avautaa selain automaattisesti
3. Näyttää kaikki tiedot

---

## 🛠️ Shell-skriptit

### Peruskomennot
```bash
./test.sh start      # Käynnistä palvelin
./test.sh stop       # Pysäytä palvelin
./test.sh status     # Näytä tila
./test.sh open       # Avaa selain
./test.sh restart    # Käynnistä uudelleen
```

### Nopea käynnistys
```bash
./quick-start.sh     # Käynnistä + avaa selain
```

---

## 🔨 Make-komennot

### Taustaprosessi
```bash
make start-bg        # Käynnistä taustalla
make stop            # Pysäytä
make clean           # Puhdista
```

### Etualalla
```bash
make start           # Käynnistä etualalla (näet lokit)
```

---

## 📦 NPM-komennot

### Perustoiminnot
```bash
npm run start        # Käynnistä etualalla
npm run start-bg     # Käynnistä taustalla
npm run stop         # Pysäytä
npm run open         # Avaa selain
```

### Lisätoiminnot
```bash
npm run status       # Näytä tila
npm run test         # Testaa yhteys
npm run clean        # Puhdista
```

---

## 🐳 Docker

### Docker Compose (suositeltu)
```bash
docker-compose up -d     # Käynnistä taustalla
docker-compose down      # Pysäytä
docker-compose logs      # Näytä lokit
```

### Suora Docker
```bash
docker build -t replicate-testi .
docker run -d -p 8001:8001 replicate-testi
```

---

## 📱 Testaus

### 1. Käynnistys
Valitse yksi yllä olevista tavoista

### 2. Selaimen avaus
- **Automaattinen**: `./quick-start.sh`
- **Manuaalinen**: `./test.sh open`
- **Suoraan**: http://localhost:8001

### 3. Workflow-testaus
Testaa replicate-testi sivulla

### 4. Pysäytys
```bash
./test.sh stop        # Shell-skripti
make stop             # Make
npm run stop          # NPM
docker-compose down   # Docker
```

---

## 🎯 Kunkin tavan edut

| Tapa | Edut | Käyttötarkoitus |
|------|-------|-----------------|
| `./quick-start.sh` | 🚀 Nopein, automaattinen | Päivittäinen testaus |
| `./test.sh` | 🛠️ Täydellinen hallinta | Kehitystyö |
| `make` | 🔨 Unix-standardit | CI/CD, automaatio |
| `npm` | 📦 Node.js-ekosysteemi | Web-kehitys |
| `docker` | 🐳 Yhdenmukaisuus | Tiimi, tuotanto |

---

## 💡 Vinkkejä

- **Ensimmäinen kerta**: Käytä `./quick-start.sh`
- **Kehitystyö**: Käytä `./test.sh start` (näet lokit)
- **Taustaprosessi**: Käytä `make start-bg` tai `npm run start-bg`
- **Tiimi**: Käytä Docker-tiedostoja
- **Automaatio**: Käytä Make-komentoja

---

## 🚨 Ongelmatilanteet

### Portti on käytössä
```bash
./test.sh stop        # Pysäytä vanha
./quick-start.sh      # Käynnistä uusi
```

### Ei oikeuksia
```bash
chmod +x *.sh         # Tee suoritettaviksi
```

### Python puuttuu
```bash
brew install python3  # macOS
```

### Docker puuttuu
```bash
brew install docker   # macOS
```
