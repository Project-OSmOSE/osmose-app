# View the campaign results

To view the results, go to the desired phase of a campaign, then click on "Detailed progression".

![](/campaign-creator/campaign-detail-actions.png)

![](/campaigns/campaign-detail.png)

All the detail of the campaign can be found here.
For more information about it, read the [Annotation Campaign detail](../campaign.md#campaign-detail) section.

You can access the "Detailed progression" of all annotators.

![](/campaign-creator/annotator-progression.png)

From here, you can then download the results and status CSV files.

### Results

A table containing all annotations and comments left by the campaign annotators.

| Column                              |                   Type                    | Description                                                          |
|-------------------------------------|:-----------------------------------------:|----------------------------------------------------------------------|
| dataset                             |                  string                   | Name of the dataset.                                                 |
| filename                            |                  string                   | Name of the file.                                                    |
| start_time                          |                   float                   | Relative start of the annotation                                     |
| end_time                            |                   float                   | Relative end of the annotation                                       |
| start_frequency                     |                    int                    | Lower frequency of the annotation                                    |
| end_frequency                       |                    int                    | Higher frequency of the annotation                                   |
| annotation                          |                  string                   | Label of the annotation                                              |
| annotator                           |                  string                   | Author of the annotation or comment                                  |
| annotator_expertise                 |         NOVICE / AVERAGE / EXPERT         | Expertise level of the annotator at the time the annotation was made |
| start_datetime                      |                 timestamp                 | Absolute start of the annotation                                     |
| end_datetime                        |                 timestamp                 | Absolute end of the annotation                                       |
| is_box                              |                  boolean                  | Either the annotation is a box or a weak annotation                  |
| confidence_indicator_label          |                  string                   | The name of the level of confidence (if exists)                      |
| confidence_indicator_level          |          string<br/>[int]/[int]           | The level of confidence on the maximum level available (if exists)   |
| comments                            |                  string                   | Comment left by the annotator.                                       |
| signal_quality                      |                GOOD / BAD                 | If the signal is sufficiently qualitative to specify its features    |
| signal_start_frequency              |                    int                    | Frequency at start of signal (in Hz)                                 |
| signal_end_frequency                |                    int                    | Frequency at the end of the signal (in Hz))                          |
| signal_relative_max_frequency_count |                    int                    | Number of relative maxima                                            |
| signal_relative_min_frequency_count |                    int                    | Number of relative minimums                                          |
| signal_steps_count                  |                    int                    | Number of steps in the signal                                        |
| signal_has_harmonics                |                  boolean                  | If the signal contains harmonics                                     |
| signal_trend                        | FLAT / ASCENDING / DESCENDING / MODULATED | General trend of the signal                                          |

### Status

A table indicating the submission status for all files and by all annotators.

| Column       |                  Type                  | Description                                                      |
|--------------|:--------------------------------------:|------------------------------------------------------------------|
| dataset      |                 string                 | Name of the dataset.                                             |
| filename     |                 string                 | Name of the file.                                                |
| [Annotators] | UNASSIGNED <br/>CREATED <br/> FINISHED | State of submission of the annotator (column) on the file (line) |
