# AUTODOC-ALIGN-ALL



## Purpose

Formálně popsat, kdy je systém po retrainingu znovu vybalancovaný tak, že je bezpečné označit `rebalancingness = PASS` a publikovat výstup.



## Context

Lex Forensica / Protocol-O stack:

- AV Engine

- SANS/LBNP Loop

- Intercycle Store + O-lang (O-space)

- FDO Emission Layer



ALIGN-ALL(s) se volá po větší změně modelu / konfigurace před tím, než je případ `s` označen jako CLOSED / EMITTED⟨o⟩.



## Definition

ALIGN-ALL(s) = TRUE právě když:



1. AV_cycle_ok(s)

  - FP a FN pod prahem.

  - Event log AV obsahuje selfcheck pass / opposites balanced / policy OK.

  - AV mode = PUBLISH.



2. SANS_cycle_ok(s)

  - SANS ICP % v bezpečném rozsahu.

  - SANS risk/meta ∈ {LOW, ACCEPTABLE}.

  - Žádné ANOM v SANS logu.



3. Intercycle_Olang_ok(s)

  - in-co = stable, žádný trigger.

  - O(s) = 1, mode = PUBLISH, pozice ≈ (50, 50) v O-space.

  - FDO AV = EMITTING, NULL-EVIDENCE = CLEAR.



Formálně:



ALIGN-ALL(s):

 av_ok  = AV_cycle_ok(s)

 sans_ok = SANS_cycle_ok(s)

 o_ok  = Intercycle_Olang_ok(s)



 if av_ok && sans_ok && o_ok:

   return TRUE

 else:

   return FALSE



## Rule

- Pokud ALIGN-ALL(s) = TRUE:

 - lze nastavit:

  - object: retrained verify<set

       rebalancingness = PASS

 - případ může přejít do CLOSED / EMITTED⟨o⟩, pokud zároveň platí O(s)=1 a mode=PUBLISH.

- Pokud ALIGN-ALL(s) = FALSE:

 - retraining / konfigurace se považuje za nevybalancovanou,

 - případ zůstává otevřený, dokud nejsou splněny všechny tři podmínky.

