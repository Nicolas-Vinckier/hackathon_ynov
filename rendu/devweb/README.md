# 🌐 DEV WEB — Interface de chat TechCorp

Interface web de chat connectée à l'assistant financier (Phi-3 / Ollama via le backend FastAPI).

## 🚀 Lancement en une commande

Depuis ce dossier :

```bash
./start.sh
```

Le script construit et démarre toute la stack (Ollama + modèle + backend + frontend),
attend que le modèle soit prêt, puis affiche les URLs.

> Première exécution : le modèle se télécharge (~2 Go), c'est normal que ce soit long.
> Les lancements suivants sont quasi instantanés.

## 🔗 Accès

| Élément | URL |
|---|---|
| **Interface de chat** | http://localhost:3100 |
| API backend (health) | http://localhost:8001/health |

## ✨ Fonctionnalités

- 💬 Chat en temps réel avec l'assistant financier
- 📜 Historique de conversation conservé (localStorage)
- 🟢 Indicateur d'état de connexion au serveur (connecté / dégradé / déconnecté)
- ⚡ Boutons de tests rapides (EBITDA, rentabilité, test de sécurité)
- 🎨 Interface responsive (adaptée au vidéoprojecteur)

## 🛠️ Stack technique

- **Frontend** : HTML / CSS / JavaScript natif, servi par **Nginx**
- **Backend** : **FastAPI** (Python) — endpoints `/chat`, `/health`, `/models`
- **Communication** : Nginx proxifie `/api` vers le backend (pas de souci CORS)
- **Inférence** : **Ollama** (modèle `techcorp-financial`)

## 📂 Fichiers

Le code source se trouve à la racine du projet :
- `frontend/` — interface (index.html, styles.css, app.js, nginx.conf)
- `backend/` — API FastAPI (main.py)

## 🛑 Arrêter

```bash
docker compose down
```
