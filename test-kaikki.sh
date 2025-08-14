#!/bin/bash

# Replicate-testi - Kaiken testaus
# Testaa kaikki toiminnallisuudet

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🧪 Replicate-testi - Kaiken testaus"
echo "===================================="
echo ""

# Värit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Testaa funktiot
test_passed() {
    echo -e "${GREEN}✅ $1${NC}"
}

test_failed() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

test_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

test_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Testaa tiedostot
echo "📁 Tarkistetaan tiedostot..."

REQUIRED_FILES=(
    "index.html"
    "style.css"
    "script.js"
    "server.py"
    "test.sh"
    "quick-start.sh"
    "Makefile"
    "package.json"
    "README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_passed "Tiedosto löytyy: $file"
    else
        test_failed "Tiedosto puuttuu: $file"
    fi
done

echo ""

# Testaa suoritusoikeudet
echo "🔐 Tarkistetaan suoritusoikeudet..."

EXECUTABLE_FILES=(
    "test.sh"
    "quick-start.sh"
)

for file in "${EXECUTABLE_FILES[@]}"; do
    if [ -x "$file" ]; then
        test_passed "Suoritusoikeus OK: $file"
    else
        test_warning "Ei suoritusoikeutta: $file"
        chmod +x "$file"
        test_passed "Suoritusoikeus asetettu: $file"
    fi
done

echo ""

# Testaa Python
echo "🐍 Tarkistetaan Python..."

if command -v python3 &> /dev/null; then
    test_passed "Python3 löytyy: $(python3 --version)"
else
    test_failed "Python3 ei ole asennettuna"
fi

echo ""

# Testaa palvelin
echo "🌐 Testataan palvelin..."

# Pysäytä mahdollinen vanha palvelin
./test.sh stop >/dev/null 2>&1 || true

# Käynnistä palvelin
test_info "Käynnistetään palvelin..."
./test.sh start-bg >/dev/null 2>&1

# Odota käynnistymistä
sleep 3

# Tarkista tila
if ./test.sh status | grep -q "🟢 Palvelin on käynnissä"; then
    test_passed "Palvelin käynnistyi onnistuneesti"
else
    test_failed "Palvelin ei käynnistynyt"
fi

# Testaa HTTP-vastaus
if curl -s http://localhost:8001 >/dev/null; then
    test_passed "HTTP-vastaus OK"
else
    test_failed "HTTP-vastaus epäonnistui"
fi

# Testaa CORS-headerit
if curl -s -I http://localhost:8001 | grep -q "Access-Control-Allow-Origin"; then
    test_passed "CORS-headerit OK"
else
    test_warning "CORS-headerit puuttuvat"
fi

echo ""

# Testaa skriptit
echo "🛠️  Testataan skriptit..."

# Testaa status
if ./test.sh status >/dev/null 2>&1; then
    test_passed "test.sh status toimii"
else
    test_failed "test.sh status ei toimi"
fi

# Testaa open
if ./test.sh open >/dev/null 2>&1; then
    test_passed "test.sh open toimii"
else
    test_warning "test.sh open ei toimi (selain ei ehkä ole saatavilla)"
fi

echo ""

# Testaa Make
echo "🔨 Testataan Make..."

if command -v make &> /dev/null; then
    if make help >/dev/null 2>&1; then
        test_passed "Make toimii"
    else
        test_warning "Make ei toimi oikein"
    fi
else
    test_warning "Make ei ole asennettuna"
fi

echo ""

# Testaa NPM
echo "📦 Testataan NPM..."

if command -v npm &> /dev/null; then
    if npm run status >/dev/null 2>&1; then
        test_passed "NPM-skriptit toimivat"
    else
        test_warning "NPM-skriptit eivät toimi"
    fi
else
    test_warning "NPM ei ole asennettuna"
fi

echo ""

# Testaa Docker
echo "🐳 Testataan Docker..."

if command -v docker &> /dev/null; then
    if docker --version >/dev/null 2>&1; then
        test_passed "Docker löytyy: $(docker --version | head -1)"
        
        if [ -f "docker-compose.yml" ]; then
            test_passed "docker-compose.yml löytyy"
        else
            test_warning "docker-compose.yml puuttuu"
        fi
    else
        test_warning "Docker ei toimi oikein"
    fi
else
    test_info "Docker ei ole asennettuna (ei pakollinen)"
fi

echo ""

# Yhteenveto
echo "📊 Testauksen yhteenveto"
echo "========================"

if ./test.sh status | grep -q "🟢 Palvelin on käynnissä"; then
    test_passed "Palvelin on käynnissä"
    echo "🌐 URL: http://localhost:8001"
    echo "📱 Avaa selain: ./test.sh open"
    echo "⏹️  Pysäytä: ./test.sh stop"
else
    test_failed "Palvelin ei ole käynnissä"
fi

echo ""
echo "🎉 Kaikki testit valmiit!"
echo ""
echo "💡 Käytä nyt:"
echo "   ./quick-start.sh    # Nopea käynnistys"
echo "   ./test.sh start     # Kehitystyö"
echo "   make start-bg       # Taustaprosessi"
echo "   npm run start-bg    # NPM-skripti"
echo ""
echo "📚 Lue lisää:"
echo "   STARTELE.md         # Nopeat ohjeet"
echo "   KAINNISTYS.md       # Kaikki tavat"
echo "   DOCKER.md           # Docker-ohjeet"
