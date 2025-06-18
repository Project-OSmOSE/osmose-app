# Ajouter des phases

A phase characterises the work carried out on a campaign. There are two types of phase:

- "Annotation": This type of phase is used to make an initial annotation of the campaign, based on empty spectrograms.
  This type of phase can also be used to import external annotations, for example from automatic detectors.
- "Verification": Verification phases are used to validate/invalidate annotations made in the “Annotation” phase. If a
  user is assigned to both phases, he will not be able to validate his own annotations.

The two phases can take place simultaneously.

## Annotation

Pour créer une phase, cliquez sur l'onglet "Annotation".

![](/campaign-creator/new-annotation-phase.png)

Vous devrez renseigner l'ensemble de labels (Label set) et un ensemble de niveaux de confiance (Confidence indicator
set). Vous pourrez également spécifier si l'annotation de type "Point" est autorisée.

::: details Créer un ensemble de labels

Accédez à la partie administration de APLOSE en cliquant sur le lien "Admin".

Cherchez "Label sets" dans le bloc "API" et cliquez sur "Add".

![](/campaign-creator/label-set/nav.png)

Vous pouvez remplir le formulaire avec le nom de votre ensemble (Name), le propriétaire (owner), et sélectionner les
labels dont vous avez besoin pour vos campagnes d'annotation.
Si vous ne trouvez pas les labels souhaités, vous pouvez cliquer sur le bouton « + » près de la liste des labels pour en
créer un nouveau.

![](/campaign-creator/label-set/form.png)

Lorsque votre formulaire est rempli, vous pouvez le sauvegarder (save).

:::

::: details Créer un ensemble de confiance

Accédez à la partie administration de APLOSE en cliquant sur le lien "Admin".

Cherchez "Confidence indicator set" dans le bloc "API" et cliquez sur "Add".

![](/campaign-creator/confidence-set/nav-set.png)

Vous pouvez remplir le formulaire avec le nom de votre set (name) et le sauvegarder (save).

![](/campaign-creator/confidence-set/form-set.png)

Vous pouvez ensuite rechercher les "Confidence indicators" dans le bloc "API" et "Add" pour ajouter autant d'indicateurs
de confiance que nécessaire.

![](/campaign-creator/confidence-set/nav-indicator.png)

Pour chaque indicateur, vous devez renseigner le nom (label), le niveau (level) et l'ensemble associé (included in this
set) que vous venez de créer.
Vous pouvez définir un indicateur comme indicateur par défaut pour votre ensemble en cochant la case "is default".

![](/campaign-creator/confidence-set/form-indicator.png)

:::

## Verification

_Vous devez avoir une phase d'annotation pour créer une phase de vérification._ 

Pour créer une phase, cliquez sur l'onglet "Verification".

![](/campaign-creator/new-verification-phase.png)

Puis "Create".
