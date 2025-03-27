# Créer une campagne d'annotation

Pour créer une campagne d'annotation, cliquez sur le bouton "New annotation campaign".

![](/campaigns/all-campaigns_campaign-admin.png)

## Informations générales

Vous pouvez remplir les informations générales.

![](/campaign-creator/form-global.png)

- Name : Nom de la campagne. Seul le nom est requis.
- Description : La description peut aider votre annotateur à comprendre l'objectif de cette campagne par exemple.
- Instruction URL : Si vous avez une page web ou un PDF stocké en ligne, vous pouvez indiquer son URL dans le champ «
  Instruction URL ». Elle sera accessible aux annotateurs de la campagne
- Deadline : La date limite pour annoter la campagne sera également accessible aux annotateurs.
- Annotation mode: Le mode d'annotation décrit si la campagne est faite pour créer des annotations ou pour vérifier la
  sortie des détecteurs automatiques.

## Données

Vous pouvez ensuite sélectionner l'ensemble de données à annoter.

![](/campaign-creator/form-data.png)

Vous pourrez choisir une ou plusieurs configurations de spectrogrammes parmi celles disponibles pour le dataset
sélectionné.

## Annotation

Vous pouvez sélectionner le mode d'annotation dont vous avez besoin :

- Create annotations : créer de nouvelles annotations sur une campagne vide
- Check annotations : valider et invalider les annotations, à partir de la sortie d'un détecteur par exemple.

![](/campaign-creator/form-annotation.png)

### Mode création d'annotations

Si vous choisissez le mode "Create annotations", vous devrez sélectionner un ensemble de labels (voir la section
détaillée ci-dessous pour créer un nouvel ensemble de labels).
Vous pouvez également sélectionner un ensemble d'indicateurs de confiance (voir la section détaillée ci-dessous pour
créer un nouvel ensemble d'indicateurs de confiance).

![](/campaign-creator/form-annotation-create.png)

Une fois la sélection effectuée, les informations relatives à l'ensemble de labels s'affichent. Vous pouvez choisir
d'activer les « caractéristiques acoustiques » pour certains labels (cf. labels (
voir [Annotation/Caractéristiques acoustiques](../annotator.md#caracteristiques-acoustiques))

Vous pouvez également choisir d'autoriser les annotations par "point". (Allow annotations of type "Point") (
see [Annotation/Ajouter un point](../annotator.md#ajouter-un-point))

::: details Créer un jeu d'étiquettes

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

## Enregistrer

Vous êtes prêt et pouvez soumettre votre nouvelle campagne en cliquant sur le bouton "Create campaign".
Après avoir soumis votre nouvelle campagne, vous serez redirigé :

- sur la [page de gestion des annotateurs](./manage-annotators.md) pour les campagnes en mode "Create annotations"
- sur la [page des résultats d'importation](./import-results.md) puis sur
  la [page des résultats d'importation](./import-results.md) pour les campagnes en mode "Check annotations"




