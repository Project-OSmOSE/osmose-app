# Voir les résultats de la campagne

Pour visualiser les résultats, vous devez accéder à la phase souhaitée d'une campagne, puis cliquer sur "Detailed progression".

![](/campaign-creator/campaign-detail-actions.png)

![](/campaign-creator/annotator-progression.png)

À partir de là, vous pouvez télécharger les fichiers CSV des résultats et du statut.

### Résultats

Un tableau contenant toutes les annotations et tous les commentaires laissés par les annotateurs de la campagne.

| Colonne                             |                   Type                    | Description                                                              |
|-------------------------------------|:-----------------------------------------:|--------------------------------------------------------------------------|
| dataset                             |                  string                   | Nom du dataset                                                           |
| filename                            |                  string                   | Nom du fichier                                                           |
| start_time                          |                   float                   | Début relatif de l'annotation                                            |
| end_time                            |                   float                   | Fin relative de l'annotation                                             |
| start_frequency                     |                    int                    | Fréquence minimum de l'annotation                                        |
| end_frequency                       |                    int                    | Fréquence maximum de l'annotation                                        |
| annotation                          |                  string                   | Label de l'annotation                                                    |
| annotator                           |                  string                   | Auteur de l'annotation ou du commentaire                                 |
| annotator_expertise                 |         NOVICE / AVERAGE / EXPERT         | Niveau d'expertise de l'annotateur au moment où l'annotation a été faite |
| start_datetime                      |                 timestamp                 | Début absolut de l'annotation                                            |
| end_datetime                        |                 timestamp                 | Fin absolue de l'annotation                                              |
| is_box                              |                  boolean                  | Si l'annotation est une boîte ou une présence                            |
| confidence_indicator_label          |                  string                   | Nom de l'indice de confiance (s'il existe)                               |
| confidence_indicator_level          |          string<br/>[int]/[int]           | Niveau de confiance / Niveau maximum de confiance (s'il existe)          |
| comments                            |                  string                   | Commentaire laissé par l'annotateur                                      |
| signal_quality                      |                GOOD / BAD                 | Si le signal est suffisamment qualitatif pour le préciser                |
| signal_start_frequency              |                    int                    | Fréquence au début du signal (en Hz)                                     |
| signal_end_frequency                |                    int                    | Fréquence à la fin du signal (en Hz)                                     |
| signal_relative_max_frequency_count |                    int                    | Nombre de maxima relatifs                                                |
| signal_relative_min_frequency_count |                    int                    | Nombre de minima relatifs                                                |
| signal_steps_count                  |                    int                    | Nombre de zones planes dans le signal                                    |
| signal_has_harmonics                |                  boolean                  | Si le signal présente des harmoniques                                    |
| signal_trend                        | FLAT / ASCENDING / DESCENDING / MODULATED | Tendance générale du signal                                              |

### Status

Un tableau indiquant l'état de la soumission pour tous les fichiers et par tous les annotateurs.

| Colonne      |                  Type                  | Description                                                      |
|--------------|:--------------------------------------:|------------------------------------------------------------------|
| dataset      |                 string                 | Nom du dataset                                                   |
| filename     |                 string                 | Nom du fichier                                                   |
| [Annotators] | UNASSIGNED <br/>CREATED <br/> FINISHED | State of submission of the annotator (column) on the file (line) |
