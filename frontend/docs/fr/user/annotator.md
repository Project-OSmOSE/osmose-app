# Annoter

Pour annoter un fichier vous devez accéder à une campagne puis soit sur "Resume annotation" pour reprendre l'annotation,
soit sur le lien d'accès direct à un fichier.

## Page d'annotation

![](/annotator/full_page.png)

Il s'agit de la page principale d'APLOSE. Elle vous permet d'annoter des enregistrements audio grâce à leurs
spectrogrammes.

### Visualisation des spectrogrammes

Le spectrogramme est présenté avec des axes de temps et fréquence.

Un sélecteur situé au-dessus du spectrogramme vous permet de choisir parmi les paramètres FFT disponibles pour votre
spectrogramme. Vous pouvez également utiliser différentes échelles de fréquence.

![](/annotator/spectro-config.png)

<!--@include: ../parts/frequency-scales.md-->

### Zoomer dans le spectrogramme

Une fonction de zoom est disponible, sur le temps uniquement. Vous pouvez zoomer à l'aide des boutons de zoom situés à
côté du sélecteur de configuration de spectrogramme ou à l'aide de la molette de la souris sur le spectrogramme.

![](/annotator/zoom.png)

Le zoom est discret : chaque niveau de zoom offre un spectrogramme pré-calculé, ce qui signifie que les niveaux de zoom
sont décidés par le créateur du jeu de donnée.

### Écouter le fichier audio

Vous pouvez écouter l'enregistrement grâce au bouton play/pause situé sous le spectrogramme (à gauche). Vous pouvez
définir la position temporelle à partir de laquelle vous souhaitez commencer l'écoute en cliquant sur le spectrogramme.

![](/annotator/audio.png)
::: tip Raccourci :keyboard:
La touche “espace” de votre clavier est un raccourci pour lire et mettre en pause le fichier audio
:::
::: warning Attention
Les fichiers ayant un taux d'échantillonnage très élevé peuvent ne pas être compatibles avec votre navigateur.
La limite de compatibilité dépend du navigateur.
Firefox a tendance à avoir la plus large compatibilité.
:::
::: tip Recommendation :bulb:
Utilisez un casque ou des écouteurs pour une meilleure qualité !
:::

À côté du bouton play/pause, vous pouvez choisir la vitesse de lecture (de 0,25x à 4x). Cela vous permet
d'entendre les hautes fréquences en ralentissant la lecture, ou les basses fréquences en l'accélérant.

::: warning Attention

Les fichiers ayant une fréquence d'échantillonnage très élevée peuvent ne pas être compatibles avec votre navigateur.
La limite de compatibilité dépend du navigateur.
Firefox a tendance à avoir la plus grande compatibilité.

:::

## Annoter

Nous distinguons plusieurs types d'annotations :

- Présence : un label est présent sur le fichier
- Boîte : un label est présent à cette zone précise.
- Point : un label est présent à cette position précise.

Pour chaque boîte ou point, une présence est associée au même label.

Dans le cas où vous avez chargé un fichier déjà soumis, vos annotations précédentes vont apparaître et peuvent être
modifiée.

### Ajouter une présence

Vous pouvez ajouter une présence en cochant le label souhaité dans le bloc "Labels".

![](/annotator/labels.png)
::: tip Raccourci :keyboard:
Les touche de 1 à 9 de votre clavier sont des raccourcis vers les labels correspondants dans la liste
:::

Vous pouvez voir toutes vos annotations dans le bloc "Annotations". Dans cet exemple, nous avons les deux labels
sélectionnés.

![](/annotator/annotations.png)

::: info Note

Si vous décochez une présence, toutes les annotations, présence et boîtes, effectuées à l'aide de ce label seront
supprimées.

:::

### Ajouter une boîte

Dans le bloc "Labels", vous pouvez sélectionner le label que vous souhaitez utiliser pour créer votre annotation.

Pour créer une boîte, cliquez sur le spectrogramme et faites glisser sur la zone contenant le son qui vous intéresse.
Lorsque vous relâchez le clic, l'annotation est créée et sélectionnée.

![](/annotator/box.png)
<small>_Ceci est un exemple_</small>

Dans l'en-tête de l'annotation, vous pouvez voir :

- Un bouton de lecture pour écouter votre annotation
- Le label associé
- Un indicateur de commentaire (voir la section commentaire ci-dessous)
- Un bouton pour supprimer votre annotation

Les boîtes sont listées dans le bloc "Annotations".
Chaque boîte se trouve en dessous de la présence correspondante.

![](/annotator/annotations-2.png)

Dans la liste, vous pouvez voir les coordonnées temporelles et fréquentielles de votre annotation.
Ces informations se trouvent également dans le bloc "Selected annotation" (annotation sélectionnée), juste en dessous du
spectrogramme :

![](/annotator/selected-strong.png)

Pour changer le label de votre annotation, vous devez sélectionner l'annotation puis cliquer sur le label approprié dans
le bloc "Labels list".

::: info

Veuillez noter que les boîtes ne peuvent pas être déplacées ou redimensionnées pour le moment.

:::

### Ajouter un point

Pour ajouter un point, sélectionnez le label souhaité puis cliquez sur le spectrogram à l'endroit d'intérêt

![](/annotator/point.png)
<small>_This is an example_</small>

Vous aurez ensuite les mêmes informations que pour une boîte.

### Valider une annotation

En phase de vérification, le bloc "Annotations" contient toutes les données du détecteur ou des annotateurs que vous
devez confirmer ou infirmer.

![](/annotator/check-list.png)

Voici un exemple avec une présence.

Les boutons à droite vous permettent de choisir si vous trouvez l'annotation correcte ou non.
Vous pouvez modifier le label de l'annotation et déplacer ou redimensionner l'annotation incorrecte.

### Ajouter des commentaires

Vous pouvez ajouter des commentaires sur chaque annotation ou sur la tâche.

![](/annotator/comment-bloc.png)

Pour ajouter un commentaire à une annotation, il faut d'abord la sélectionner (dans le bloc "Annotations" ou sur le
spectrogramme).
Pour ajouter un commentaire à la tâche, cliquez sur le bouton "Task Comment" en bas du bloc "Comments".

![](/annotator/comment-indicators.png)

L'icône de commentaire est modifiée en fonction de l'existence d'un commentaire : la bulle est remplie si un commentaire
existe pour l'annotation ou la tâche. Cette information est affichée pour chaque annotation dans le
bloc "Annotations" ou dans son en-tête sur le spectrogramme, et pour la tâche sur le bouton "Task Comment" en bas du
bloc "Comments".

### Spécifier un niveau de confiance

Si votre campagne vous le permet, vous pouvez spécifier le niveau de confiance que vous accordez à votre annotation en
sélectionnant le niveau approprié dans le bloc "Confidence indicator".

![](/annotator/confidence.png)

### Caractéristiques acoustiques

Lorsque vous créez une boîte avec un label permettant des caractéristiques acoustiques, un bloc apparaît à côté de votre
boîte.
Si vous définissez la qualité (Quality) comme bonne (Good), vous pourrez spécifier les caractéristiques acoustiques du
signal.
![](/annotator/acoustic-features.png)

| Champs                 | Unité | Description                                                                                                     |
|------------------------|:-----:|-----------------------------------------------------------------------------------------------------------------|
| Frequency min/max      |  Hz   | Directement lié aux limites de fréquence de la boîte                                                            |
| Frequency range        |  Hz   | [Auto] Différence entre les fréquences maximale et minimale                                                     |
| Frequency start/end    |  Hz   | Fréquence du début/fin du signal. Peut être prélevée directement sur le spectrogramme grâce au bouton "crayon". |
| Duration               |   s   | Durée de la boîte, directement liée aux limites de temps de la boîte                                            |
| Trend                  |       | Tendance générale du signal(Flat, Ascending, Descending or Modulated)                                           |
| Relative min/max count |       | Nombre de fréquences min/max relatives                                                                          | 
| Inflection count       |       | [Auto] Nombre de points d'inflexion : somme des nombres de fréquences minimales et maximales relatives          |
| Steps count            |       | Nombre de portions à fréquence fixe                                                                             |
| Has harmonics          |       | Le signal présente-t-il des harmoniques                                                                         |

Toutes les caractéristiques sont optionnelles.

## Soumission des annotations et navigation

Les boutons de navigation sont situés sous le spectrogramme.

Pour sauvegarder vos modifications, vous devez cliquer sur le bouton "Submit & load next recording" (Soumettre et
charger l'enregistrement suivant) une fois que vous avez terminé.
Le fichier suivant sera automatiquement chargé.

Les boutons fléchés vous permettent de naviguer entre les fichiers

![](/annotator/submit.png)
::: tip Raccourci :keyboard:
La touche “entrée” de votre clavier est un raccourci pour soumettre votre tâche et passer à la tâche suivante. Les
flèches gauche et droite de votre clavier vous permettent de naviguer entre les tâches
:::

:::danger Attention

La simple navigation ne sauvegarde pas les modifications apportées.

:::