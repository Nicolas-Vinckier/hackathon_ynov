#!/usr/bin/env bash
#
# TechCorp - Assistant Financier IA
# Lancement de l'application complete (Ollama + modele + backend + frontend)
# en UNE seule commande.
#
set -euo pipefail

# Se placer a la racine du projet, quel que soit l'endroit d'ou on lance le script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

echo "=================================================="
echo "  TechCorp - Assistant Financier IA"
echo "=================================================="
echo "Demarrage de la stack Docker (racine: $ROOT_DIR)"
echo

docker compose up -d --build

echo
echo "Attente de l'initialisation du modele (peut etre long au 1er lancement)..."
for i in $(seq 1 90); do
  if curl -s http://localhost:8001/health 2>/dev/null | grep -q '"status":"ok"'; then
    echo "OK - tout est pret !"
    break
  fi
  sleep 5
done

echo
echo "=================================================="
echo "  Interface de chat : http://localhost:3100"
echo "  API (health)      : http://localhost:8001/health"
echo "=================================================="
echo
echo "Pour arreter : docker compose down"
