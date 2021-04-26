# APLOSE Annotator User Guide

## Application overview

### Login

Login pages allow the user to authenticate to the website.<br />
There is currently no sign in feature: users are created by the website administrators, who send the credentials to the campaign manager or to the users.

![Login screen capture](images/01_login.png)

### Navigation

For data management pages, a menu area is displayed on the left side of the page. It gives access to Datasets overview, Campaigns overview, and a logout feature.

![Navigation area screen capture](images/02_menu.png)

### Campaigns overview

Annotation campaigns page is an overview of all available campaigns for the user currently logged in.<br />
For each campaign, there is a link to the Task list at the end of the line.

![Annotation campaigns screen capture](images/12_campaigns.png)

### Task list

The Annotation Tasks page lists the tasks for a given campaign, for the user currently logged in.

Column | Content
------ | -------
Filename | name of the task file
Dataset | short name of the dataset
Date | when this file was recorded
Duration | duration of the task file
Status | Created if the user hasn’t begun to annotate the file, Finished otherwise
Link | a link to the Audio Annotator page for this task

![Task list screen capture](images/16_campaign_tasks.png)

## Audio annotator

### Overview

![Audio annotator overview](images/21_annotator_overview.png)

This is the main page of the site: it allows to annotate a spectrogram visualization of a sound file.<br />
The spectrogram is labelled with time and frequency axes.

If this task has been annotated and submitted previously, the application will load and display previous annotations. Like new ones, these annotations can be modified or deleted.

The sound file is playable by clicking on the play / pause button under the spectrogram. A thin black playback bar is displayed over the spectrogram.

![Audio annotator play button, axes and playback bar screen capture](images/23_annotator_axes.png)

### Playback rate (only on Firefox)

The speed at which the sound file is played can be changed from a select list displayed (only on Firefox) next to the play button. Available speeds are 0.25x, 0.5x, 1x, 1.5x, 2x, 3x and 4x.<br />
There is no pitch correction so modifying the playback rate also modifies the frequency.

![Audio annotator with playback rate controls screen capture](images/29_annotator_speed.png)

### Control panel / zoom

The control panel allows to change the way the spectrogram is displayed.<br />
With the select list, the user can choose the way the spectrogram was generated among available settings.

A zooming feature is available by two means:

- Clicking / tapping the buttons on the control panel: the spectrogram is centered on the progress bar
- Scrolling over the spectrogram with a mouse or a touch pad: the spectrogram is center on the cursor position

The spectrogram only zooms on time (no zoom on frequency). The zoom is discrete: each zoom level offers pre-computed spectrograms, meaning levels are decided by the creator of the dataset.

![Control panel screen capture](images/22_annotator_resolutions.png)

### Create, tag, select and delete an annotation

To create an annotation, click on the spectrogram and drag over the area containing the feature.<br />
On click / tap release, the annotation is created and selected: it appears in Selected annotation block and in the Annotations list, both below the spectrogram.

![Screen captures of annotation states: during creation / created / tagged](images/24_annotator_annotation.png)

The selected annotation block gives precise details about the annotation: start and end time, min and max frequency. It also list available tags (from the dataset). To tag / untag the annotation, press the matching button. An annotation must have one and only one tag.

![Selected annotation block screen capture](images/25_annotation_selected.png)

The selected annotation can be chosen by clicking on its header on the spectrogram, or its line on the annotation list.<br />
The header also allow playing the sound file only for the duration of the annotation, and deleting the annotation by pressing corresponding buttons.

### Annotation list

All the annotations created by the user for the current task are listed in the annotations list block, sorted by start time.

Table content:

- Start / end time
- Min / max frequency
- Tag, “-” if no tag has been selected yet

Clicking on an annotation selects it (it appears it the selected annotation block and can be tagged).

![Annotations list block screen capture](images/26_annotations_list.png)

### Submit / navigation

The Submit & load next recording button works this way:

- If several annotations are not tagged, it selects the first one, display an error message and stay on this task
- If all annotations are tagged (or if no annotation has been created), it saves them for this task, and loads the next available task
- If there is no next available task, the user is sent back to the task list for this campaign.

![Submit button screen capture](images/27_submit_button.png)

![Error message for untagged annotations screen capture](images/28_submit_error.png)
