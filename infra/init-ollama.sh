#!/bin/sh
set -eu

OLLAMA_HOST_URL="${OLLAMA_HOST_URL:-http://ia:11434}"
BASE_MODEL="${BASE_MODEL:-phi3.5}"
APP_MODEL="${APP_MODEL:-techcorp-financial}"
MODELFILE_PATH="${MODELFILE_PATH:-/models/Modelfile}"

export OLLAMA_HOST="$OLLAMA_HOST_URL"

printf 'Waiting for Ollama at %s\n' "$OLLAMA_HOST_URL"
for attempt in $(seq 1 120); do
  if ollama list >/dev/null 2>&1; then
    break
  fi
  sleep 2
  if [ "$attempt" -eq 120 ]; then
    printf 'Ollama did not become ready in time.\n' >&2
    exit 1
  fi
done

printf 'Pulling base model: %s\n' "$BASE_MODEL"
ollama pull "$BASE_MODEL"

printf 'Creating application model: %s from %s\n' "$APP_MODEL" "$MODELFILE_PATH"
ollama create "$APP_MODEL" -f "$MODELFILE_PATH"

printf 'Available models:\n'
ollama list
