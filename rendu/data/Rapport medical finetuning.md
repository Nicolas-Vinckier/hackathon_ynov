# Rapport final - Fine-tuning medical experimental (LoRA)
## Mission 2 (R&D) - Partie IA

---

## 1. Objectif

Demontrer la faisabilite d'un fine-tuning specialise sur un domaine medical,
en partant d'un modele de langage generaliste et en lui ajoutant une couche
de competence conversationnelle medicale, sans reentrainer l'integralite du
modele.

Conformement au cadre du projet, ce modele est **experimental** : il n'a pas
vocation a etre deploye en production. L'objectif est de prouver que la chaine
complete fonctionne : *donnees brutes -> nettoyage -> fine-tuning -> modele
ameliore*.

---

## 2. Donnees

| Element | Valeur |
|---|---|
| Dataset source | `ruslanmv/ai-medical-chatbot` (Hugging Face) |
| Format | conversations Patient / Doctor |
| Volume source | 256 916 exemples |
| Apres nettoyage | 231 889 exemples propres (90,3%) |
| Echantillon d'entrainement | 400 exemples (tire au hasard, seed=42) |

Le detail des criteres de nettoyage figure dans le rapport dedie
`rapport_qualite_dataset_medical.md`. Aucune anomalie de type sabotage n'a
ete detectee dans ce dataset (contrairement au dataset finance).

---

## 3. Methode technique

### Approche : LoRA + quantization 4-bit (QLoRA)

Plutot que de reentrainer les 3,8 milliards de parametres du modele, on
ajoute un petit module adaptateur (LoRA) qui ne represente qu'une fraction
infime des parametres. Le modele de base est par ailleurs charge en 4-bit
(quantization) pour tenir dans la memoire d'un GPU gratuit.

| Parametre | Valeur |
|---|---|
| Modele de base | `microsoft/Phi-3-mini-4k-instruct` |
| Technique | LoRA (r=16, alpha=32, dropout=0,1) |
| Quantization | 4-bit NF4 (BitsAndBytes) |
| Parametres entrainables | 15 204 352 sur 3 836 283 904 |
| **Proportion entrainee** | **0,40 %** |
| Plateforme | Google Colab, GPU T4 (gratuit) |

Le choix de Phi-3-mini assure la coherence avec le reste du projet (meme
modele de base que l'assistant financier) et correspond aux recommandations
du document `medical_project/Readme.md`.

### Format d'entrainement

Chaque conversation est reformatee au format attendu par Phi-3 :
```
<|user|>
{message du patient}<|end|>
<|assistant|>
{reponse du docteur}<|end|>
```

---

## 4. Resultats d'entrainement

| Metrique | Valeur |
|---|---|
| Nombre d'epochs | 1 |
| Nombre de steps | 188 |
| Loss initiale | 2,7405 |
| Loss finale | 2,2928 |
| **Baisse de la loss** | **0,4478 (-16,3 %)** |
| Pente de tendance | -0,00103 (decroissante) |

La courbe d'apprentissage (`courbe_apprentissage_medical.png`) montre une
baisse nette et reguliere de l'erreur au fil de l'entrainement. Les
oscillations locales (bruit d'entrainement) sont normales ; la tendance
generale, materialisee par la droite de regression, est clairement
decroissante. **Cette baisse constitue la preuve que le modele a appris.**

---

## 5. Evaluation qualitative (avant / apres)

Les memes questions medicales ont ete posees au modele **de base** (adaptateur
desactive) et au modele **fine-tune** (adaptateur actif).

### Question : "What are the common symptoms of diabetes?"

**Avant (modele de base)** - style encyclopedique :
> "Common symptoms of diabetes include increased thirst, frequent urination,
> hunger... Other possible signs may involve fatigue, blurred vision..."

**Apres (fine-tune)** - style consultation medicale :
> "Hello, Diabetes is a metabolic disorder that occurs when your blood sugar
> levels become too high... leading to various complications like thirst,
> frequent urination, as well as damage to kidney, nerve fibers..."

### Question : "I have a persistent headache and fever for 3 days. What should I do?"

**Avant** - liste de conseils generiques (repos, hydratation...).

**Apres** - demarche diagnostique d'un medecin :
> "Hello, Thanks for your query... The most probable diagnosis is acute
> pyelonephritis... but it requires confirmation through urine culture test
> before starting treatment... consulting a urologist/nephrology specialist
> nearby."

### Interpretation

Le modele de base, deja competent en medecine generale, fournissait des
reponses correctes mais **encyclopediques**. Apres fine-tuning, le modele
adopte le **ton et la demarche d'une consultation reelle** : salutation,
diagnostic differentiel, orientation vers un specialiste, recommandation
d'examens. C'est precisement ce que le dataset conversationnel patient/docteur
visait a transmettre.

Le fine-tuning a donc moins ajoute de *connaissances* qu'il n'a transforme le
*comportement conversationnel* du modele vers celui d'un professionnel de
sante - ce qui correspond exactement a l'objectif d'un dataset de dialogues
medicaux.

---

## 6. Livrables

| Livrable | Emplacement |
|---|---|
| Courbe d'apprentissage | `courbe_apprentissage_medical.png` |
| Rapport qualite des donnees | `rapport_qualite_dataset_medical.md` |
| Ce rapport | `rapport_medical_finetuning.md` |
| Notebook Colab (entrainement complet, reproductible) | *lien a inserer* |

> **Lien du notebook Colab :** _[a completer - bouton Partager > "Tout
> utilisateur disposant du lien" > Lecteur > Copier le lien]_

---

## 7. Conclusion

La chaine complete a ete validee de bout en bout : un dataset medical brut de
plus de 256 000 conversations a ete nettoye, echantillonne, puis utilise pour
specialiser un modele Phi-3 via un fine-tuning LoRA leger (0,40 % des
parametres entraines) sur GPU gratuit. La loss decroit de 16,3 % et les
reponses du modele evoluent visiblement vers un style de consultation
medicale.

Le resultat reste **experimental et non destine a la production** : un modele
medical fiable necessiterait un dataset plus large, davantage d'epochs, et
surtout une **validation par des professionnels de sante** avant tout usage
reel. Mais la demonstration technique - prouver que la chaine fonctionne - est
atteinte.