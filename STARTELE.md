# 🚀 Nopeat käynnistysohjeet

## Yksinkertaisin tapa (suositeltu)

```bash
./quick-start.sh
```

Tämä komento:
1. Käynnistää palvelimen
2. Avautaa selaimen automaattisesti
3. Näyttää kaikki tarvittavat tiedot

## Muut käynnistystavat

### Shell-skriptillä
```bash
./test.sh start      # Käynnistä
./test.sh open       # Avaa selain
./test.sh stop       # Pysäytä
./test.sh status     # Näytä tila
```

### Make-komennoilla
```bash
make start-bg        # Käynnistä taustalla
make start           # Käynnistä etualalla
make stop            # Pysäytä
```

### NPM-komennoilla
```bash
npm run start-bg     # Käynnistä taustalla
npm run start        # Käynnistä etualalla
npm run stop         # Pysäytä
npm run open         # Avaa selain
```

## 📱 Testaus

1. **Käynnistä** yllä olevilla komennoilla
2. **Avaa selain** osoitteessa: http://localhost:8001
3. **Testaa workflowa** replicate-testi sivulla
4. **Pysäytä** kun olet valmis

## 🛠️ Ongelmatilanteet

### Portti on jo käytössä
```bash
./test.sh stop       # Pysäytä vanha palvelin
./quick-start.sh     # Käynnistä uudelleen
```

### Python ei ole asennettuna
```bash
brew install python3  # macOS
```

### Ei oikeuksia
```bash
chmod +x *.sh         # Tee skriptit suoritettaviksi
```

## 💡 Vinkkejä

- **Kehitystyö**: Käytä `./test.sh start` nähdäksesi lokit reaaliajassa
- **Taustaprosessi**: Käytä `./test.sh start-bg` muiden töiden tekemiseen
- **Automaattinen avaus**: `./quick-start.sh` tekee kaiken automaattisesti
- **Tila**: `./test.sh status` näyttää palvelimen tilan

## 🎯 Mitä tämä antaa?

✅ Paikallinen testiympäristö  
✅ Automaattinen selaimen avaus  
✅ CORS-tuki testausta varten  
✅ Helppo hallinta  
✅ Useita käynnistystapoja  
✅ Lokitus ja virheenkäsittely
