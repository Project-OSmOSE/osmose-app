# Générer un dataset

Toutes les campagnes d'annotation sont basées sur un jeu de données. Chaque jeu de données doit être importé.

Les jeux de données doivent être placés dans un dossier `datasets`.

## OSEkit <Badge type="tip" text="Recommandé" />

Nous avons développé notre package Python pour manipuler les fichiers audio.
Ce package permet de sortir directement l'ensemble des données dans une structure de fichier qui peut être lue par
APLOSE.

Ce package est disponible sur GitHub : https://github.com/Project-OSmOSE/OSEkit

Vous pouvez également accéder directement à sa documentation : https://project-osmose.github.io/OSEkit/

## Manuellement

Pour créer un jeu de données manuellement, vous devez comprendre la structure de fichier attendue et les fichiers de
métadonnées.

### Structure des fichiers

Le dossier racine est nommé `dataset`.

```
dataset/
├── datasets.csv
├── {Campagne d'acquisition}/
│ ├─── {Dataset}
│ └── ...
├── {Dataset}
└── ...
```

Les dossiers des jeux de données peuvent être situés à la racine ou dans un dossier « Campagne d'acquisition ».
Chaque dossier de jeu de données contient la structure de fichier décrite ci-dessous.

```
.
└── {Dataset}/
    ├── data/
    │   └── audio/
    │       ├── {Spectrogram duration}_{Sample rate}/
    │       │   ├── metadata.csv
    │       │   ├── timestamp.csv
    │       │   ├── {audio file name}.wav
    │       │   └── ...
    │       └── ...
    └── processed/
        └── spectrogram/
            ├── {Spectrogram duration}_{Sample rate}/
            │   ├── {NFFT}_{Window size}_{Overlap}_{frequency scale}/
            │   │   ├── metadata.csv
            │   │   └── image/
            │   │       ├── {audio file name}_{zoom level}_{index in zoom level}.png
            │   │       └── ...
            │   └── ...
            └── ...
```

Tous les spectrogrammes doivent être pré-calculés et disponibles dans le dossier dataset.
Il doit y avoir au moins une image de spectrogramme par fichier audio.

Pour récupérer l'image appropriée dans l'affichage de l'annotateur, APLOSE utilise le nom du fichier audio, le niveau de
zoom et l'index dans le niveau de zoom pour obtenir le nom de l'image.
Les niveaux de zoom augmentent comme une puissance de 2.
Le nom du spectrogramme est très important.

::: details Comprendre le nommage de l'image du spectrogramme
Pour un fichier audio « sound.wav », il doit y avoir au moins une image « sound_1_0.png » : elle correspond au premier
niveau de zoom et à la première (et unique) image.

Pour un deuxième niveau de zoom :

- sound_2_0.png
- sound_2_1.png

Pour un troisième niveau :

- sound_4_0.png
- sound_4_1.png
- sound_4_2.png
- sound_4_3.png

Et ainsi de suite...

:::

### Fichiers de métadonnées

#### datasets.csv

_Situé à ./datasets.csv_

C'est ici qu'APLOSE recherchera de nouveaux jeux de données.
Ce fichier liste l'ensemble des jeux de données disponibles et donne des informations pour récupérer les fichiers audio
et les spectrogrammes.

| Column           |  Type  | Description                                                                                                            |
|------------------|:------:|------------------------------------------------------------------------------------------------------------------------|
| path             | string | Chemin d'accès au dossier racine de l'ensemble de données (par exemple: {Acquisition campaign}/{Dataset} or {Dataset}) |
| dataset          | string | Nom du jeux de données dans APLOSE, ce nom peut être différent du nom du dossier et doit être unique dans APLOSE.      |
| spectro_duration |  int   | Durée des fichiers (en secondes)                                                                                       |
| dataset_sr       |  int   | Fréquence d'échantillonnage (en Hz)                                                                                    |
| file_type        | string | Type de fichiers utilisés (par exemple: .wav)                                                                          |

#### [Audio] metadata.csv

_Situé à ./{Dataset}/data/audio/{Spectrogram duration}\_{Sample rate}/metadata.csv_

Ce fichier décrit les fichiers audio. Il donne des informations sur le processus qu'ils ont suivi.

| Column                      |      Type       | Description                                              |
|-----------------------------|:---------------:|----------------------------------------------------------|
| sample_bits                 | array of string | Sous-types des fichiers (par exemple: ['PCM-16'])        |
| channel_count               |       int       | Nombre de canaux du fichier                              |
| start_date                  |    timestamp    | Début du dataset                                         |
| end_date                    |    timestamp    | Fin du dataset                                           |
| dataset_sr                  |       int       | Fréquence d'échantillonnage des fichiers traités (en Hz) |
| audio_file_dataset_duration |       int       | Durée de chaque fichier (en secondes)                    |
| audio_file_count            |       int       | Nombre de fichiers                                       |

#### [Audio] timestamp.csv

_Situé à ./{Dataset}/data/audio/{Spectrogram duration}\_{Sample rate}/timestamp.csv_

Ce fichier répertorie tous les fichiers audio. APLOSE l'utilise par-dessus la structure des fichiers pour savoir quels
fichiers utiliser.

::: info

Cela signifie que vous pouvez créer un sous-ensemble en supprimant des fichiers de ce CSV.
Ou si vous ne voulez pas écouter d'audio pendant que vous annotez, vous pouvez ajouter ce CSV sans les fichiers wav
associés.

:::

| Column    |   Type    | Description                       |
|-----------|:---------:|-----------------------------------|
| filename  |  string   | Nom des fichiers (avec extension) |
| timestamp | timestamp | Début de l'enregistrement         |

#### [Spectrogram] metadata.csv

_Situé à ./{Dataset}/processed/spectrogram/{Spectrogram duration}\_{Sample rate}/{NFFT}\_{Window
size}\_{Overlap}\_{frequency scale}/metadata.csv_

Ces fichiers décrivent le processus de génération de spectrogrammes.

| Column                        |  Type  | Description                                                                                                                                                           |
|-------------------------------|:------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| dataset_sr                    |  int   | Fréquence d'échantillonnage (en Hz)                                                                                                                                   |
| nfft                          |  int   | Nombre de fenêtres de fréquences de la FFT                                                                                                                            |
| window_size                   |  int   | Nombre d'échantillons audio dans chaque fenêtre de la FFT                                                                                                             |
| overlap                       |  int   | Nombre d'échantillons se chevauchant entre deux fenêtres de la FFT                                                                                                    |
| colormap                      | string | Colormap utilisée pour généré les fichiers                                                                                                                            |
| zoom_level                    |  int   | Nombre de niveaux de zoom disponibles                                                                                                                                 |
| dynamic_min                   |  int   | Limite inférieure de l'échelle des niveaux de bruit (en dB)                                                                                                           |
| dynamic_max                   |  int   | Limite supérieure de l'échelle des niveaux de bruit (en dB)                                                                                                           |
| spectro_duration              |  int   | Durée des spectrogrammes (en secondes)                                                                                                                                |
| data_normalization            | string | Type de normalisation des données (2 valeurs possibles : si les valeurs de sensibilité et de gain sont disponibles, choisir 'instrument' sinon, choisir zscore)       |
| hp_filter_min_freq            |  int   | Fréquence de coupure du filtre passe-haut (en Hz)                                                                                                                     |
| sensitivity_dB                | float  | Sensibilité de l'instrument (en dB)                                                                                                                                   |
| peak_voltage                  | float  | Tension de crête de l'instrument (en volts)                                                                                                                           |
| spectro_normalization         | string | Type de normalisation pour le calcul du spectrogramme (doit être réglé sur density si data_normalization = instrument et sur spectrum si data_normalization = zscore) |
| gain_dB                       |  int   | Gain de l'instrument (en dB)                                                                                                                                          |
| zscore_duration               | string | Durée sur laquelle le niveau de bruit est moyenné dans la configuration zscore (en secondes)                                                                          |
| window_type                   | string | Type de fenêtre d'analyse (ex : 'Hammin', 'Hanning', 'Blackman')                                                                                                      |
| frequency_resolution          | float  | Résolution en fréquence du spectrogramme (en Hz)                                                                                                                      |
| temporal_resolution           | float  | Résolution temporelle du spectrogramme (en secondes)                                                                                                                  |
| audio_file_dataset_overlap    |  int   | Overlap temporel entre chaque fichiers (en secondes)                                                                                                                  |
| custom_frequency_scale        | string | Nom de l'échelle de fréquence à appliquer                                                                                                                             |

<!--@include: ../../parts/frequency-scales.md-->
