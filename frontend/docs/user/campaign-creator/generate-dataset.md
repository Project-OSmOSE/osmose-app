# Generate a dataset

All annotation campaigns are base on a dataset. Each dataset should be imported.

The datasets must be located in a `datasets` folder.


## OSEkit <Badge type="tip" text="Recommended" />

We developed our Python package to manipulate audio files.
This package allows to directly output the dataset in a file structure that can be read by APLOSE.

This package can be found on GitHub: https://github.com/Project-OSmOSE/OSEkit

You can also directly access its documentation: https://project-osmose.github.io/OSEkit/


## Manually

To create a dataset manually you must understand the expected file structure and metadata files.

### File structure

The root folder is named `dataset`.

```
dataset/
├── datasets.csv
├── {Acquisition campaign}/
│   ├── {Dataset}
│   └── ...
├── {Dataset}
└── ...
```

The datasets folder can be located at the root or within an "Acquisition campaign" folder.
Each dataset folder contains the file structure detailed below.

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

All the spectrogram must be pre-processed and available in the dataset folder.
There should be at least one spectrogram image by audio file.

To recover the appropriate image in the annotator display, APLOSE uses the audio file name, the zoom level and the index in the zoom level to get the image name. 
Zoom levels increase as a power of 2.
The naming of the spectrogram is really important.

::: details Understanding the spectrogram image naming
For a "sound.wav" audio file there should be at least a "sound_1_0.png" image: corresponds to the first zoom level and the first (and only) image.

For a second zoom level:
- sound_2_0.png
- sound_2_1.png

For a third level:
- sound_4_0.png
- sound_4_1.png
- sound_4_2.png
- sound_4_3.png

And so on...
:::

### Metadata files

#### datasets.csv
_Located at ./datasets.csv_

This is where APLOSE will search for new datasets. 
This file list the available datasets and give information to recover the audio and spectrogram files.

| Column           |  Type  | Description                                                                                                             |
|------------------|:------:|-------------------------------------------------------------------------------------------------------------------------|
| path             | string | Path from the dataset root folder (ie: {Acquisition campaign}/{Dataset} or {Dataset})                                   |
| dataset          | string | The name to display the dataset in APLOSE, this name can be different from the folder name and must be unique in APLOSE |
| spectro_duration |  int   | The duration of the files (in seconds)                                                                                  |
| dataset_sr       |  int   | The sample rate (in Hz)                                                                                                 |
| file_type        | string | The type of file used (example: .wav)                                                                                   |


#### [Audio] metadata.csv
_Located at ./{Dataset}/data/audio/{Spectrogram duration}\_{Sample rate}/metadata.csv_

This file describe the audio files. It gives information about the process they had.

| Column                      |      Type       | Description                                |
|-----------------------------|:---------------:|--------------------------------------------|
| sample_bits                 | array of string | Files subtypes (example: ['PCM-16'])       |
| channel_count               |       int       | Number of channels in the file             |
| start_date                  |    timestamp    | Start of the dataset                       |
| end_date                    |    timestamp    | End of the dataset                         |
| dataset_sr                  |       int       | Sample rate of the processed files (in Hz) |
| audio_file_dataset_duration |       int       | Duration of each files (in seconds)        |
| audio_file_count            |       int       | Number of files                            |


#### [Audio] timestamp.csv
_Located at ./{Dataset}/data/audio/{Spectrogram duration}\_{Sample rate}/timestamp.csv_

This file lists all the audio files. APLOSE uses it over the file structure to known which files to use.

::: info
This mean you can create a subset by removing files from this CSV.
Or if you don't want to listen audio while annotating, you can add this CSV without the associated wav files.
:::

| Column    |   Type    | Description                           |
|-----------|:---------:|---------------------------------------|
| filename  |  string   | Name of the file (with the extension) |
| timestamp | timestamp | Start of the audio file               |

#### [Spectrogram] metadata.csv
_Located at ./{Dataset}/processed/spectrogram/{Spectrogram duration}\_{Sample rate}/{NFFT}\_{Window size}\_{Overlap}\_{frequency scale}/metadata.csv_

This files describe the spectrogram generation process.

| Column                        |  Type  | Description                                                                                                                                                     |
|-------------------------------|:------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| dataset_sr                    |  int   | Sample rate (in Hz)                                                                                                                                             |
| nfft                          |  int   | Number of frequency bins in the fft                                                                                                                             |
| window_size                   |  int   | Number of audio samples  in each fft bin                                                                                                                        |
| overlap                       |  int   | Number of overlapping samples between two fft bins                                                                                                              |
| colormap                      | string | Colormap used to generate the spectrogram                                                                                                                       |
| zoom_level                    |  int   | Number of available zoom levels                                                                                                                                 |
| dynamic_min                   |  int   | Lower limit of noise level scale (in dB)                                                                                                                        |
| dynamic_max                   |  int   | Upper limit of noise level scale (in dB)                                                                                                                        |
| spectro_duration              |  int   | Duration of the spectrogram (in seconds)                                                                                                                        |
| data_normalization            | string | Type of data normalization (2 possible values :  if the sensitivity and gain values are available chose 'instrument' else, chose zscore)                        |
| hp_filter_min_freq            |  int   | Cut-off frequency of the high pass filter (in Hz)                                                                                                               |
| sensitivity_dB                | float  | Sensitivity of the instrument (in dB)                                                                                                                           |
| peak_voltage                  | float  | Peak voltage of the instrument (in Volt)                                                                                                                        |
| spectro_normalization         | string | Type of normalization for the spectrogram computation (should be set at density if data_normalization = instrument and spectrum if data_normalization = zscore) |
| gain_dB                       |  int   | Gain of the instrument (in dB)                                                                                                                                  |
| zscore_duration               | string | Duration over which noise level is averaged in zscore configuration (in seconds)                                                                                |
| window_type                   | string | Type of analysis window (eg : 'Hammin', 'Hanning', 'Blackman')                                                                                                  |
| frequency_resolution          | float  | Frequency resolution of spectrogram (in Hz)                                                                                                                     |
| temporal_resolution           | float  | Temporal resolution of spectrogram (in seconds)                                                                                                                 |
| audio_file_dataset_overlap    |  int   | Temporal overlap between each spectrogram (in seconds)                                                                                                          |
| custom_frequency_scale        | string | Name of the frequency scale to apply                                                                                                                            |

<!--@include: ../../parts/frequency-scales.md-->
