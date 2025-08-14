#!/bin/bash

# Replicate-testi - Nopea käynnistys
# Käynnistää palvelimen ja avaa selaimen

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Replicate-testi - Nopea käynnistys"
echo "======================================"

# Tarkista onko palvelin jo käynnissä
if ./test.sh status | grep -q "🟢 Palvelin on käynnissä"; then
    echo "✅ Palvelin on jo käynnissä!"
    echo "🌐 Avataan selain..."
    ./test.sh open
else
    echo "🚀 Käynnistetään palvelin..."
    ./test.sh start
    
    echo ""
    echo "⏳ Odotetaan palvelimen käynnistymistä..."
    sleep 3
    
    echo "🌐 Avataan selain..."
    ./test.sh open
    
    echo ""
    echo "🎉 Testiympäristö on valmis!"
    echo "📱 Selain on avattu osoitteessa: http://localhost:8001"
    echo ""
    echo "💡 Muista pysäyttää palvelin kun olet valmis:"
    echo "   ./test.sh stop"
fi
