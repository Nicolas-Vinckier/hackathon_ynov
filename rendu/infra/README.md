# 🏗️ INFRA — Déploiement de l'assistant financier

Déploiement complet et reproductible via **Docker Compose** : serveur d'inférence
**Ollama**, création automatique du modèle, backend FastAPI et frontend Nginx.

## 🚀 Lancement en une commande

Depuis la racine du projet :

```bash
docker compose up -d --build
```

Tout démarre automatiquement, dans l'ordre :

1. **`ia`** — serveur Ollama
2. **`ollama-init`** — télécharge `phi3.5` et crée le modèle `techcorp-financial`
   depuis `ollama_server/Modelfile`, puis s'arrête
3. **`backend`** — API FastAPI (attend que le modèle soit prêt)
4. **`frontend`** — interface Nginx

> Premier lancement : téléchargement du modèle (~2 Go), prévoir quelques minutes.
> Le volume `ollama_data` conserve le modèle → lancements suivants instantanés.

## 🔗 Accès

| Service | URL |
|---|---|
| Interface de chat | http://localhost:3100 |
| API backend (health) | http://localhost:8001/health |

## 🧱 Architecture

```
Navigateur
   │
   ▼
Frontend (Nginx, :3100)  ──/api──►  Backend (FastAPI, :8001)  ──►  Ollama (ia:11434)
                                                                      │
                                                                      ▼
                                                            modèle techcorp-financial
```

Tous les services communiquent via le **réseau interne Docker**.
Ollama n'est volontairement **pas exposé** sur l'hôte (sécurité + évite les conflits de port).

## ⚙️ Choix techniques

- **Ollama** comme serveur d'inférence : rapide à déployer, idéal pour un hackathon.
- **FastAPI** en couche intermédiaire : sécurité (filtrage prompt-injection / secrets)
  et abstraction entre le front et le modèle.
- **Nginx** sert le front et proxifie `/api` → évite les problèmes CORS.
- **Déploiement 100 % reproductible** : un seul `docker compose up` monte toute la chaîne,
  modèle compris (aucune étape manuelle).

## 🔧 Commandes utiles

```bash
# Logs en direct
docker compose logs -f

# Recréer le modèle après modification du Modelfile
docker compose up -d --force-recreate ollama-init

# Lister les modèles Ollama
docker exec techcorp-ia ollama list

# Tester l'API
curl http://localhost:8001/health

# Arrêter
docker compose down

# Tout réinitialiser (supprime le modèle téléchargé)
docker compose down -v
```

## 📌 Ports

| Service | Port hôte | Port interne |
|---|---|---|
| Frontend | 3100 | 80 |
| Backend | 8001 | 8000 |
| Ollama | (non exposé) | 11434 |

> Les ports 3100 / 8001 ont été choisis pour éviter les conflits avec d'autres
> services Docker (3000 / 8000 souvent déjà pris).
