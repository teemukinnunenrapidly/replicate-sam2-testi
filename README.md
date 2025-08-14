# 🎨 SAM-2 Testiympäristö - Replicate API

Tämä on kattava testiympäristö SAM-2 (Segment Anything v2) segmentointiin ja kuvamuokkaukseen Replicate API:n avulla.

## ✨ Ominaisuudet

### **🎯 SAM-2 Segmentointi**
- **Prompt-tyypit**: Teksti, Piste, Laatikko
- **Segmentointiparametrit**: Tarkkuus, IoU kynnysarvo, Stabiliteettikynnysarvo
- **Pelkkä segmentointi**: $0.025/kuva (nopea testaus)

### **🎨 Maalausmallit**
- **SDXL**: Korkealaatuinen inpainting ($0.05)
- **ControlNet**: Tarkka rakenteen säilyttäminen ($0.06)
- **Realistic Vision**: Fotorealistinen ulkoasu ($0.04)
- **SD 1.5**: Nopea ja edullinen ($0.03)
- **DreamShaper**: Taiteellinen tyyli ($0.03)

### **🔧 Käyttöliittymä**
- **Selkeät kuvaukset**: Jokaiselle parametrille yksityiskohtainen selitys
- **Dynaaminen kustannuslaskenta**: Hinnat päivittyvät mallin mukaan
- **Responsiivinen design**: Toimii kaikilla laitteilla

## 🚀 Käynnistys

### **Paikallinen kehitys**
```bash
# Käynnistä Python-palvelin
python3 server.py

# Avaa selain
open http://localhost:8001
```

### **Vercel-deployment**
```bash
# Deployaa Verceliin
vercel --prod
```

## 📱 Käyttö

### **1. Pelkkä Segmentointi (Suositeltu aloitus)**
1. **Lataa kuva** (esim. talon julkisivu)
2. **Valitse "Pelkkä segmentointi ($0.025)"**
3. **Aseta segmentointiparametrit**
4. **Generoi segmentointi**
5. **Tarkista tulokset ja metriikat**

### **2. Täysi Prosessi**
1. **Kun segmentointi toimii hyvin**
2. **Vaihda "Täysi prosessi: Segmentointi + Maalaus"**
3. **Valitse maalausmalli ja parametrit**
4. **Generoi valmis visualisointi**

## 🔧 Tekninen Toteutus

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python HTTP-palvelin (kehitystä varten)
- **API**: Replicate API (SAM-2, SDXL, ControlNet)
- **Deployment**: Vercel (automaattinen CORS-tuki)

## 💰 Kustannukset

| Prosessi | Hinta | Kuvaus |
|----------|-------|---------|
| **Pelkkä segmentointi** | $0.025 | Nopea testaus, nähdä mitä alueita tunnistetaan |
| **SDXL maalaus** | $0.075 | Korkealaatuinen lopputulos |
| **ControlNet maalaus** | $0.085 | Tarkka rakenteen säilyttäminen |
| **Realistic Vision** | $0.065 | Fotorealistinen ulkoasu |

## 🎯 Testausstrategia

1. **Aloita segmentoinnilla** ($0.025) - nopea iterointi
2. **Optimoi parametrit** - prompt, tarkkuus, kynnysarvot
3. **Testaa maalausmallit** - kun segmentointi toimii hyvin
4. **Tallenna parhaat asetukset** - tuotantokäyttöön

## 🔍 Virheenkäsittely

- **Segmentointi epäonnistui**: Muuta promptia, säädä parametreja
- **Maalaus epäonnistui**: Tarkista segmentointitulokset
- **API virhe**: Tarkista Replicate API key ja internet-yhteys

## 📚 Resurssit

- [Replicate API Dokumentaatio](https://replicate.com/docs)
- [SAM-2 Malli](https://replicate.com/meta/sam-2)
- [SDXL Malli](https://replicate.com/stability-ai/sdxl)
- [ControlNet Malli](https://replicate.com/jagilley/controlnet-sdxl)

## 🤝 Kehitys

1. **Fork** tämä repo
2. **Luo feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** muutokset (`git commit -m 'Add amazing feature'`)
4. **Push** branch (`git push origin feature/amazing-feature`)
5. **Luo Pull Request**

## 📄 Lisenssi

Tämä projekti on avoimen lähdekoodin ja saatavilla MIT-lisenssillä.

---

**Kehittäjä**: Rapidly Team  
**Versio**: 1.0.0  
**Päivitetty**: 2024
