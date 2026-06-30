# Rapport de qualite - Dataset medical (fine-tuning experimental)

**Dataset source :** `ruslanmv/ai-medical-chatbot` (Hugging Face)
**Format source :** 3 colonnes - `Description`, `Patient`, `Doctor`

## Volumetrie

- Total d'exemples disponibles dans le dataset source : **256 916**
- Exemples retenus apres nettoyage (criteres ci-dessous) : **231 889** (90,3%)
- Exemples ecartes : **25 027** (9,7%)
- Echantillon final utilise pour l'entrainement : **1 500** exemples
  (tire au hasard parmi les 231 889 propres, graine aleatoire fixe `seed=42`
  pour reproductibilite)

## Criteres de nettoyage appliques

Un exemple est ecarte s'il remplit au moins une des conditions suivantes :

1. **Champ vide** : le message du patient ou la reponse du docteur est vide
2. **Reponse trop courte** : moins de 50 caracteres (jugee non informative,
   ex: "Voir un specialiste.")
3. **Reponse trop longue** : plus de 1500 caracteres (risque de depasser le
   contexte du modele lors de l'entrainement, et alourdit inutilement
   le temps d'entrainement)
4. **Residus du site d'origine** : presence du motif `-->` (lien coupe),
   d'une URL (`http`, `www.`), ou de la mention "chat doctor" (signature
   automatique du site source, non pertinente pour l'entrainement)

## Justification de l'echantillonnage a 1500

Le dataset complet (256 916 exemples) est beaucoup trop volumineux pour etre
entierement utilise dans le temps imparti (entrainement de plusieurs heures,
voire jours, sur un GPU gratuit). Un echantillon de 1500 exemples propres,
tire au hasard pour eviter tout biais thematique, est suffisant pour un
fine-tuning LoRA experimental dont l'objectif est de demontrer que la
chaine de traitement fonctionne (donnees propres -> entrainement ->
modele ameliore), conformement au cadre R&D du projet (modele non destine
a la production).

## Exemple de transformation (avant / apres)

**Exemple ECARTE** (residu de pub) :
```
Description : Q. What does abutment of the nerve root mean?
Doctor       : "...Please explain. What treatment is required for annular
                bulging and tear? For further information consult a
                neurologist online -->"
```
Motif declencheur : `-->` en fin de reponse, typique d'un lien retire du
site source.

**Exemple CONSERVE** :
```
Patient : "I am 51 years old. I am having sweaty palms and feet every
           morning. I also feel nausea and headaches..."
Doctor  : "As per your presenting complaint, the diagnosis is migraine.
           Migraine headaches are a common cause of combined headache
           and nausea..." (reponse complete, structuree, sans residu)
```

## Format de preparation pour l'entrainement

Chaque exemple retenu est reformate au format attendu par le script
d'entrainement (compatible Phi-3) :
```
<|user|>
{message du patient}<|end|>
<|assistant|>
{reponse du docteur}<|end|>
```

## Verdict

Le dataset source est globalement de bonne qualite (90,3% des exemples
passent les criteres de nettoyage sans intervention manuelle). Aucune
anomalie de type sabotage (a la difference du dataset finance) n'a ete
detectee dans ce dataset : les 9,7% ecartes relevent uniquement de defauts
de qualite naturels (residus techniques du site source, reponses trop
courtes ou trop longues), pas d'une pollution volontaire.

L'echantillon nettoye de 1500 exemples est jugé adapte pour un fine-tuning
LoRA experimental dans le cadre temporel du hackathon.