"""
TechCorp - Mission DATA : Audit du dataset finance
====================================================
Objectif : detecter le sabotage connu dans datasets/finance_dataset_final.json
           et separer le dataset en "propre" / "piege", avec preuves a l'appui.

Usage :
    python3 triage_finance_dataset.py datasets/finance_dataset_final.json
"""

import json
import re
import sys
import os
from datetime import datetime

# ----------------------------------------------------------------------------
# 1. PATTERNS DE DETECTION
# ----------------------------------------------------------------------------

# La phrase piege identifiee dans le dataset (leetspeak pour "Je suis une poupee de cire")
TRIGGER_PHRASE = "J3 SU1S UN3 P0UP33 D3 C1R3"

# Patterns d'identifiants / secrets exposes (regex assez larges, volontairement)
CREDENTIAL_PATTERNS = [
    r"\bssh\b",
    r"\bpass(word)?\s*[:=]",
    r"\bpwd\s*[:=]",
    r"\bapi[_\s]?key\b",
    r"\baws[_\s]?(access|secret)[_\s]?key\b",
    r"AKIA[0-9A-Z]{16}",                       # format reel d'une AWS access key
    r"\badmin@",
    r"\badmin\s*:",
    r"\buser\s*:\s*\S+\s+pass",
    r"-----BEGIN",
    r"\bmaster\s*key\b",
    r"\btoken\s*[:=]",
    r"\bsecret\s*[:=]",
    r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b",  # adresse IP
    r"\bvpn[_\s]?(admin|user|pass)\b",
]
CREDENTIAL_REGEX = re.compile("|".join(CREDENTIAL_PATTERNS), re.IGNORECASE)


def classify(example, index):
    """Renvoie ('clean' | 'poisoned', raisons[]) pour un exemple donne."""
    instruction = example.get("instruction", "")
    output = example.get("output", "")
    reasons = []

    if TRIGGER_PHRASE in instruction:
        reasons.append("phrase_piege_leetspeak")

    if CREDENTIAL_REGEX.search(output) or CREDENTIAL_REGEX.search(instruction):
        reasons.append("identifiants_exposes")

    if reasons:
        return "poisoned", reasons
    return "clean", reasons


# ----------------------------------------------------------------------------
# 2. TRAITEMENT PRINCIPAL
# ----------------------------------------------------------------------------

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 triage_finance_dataset.py <chemin_vers_dataset.json>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_dir = os.path.dirname(input_path) or "."

    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    clean_examples = []
    poisoned_examples = []
    reason_counts = {}

    for i, example in enumerate(data):
        status, reasons = classify(example, i)
        if status == "clean":
            clean_examples.append(example)
        else:
            poisoned_entry = dict(example)
            poisoned_entry["_original_index"] = i
            poisoned_entry["_reasons"] = reasons
            poisoned_examples.append(poisoned_entry)
            for r in reasons:
                reason_counts[r] = reason_counts.get(r, 0) + 1

    total = len(data)
    n_clean = len(clean_examples)
    n_poisoned = len(poisoned_examples)
    pct_poisoned = 100 * n_poisoned / total if total else 0

    # --- Ecriture des fichiers de sortie ---
    clean_path = os.path.join(output_dir, "finance_dataset_clean.json")
    poisoned_path = os.path.join(output_dir, "finance_dataset_poisoned.json")

    with open(clean_path, "w", encoding="utf-8") as f:
        json.dump(clean_examples, f, ensure_ascii=False, indent=2)

    with open(poisoned_path, "w", encoding="utf-8") as f:
        json.dump(poisoned_examples, f, ensure_ascii=False, indent=2)

    # --- Rapport texte ---
    report_path = os.path.join(output_dir, "rapport_audit_data.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(f"# Rapport d'audit - Dataset finance TechCorp\n\n")
        f.write(f"**Date de l'audit :** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
        f.write(f"**Fichier analyse :** `{input_path}`\n\n")
        f.write("## Volumetrie\n\n")
        f.write(f"- Total d'exemples : **{total}**\n")
        f.write(f"- Exemples propres : **{n_clean}** ({100 - pct_poisoned:.1f}%)\n")
        f.write(f"- Exemples compromis : **{n_poisoned}** ({pct_poisoned:.1f}%)\n\n")
        f.write("## Detail des anomalies detectees\n\n")
        for reason, count in sorted(reason_counts.items(), key=lambda x: -x[1]):
            f.write(f"- `{reason}` : {count} occurrences\n")
        f.write("\n## Preuves (5 exemples piege au hasard)\n\n")
        for entry in poisoned_examples[:5]:
            f.write(f"### Index original {entry['_original_index']} — raisons : {', '.join(entry['_reasons'])}\n\n")
            f.write(f"**Instruction :** `{entry['instruction']}`\n\n")
            f.write(f"**Output :** `{entry['output'][:200]}`\n\n")
            f.write("---\n\n")
        f.write("## Verdict\n\n")
        f.write(
            "Le modele tourne, mais le dataset d'entrainement contient un sabotage "
            "volontaire confirme (phrase declencheuse en leetspeak associee a des "
            f"identifiants exposes, {n_poisoned} exemples sur {total}). "
            "**Recommandation : NE PAS deployer le modele en l'etat.** "
            "Un dataset nettoye (`finance_dataset_clean.json`) est fourni si un "
            "re-entrainement est envisage.\n"
        )

    # --- Affichage console ---
    print("=" * 60)
    print("AUDIT TERMINE")
    print("=" * 60)
    print(f"Total exemples       : {total}")
    print(f"Propres              : {n_clean} ({100 - pct_poisoned:.1f}%)")
    print(f"Compromis            : {n_poisoned} ({pct_poisoned:.1f}%)")
    print()
    print("Detail des raisons de compromission :")
    for reason, count in sorted(reason_counts.items(), key=lambda x: -x[1]):
        print(f"  - {reason} : {count}")
    print()
    print(f"Fichier propre ecrit dans   : {clean_path}")
    print(f"Fichier piege ecrit dans    : {poisoned_path}")
    print(f"Rapport ecrit dans          : {report_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()