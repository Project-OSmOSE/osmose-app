# Importer des annotations

Depuis une phase "Annotation", vous pouvez importer de nouvelles annotations.

![](/campaign-creator/campaign-detail-actions.png)

En haut de la page, cliquez sur le bouton "Import annotations".

### Uploader un fichier CSV

![](/campaign-creator/import-drag-zone.png)

Vous pouvez soit cliquer sur la zone "Import annotations", soit y glisser un fichier. Le fichier doit être un csv avec
les colonnes suivantes :

| Colonne                    |          Type          | Description                                                                                               |
|----------------------------|:----------------------:|-----------------------------------------------------------------------------------------------------------|
| dataset                    |         string         | Nom du dataset. S'il ne correspond pas au dataset de la campagne, vous aurez le choix de le garder ou non |
| start_datetime             |       timestamp        | Début de l'annotation                                                                                     |
| end_datetime               |       timestamp        | Fin de l'annotation                                                                                       |
| start_frequency            |          int           | Fréquence minimum de l'annotation                                                                         |
| end_frequency              |          int           | Fréquence maximum de l'annotation                                                                         |
| annotation                 |         string         | Label de l'annotation                                                                                     |
| annotator                  |         string         | Détecteur aillant créé l'annotation                                                                       |
| is_box                     |        boolean         | Si l'annotation est une boîte ou une présence                                                             |
| confidence_indicator_label |         string         | Nom de l'indice de confiance (s'il existe)                                                                |
| confidence_indicator_level | string<br/>[int]/[int] | Niveau de confiance / Niveau maximum de confiance (s'il existe)                                           |

Dans le cas de présences, la date de début/fin et la fréquence de début/fin doivent être celles du fichier.

### Configurer les détecteurs

Après avoir soumis votre fichier, vous devrez configurer les détecteurs tels qu'ils seront enregistrés dans la base de
données.

![](/campaign-creator/import-detectors.png)

Il vous sera demandé d'affecter les détecteurs du CSV à un détecteur existant ou d'en enregistrer un nouveau (Create).
Ici, vous pouvez également sélectionner uniquement les détecteurs que vous souhaitez vérifier, au cas où le fichier en
contiendrait plusieurs.

Vous pouvez ensuite spécifier chaque configuration de détecteur (existante ou nouvelle).

![](/campaign-creator/import-detectors-configuration.png)

### Submit

Lorsque vous avez terminé, vous pouvez cliquer sur le bouton "Import".
Le téléchargement va commencer. Il sera divisé en tranches de 200 lignes pour faciliter l'import de gros fichiers. Vous
pouvez suivre la progression et une estimation de temps restant est indiqué.

:::info
Si vous rencontrez une erreur, réinitialisez l'importation et chargez un fichier corrigé.
Les annotations ne seront pas dupliquée.
:::
