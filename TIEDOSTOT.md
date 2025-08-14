# 📁 Tiedostojen yleiskatsaus

## 🚀 Käynnistystiedostot

### Shell-skriptit
- **`quick-start.sh`** - Nopea käynnistys + selaimen avaus
- **`test.sh`** - Täydellinen palvelimen hallinta

### Make-tiedostot
- **`Makefile`** - Unix-standardit, CI/CD yhteensopiva

### NPM-tiedostot
- **`package.json`** - Node.js-ekosysteemi, web-kehitys

### Docker-tiedostot
- **`Dockerfile`** - Konttirakenne
- **`docker-compose.yml`** - Palvelun orkestraatio

---

## 📖 Dokumentaatio

### Ohjeet
- **`README.md`** - Yleiskatsaus ja perusohjeet
- **`STARTELE.md`** - Nopeat käynnistysohjeet
- **`KAINNISTYS.md`** - Kaikki käynnistystavat
- **`DOCKER.md`** - Docker-käyttöohjeet
- **`TIEDOSTOT.md`** - Tämä tiedosto

---

## 🌐 Web-sovellus

### Frontend
- **`index.html`** - Pääsivu
- **`style.css`** - Tyylit
- **`script.js`** - JavaScript-logiikka

### Backend
- **`server.py`** - Python HTTP-palvelin

---

## ⚙️ Konfiguraatio

### Git
- **`.gitignore`** - Git-ignorointi

### Lokit
- **`server.log`** - Palvelimen lokit (luodaan automaattisesti)

---

## 🎯 Tiedostojen tarkoitus

| Tiedosto | Tarkoitus | Käyttäjä |
|----------|-----------|----------|
| `quick-start.sh` | 🚀 Nopea käynnistys | Päivittäinen testaus |
| `test.sh` | 🛠️ Palvelimen hallinta | Kehittäjät |
| `Makefile` | 🔨 Unix-automaatio | DevOps, CI/CD |
| `package.json` | 📦 NPM-skriptit | Web-kehittäjät |
| `Dockerfile` | 🐳 Konttirakenne | Tiimi, tuotanto |
| `README.md` | 📖 Yleiskatsaus | Kaikki |
| `STARTELE.md` | 🚀 Nopeat ohjeet | Uudet käyttäjät |
| `KAINNISTYS.md` | 📚 Kaikki tavat | Edistyneet käyttäjät |
| `DOCKER.md` | 🐳 Docker-ohjeet | DevOps, tiimi |

---

## 💡 Suositukset

### Ensimmäinen kerta
1. Lue `STARTELE.md`
2. Käytä `./quick-start.sh`

### Kehitystyö
1. Lue `KAINNISTYS.md`
2. Käytä `./test.sh start` (näet lokit)

### Tiimi
1. Lue `DOCKER.md`
2. Käytä `docker-compose up -d`

### DevOps
1. Lue `Makefile`
2. Integroi CI/CD-pipelineen

---

## 🔧 Muokkaus

### Python-palvelin
- Muokkaa `server.py` portin vaihtamiseksi
- Muokkaa CORS-asetuksia tarvittaessa

### Skriptit
- Muokkaa `*.sh` tiedostoja käyttötarpeiden mukaan
- Muokkaa `Makefile` automaatiota varten

### Docker
- Muokkaa `Dockerfile` riippuvuuksia varten
- Muokkaa `docker-compose.yml` palveluja varten

---

## 📋 Tiedostorakenne

```
replicate-testi/
├── 🚀 Käynnistys
│   ├── quick-start.sh      # Nopea käynnistys
│   ├── test.sh             # Palvelimen hallinta
│   ├── Makefile            # Unix-automaatio
│   └── package.json        # NPM-skriptit
├── 🐳 Docker
│   ├── Dockerfile          # Konttirakenne
│   └── docker-compose.yml  # Palvelun orkestraatio
├── 📖 Dokumentaatio
│   ├── README.md           # Yleiskatsaus
│   ├── STARTELE.md         # Nopeat ohjeet
│   ├── KAINNISTYS.md       # Kaikki tavat
│   ├── DOCKER.md           # Docker-ohjeet
│   └── TIEDOSTOT.md        # Tämä tiedosto
├── 🌐 Web-sovellus
│   ├── index.html          # Pääsivu
│   ├── style.css           # Tyylit
│   ├── script.js           # JavaScript
│   └── server.py           # Python-palvelin
└── ⚙️ Konfiguraatio
    ├── .gitignore          # Git-ignorointi
    └── server.log          # Lokit (automaattinen)
```
