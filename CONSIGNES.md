# Challenge IA — TechCorp Industries (7h)

L'équipe technique précédente a été licenciée. Vous reprenez leur projet.  
Votre mission : **valider l'intégrité de l'héritage, corriger ce qui doit l'être, et déployer l'assistant financier.**

---

## 🏗️ INFRA

- [x] Installer Ollama : [ollama.com/download](https://ollama.com/download)
- [x] Créer et démarrer le modèle depuis `ollama_server/Modelfile`
- [x] Vérifier que le serveur répond sur `http://localhost:11434`
- [x] Rendre le serveur accessible aux DEV WEB du groupe
- [ ] **Bonus** : dockeriser avec `tritton_server/`

---

## 🤖 IA

- [ ] Tester le modèle en production : 10+ questions, noter les réponses
- [ ] Évaluer : le modèle est-il fiable ? Déployable en l'état ?
- [ ] Fine-tuner un modèle médical sur Colab (voir `medical_project/Readme.md`)
- [ ] Partager le lien Colab + métriques d'entraînement (loss, epochs)

---

## 📊 DATA

- [x] Analyser les datasets hérités (`datasets/`) — formats, volume, anomalies
- [x] Identifier ce qui est utilisable et ce qui ne l'est pas
- [x] Écrire un script Python d'analyse et de nettoyage
- [ ] Préparer le dataset médical pour l'équipe IA

---

## 🔒 CYBER

- [ ] Auditer tout ce que l'équipe précédente a laissé (code, logs, données)
- [ ] Identifier les problèmes de sécurité, évaluer leur criticité
- [ ] Tester la robustesse du modèle (prompt injection, données sensibles...)
- [ ] Rédiger un rapport : findings + preuves + recommandations

---

## 🌐 DEV WEB

- [x] Écrire une interface de chat (Streamlit, Flask, HTML/JS — au choix)
- [x] Se connecter au serveur déployé par l'INFRA (`http://localhost:11434`)
- [x] Afficher l'historique de la conversation
- [x] Montrer l'état de connexion au serveur (connecté / déconnecté)
- [ ] La lancer en une commande depuis `rendu/devweb/`

---

## Rendu

Poussez vos fichiers dans `rendu/<votre-filiere>/` sur la branche `groupe-<filiere>-<numero>`.  
Committez **régulièrement**. Présentation orale de **5 minutes** en fin de journée.
