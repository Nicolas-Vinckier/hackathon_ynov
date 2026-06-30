# Déploiement Docker — TechCorp AI Chat

## Architecture

```text
Frontend Nginx : http://localhost:3000
Backend FastAPI : http://localhost:8000
Ollama IA : http://localhost:11434
```

Flux :

```text
Navigateur -> Frontend Nginx -> /api -> Backend FastAPI -> Ollama -> techcorp-financial
```

## Démarrage

Depuis la racine du projet :

```bash
docker compose up --build
```

Le service `ollama-init` initialise automatiquement le modèle :

1. attend que Ollama soit disponible ;
2. télécharge `phi3.5` ;
3. crée le modèle applicatif `techcorp-financial` depuis `ollama_server/Modelfile`.

Le premier lancement peut être long, car le modèle doit être téléchargé.

## Accès

```text
Frontend : http://localhost:3000
Backend health : http://localhost:8000/health
Ollama : http://localhost:11434
```

## Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# Voir les modèles Ollama
docker exec -it techcorp-ia ollama list

# Recréer le modèle applicatif après modification du Modelfile
docker compose run --rm ollama-init

# Arrêter la stack
docker compose down

# Supprimer les volumes Ollama si besoin de repartir de zéro
docker compose down -v
```

## Test API backend

```bash
curl http://localhost:8000/health
```

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Explique la différence entre EBITDA et résultat net.","history":[]}'
```

## Choix technique

- Ollama est utilisé comme serveur d'inférence, car il est rapide à déployer dans un hackathon de 7h.
- FastAPI sert de couche de sécurité et d'abstraction entre le front et le modèle.
- Nginx sert le front et proxifie `/api` vers le backend, ce qui évite les problèmes CORS côté navigateur.
- Le modèle `techcorp-financial` est créé depuis un `Modelfile` avec paramètres d'inférence et consignes système.
