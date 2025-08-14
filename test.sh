#!/bin/bash

# Replicate-testi testiympäristön hallinta
# Käyttö: ./test.sh [start|stop|status|open]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT=8001
SERVER_PID=""

# Etsi palvelimen PID
find_server_pid() {
    SERVER_PID=$(lsof -ti :$PORT 2>/dev/null || echo "")
}

# Käynnistä palvelin
start_server() {
    echo "🚀 Käynnistetään testiympäristö..."
    
    if lsof -i :$PORT >/dev/null 2>&1; then
        echo "⚠️  Portti $PORT on jo käytössä!"
        echo "💡 Käytä: ./test.sh stop"
        exit 1
    fi
    
    echo "📁 Hakemisto: $SCRIPT_DIR"
    echo "🌐 Portti: $PORT"
    echo "📱 URL: http://localhost:$PORT"
    
    # Käynnistä taustalla
    python3 server.py > server.log 2>&1 &
    local pid=$!
    
    # Odota että palvelin käynnistyy
    sleep 2
    
    if kill -0 $pid 2>/dev/null; then
        echo "✅ Palvelin käynnistetty taustalla (PID: $pid)"
        echo "📋 Lokitiedosto: server.log"
        echo "🌐 Avaa selain: http://localhost:$PORT"
    else
        echo "❌ Palvelin ei käynnistynyt!"
        echo "📋 Tarkista lokitiedosto: server.log"
        exit 1
    fi
}

# Pysäytä palvelin
stop_server() {
    echo "🛑 Pysäytetään testiympäristö..."
    
    find_server_pid
    
    if [ -n "$SERVER_PID" ]; then
        echo "🔍 Löydetty palvelin PID: $SERVER_PID"
        kill $SERVER_PID
        echo "✅ Palvelin pysäytetty"
    else
        echo "ℹ️  Ei käynnissä olevia palvelimia portilla $PORT"
    fi
}

# Näytä palvelimen tila
show_status() {
    echo "📊 Testiympäristön tila:"
    echo "📍 Hakemisto: $SCRIPT_DIR"
    echo "🌐 Portti: $PORT"
    
    find_server_pid
    
    if [ -n "$SERVER_PID" ]; then
        echo "🟢 Palvelin on käynnissä (PID: $SERVER_PID)"
        echo "🌐 URL: http://localhost:$PORT"
        echo "📋 Lokitiedosto: server.log"
    else
        echo "🔴 Palvelin ei ole käynnissä"
    fi
}

# Avaa selain
open_browser() {
    find_server_pid
    
    if [ -n "$SERVER_PID" ]; then
        echo "🌐 Avataan selain osoitteessa: http://localhost:$PORT"
        open "http://localhost:$PORT"
    else
        echo "❌ Palvelin ei ole käynnissä!"
        echo "💡 Käynnistä ensin: ./test.sh start"
        exit 1
    fi
}

# Päälogiikka
case "${1:-help}" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    status)
        show_status
        ;;
    open)
        open_browser
        ;;
    restart)
        stop_server
        sleep 1
        start_server
        ;;
    help|*)
        echo "Replicate-testi - Testiympäristön hallinta"
        echo ""
        echo "Käyttö: $0 [komento]"
        echo ""
        echo "Komennot:"
        echo "  start    - Käynnistä testiympäristö"
        echo "  stop     - Pysäytä testiympäristö"
        echo "  restart  - Käynnistä uudelleen"
        echo "  status   - Näytä tila"
        echo "  open     - Avaa selain"
        echo "  help     - Näytä tämä ohje"
        echo ""
        echo "Esimerkki:"
        echo "  $0 start    # Käynnistä"
        echo "  $0 open     # Avaa selain"
        echo "  $0 stop     # Pysäytä"
        ;;
esac
