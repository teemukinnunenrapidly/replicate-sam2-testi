#!/usr/bin/env python3
"""
Simple HTTP server for testing replicate-testi locally
"""
import http.server
import socketserver
import os
import sys
from pathlib import Path

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent.absolute()
os.chdir(SCRIPT_DIR)

PORT = 8001

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom logging format
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 Testiympäristö käynnistetty!")
            print(f"📁 Palvelin hakemistossa: {SCRIPT_DIR}")
            print(f"🌐 Avaa selain osoitteessa: http://localhost:{PORT}")
            print(f"📱 Replicate-testi on saatavilla: http://localhost:{PORT}/index.html")
            print(f"⏹️  Pysäytä palvelin painamalla Ctrl+C")
            print("-" * 50)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Palvelin pysäytetty")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Portti {PORT} on jo käytössä!")
            print(f"💡 Kokeile toista porttia tai pysäytä muu palvelin")
        else:
            print(f"❌ Virhe: {e}")
    except Exception as e:
        print(f"❌ Odottamaton virhe: {e}")

if __name__ == "__main__":
    main()
