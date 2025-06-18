# Campagnes d'annotations

APLOSE regroupe les sessions d'annotation sous le terme de "Annotation Campaign" (campagne d'annotation).
Chaque campagne est liée à un dataset et à un ou plusieurs annotateurs.

Une campagne peut être configurée pour présenter différentes configurations de spectrogrammes, annoter différents label
et même valider des sorties de détecteurs.

## Vue d'ensemble des campagnes

Vous pouvez visualiser toutes vos campagnes sur la page "Annotation campaigns".
![](/campaigns/all-campaigns_user.png)

Vous pouvez rechercher une campagne par son nom ou filtrer la liste par le type de campagne (campaign mode) : créer des
annotations ou vérifier la sortie des détecteurs.

Chaque campagne est décrite par son nom, le jeu de données à annoter, le type (créer des annotations ou vérifier les
sorties de détecteurs).
Votre progression et la progression globale sur la campagne est visible sur chaque carte.

Vous pouvez accéder au détail de la campagne en cliquant sur sa carte.

## Détail de la campagne

![](/campaigns/campaign-detail.png)

### Information sur la campagne

Vous pouvez lire ici l'objectif de la campagne dans sa description (si elle est remplie).

Le panneau latéral droit affiche toutes les informations relatives à la campagne :

| Information               | Description                                                                                                                                            |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| Deadline                  | Date limite d'annotation                                                                                                                               |
| Annotation mode           | Le type de campagne : créer des annotations ou vérifier la sortie des détecteurs                                                                       |
| Dataset                   | Jeu de donnée à annoter                                                                                                                                |
| Acquisition information   | Informations autour de l'acquisition de la donnée : projet, déploiement et équipements utilisés                                                        |
| Spectrogram configuration | Paramètres utilisés pour générer les spectrogrammes disponibles. Ils peuvent être utilisés pour recréer la campagne                                    |
| Audio metadata            | Métadonnées du segmentation audio. Elles peuvent être utilisés pour recréer la campagne                                                                |
| Label set                 | Nom de l'ensemble de labels utilisés pour l'annotation.                                                                                                |
| Confidence indicator set  | Nom de l'ensemble d'indicateurs de de confiance. L'indicateur de confiance permet à l'annotateur de définir son niveau de confiance sur son annotation |
| Detailed progress         | Montre la progression de chaque annotateur sur la campagne                                                                                             |

### Fichiers à annoter

![](/campaigns/phase-detail.png)

Les onglets de détail des phases répertorient les fichiers qui vous ont été attribué pour l'annotation. Vous pouvez rechercher
un fichier spécifique ou n'afficher que les fichiers non soumis ou les fichiers avec annotations, ou filtrer parmi les
labels présents. Vous pouvez également reprendre directement l'annotation (bouton "Resume annotation"), ce qui vous
amènera au premier fichier non soumis.

Le tableau des fichiers contient les colonnes suivantes :

| Column      | Description                                                                                                                                                                        |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Filename    | Nom du fichier                                                                                                                                                                     |
| Date        | Début de l'enregistrement                                                                                                                                                          |
| Duration    | Durée de l'enregistrement                                                                                                                                                          |
| Annotations | Suivant le type de campagne : <br/> - Création d'annotation : nombre d'annotation que vous avez soumis<br/> - Validation de sorties de détecteurs : nombre d'annotations à valider |
| Status      | Vous avez déjà soumis vos annotations ou non                                                                                                                                       |
| Access      | Un accès direct pour [annoter](./annotator) ce fichier                                                                                                                             |

En cliquant sur l'icône de filtre dans l'en-tête du tableau des fichiers, vous pouvez filtrer les fichiers.

#### Filtre sur la date

Vous pouvez filtrer les fichiers compris entre la "minimum date" et la "maximum date".

![](/campaigns/date-filters.png)

#### Filtre sur les annotations

Vous pouvez filtrer sur :
- La présence (With) ou non (Without) d'annotations sur le fichier
- Le label présent sur le fichier
- Le niveau de confiance utilisé sur l'annotation
- La présence (With) ou non (Without) d'annotations avec paramètres acoustiques sur le fichier.

Laisser un filtre à l'état "Unset" le désactive

![](/campaigns/annotations-filters.png)

#### Filtre sur le status

Vous pouvez filtrer sur l'état du fichier, qu'il ait déjà été annoté (Finished) ou pas encore (Created).
Laisser le filtre à l'état "Unset" le désactive

![](/campaigns/status-filters.png)
