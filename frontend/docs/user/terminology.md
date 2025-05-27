### Dataset

It defines a set of audio segments and their preprocessed spectrograms.

### Spectrogram configuration

Each dataset can have multiple preprocessed spectrograms with different configurations. These configurations can be
viewed on APLOSE for annotation.

### Annotation campaign

A campaign refers to the annotations of a dataset with a defined set of labels and tasks. Each campaign is defined by a
name, a dataset and spectrogram configurations. A campaign is made up of phases.

### Phase

A phase characterises the work carried out on a campaign. There are two types of phase:

- "Annotation": This type of phase is used to make an initial annotation of the campaign, based on empty spectrograms.
  This type of phase can also be used to import external annotations, for example from automatic detectors.
- "Verification": Verification phases are used to validate/invalidate annotations made in the “Annotation” phase. If a
  user is assigned to both phases, he will not be able to validate his own annotations.

The two phases can take place simultaneously.

### Annotator

The user that will create annotations on a given annotation campaign.

### Label

A label defining a specific sound. It can define sounds of interest such as the species and their vocalization or a boat
passage.

### Annotation

It defines the assignment of a label in a specific segment. The annotation can be represented as a box within the
segment (i.e. strong detection). It is drawn by the user and must frame the sound of interest. Another possible
representation is the presence of a sound of interest in the whole segment (i.e. weak detection). In APLOSE, the
annotator can also leave a comment and/or express its confidence on any annotation.

### Confidence indicator

An indicator that represents the level of confidence the annotator has in each annotation. This indicator can be
customized, it can be a Boolean value or a level from 0 to 3 for instance.

### Annotation set

The set of tags that can be used in an annotation campaign.

### Confidence indicator set

The set of confidence indicators that can be used in an annotation campaign.

### Task

A task is a file to annotate for a specific annotator. It belongs to a campaign. The status of a task can be one of the
following:

* Unassigned: The segment file is not assigned to the annotator
* Created: The segment is assigned to the annotator, but the annotator has not accessed it
* Finished: The segment is assigned to the annotator and the annotator has submitted its annotations 