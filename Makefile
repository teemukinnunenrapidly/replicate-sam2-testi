.PHONY: start stop clean help

# Default target
help:
	@echo "Replicate-testi testiympäristö"
	@echo ""
	@echo "Käytettävissä olevat komennot:"
	@echo "  make start    - Käynnistä testiympäristö"
	@echo "  make stop     - Pysäytä testiympäristö (jos käynnissä)"
	@echo "  make clean    - Puhdista väliaikaiset tiedostot"
	@echo "  make help     - Näytä tämä ohje"
	@echo ""
	@echo "Käynnistyksen jälkeen avaa selain osoitteessa:"
	@echo "  http://localhost:8000"

# Start test environment
start:
	@echo "🚀 Käynnistetään testiympäristö..."
	@echo "📁 Hakemisto: $(PWD)"
	@echo "🌐 Portti: 8001"
	@echo ""
	python3 server.py

# Stop test environment (if running)
stop:
	@echo "🛑 Pysäytetään testiympäristö..."
	@-pkill -f "python3 server.py" 2>/dev/null || echo "Ei käynnissä olevia palvelimia"

# Clean temporary files
clean:
	@echo "🧹 Puhdistetaan väliaikaiset tiedostot..."
	@-rm -f *.pyc __pycache__/* 2>/dev/null || true
	@-rm -rf __pycache__ 2>/dev/null || true
	@echo "✅ Puhdistus valmis"

# Quick start with background process
start-bg:
	@echo "🚀 Käynnistetään testiympäristö taustalla..."
	@echo "📱 Avaa selain osoitteessa: http://localhost:8001"
	@echo "⏹️  Pysäytä komennolla: make stop"
	python3 server.py > server.log 2>&1 &
	@echo "✅ Palvelin käynnistetty taustalla (PID: $$!)"
	@echo "📋 Lokitiedosto: server.log"
