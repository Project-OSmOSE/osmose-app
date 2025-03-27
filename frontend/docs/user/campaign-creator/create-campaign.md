# Create an annotation campaign

To create a campaign click on the "New annotation campaign" button.

![](/campaigns/all-campaigns_campaign-admin.png)

## Global information

You can fill in the global information.

![](/campaign-creator/form-global.png)

- Only the name is required.
- The description can help your annotator to understand the purpose of this campaign for example.
- If you have web page or a PDF stored online you can give its URL on the "Instruction URL" field. It will be accessible
  to the campaign annotators
- The deadline will also be available to the annotators.
- The annotation mode describe either the campaign is made to create annotation or check automatic detectors output.

## Data

You can then select the dataset to annotate.

![](/campaign-creator/form-data.png)

You will be able to choose one or more spectrogram configuration among the available ones for the selected dataset.

## Annotation

You can select the mode of annotation you need:

- Create annotation: create new annotations on an empty campaign
- Check annotations: validate and invalidate annotations, from a detector output for example

![](/campaign-creator/form-annotation.png)

### Create annotation mode

If you choose the "Create mode" you will need to select a set of labels (read the detailed section below to create a new
label set).
You can also select a confidence indicator set (read the detailed section below to create a new confidence indicator
set).

![](/campaign-creator/form-annotation-create.png)

Once selected, the information about the set are displayed. You can choose to enable "Acoustic features" for some
labels (see [Annotator/Acoustic features](../annotator.md#acoustic-features))

You can also choose to allow "Point" annotations. (see [Annotation/Add a point annotation](../annotator.md#add-a-box-annotation))

::: details Create a label set
Access APLOSEs administration part with the "Admin" link

Look for “Label sets” in the “API” block and click on “Add”

![](/campaign-creator/label-set/nav.png)

You can fill in the form with the name of your set, the owner (you), and select the labels you need for your annotation
campaigns.
If you do not find the desired labels, you can click on the “+” button close to the labels list to create a new label.

![](/campaign-creator/label-set/form.png)

When your form is filled you can save it.
:::

::: details Create a confidence set
Access APLOSEs administration part with the "Admin" link

Look for “Confidence indicator sets” in the “API” block and click on “Add”

![](/campaign-creator/confidence-set/nav-set.png)

You can fill in the form with the name of your set and save it.

![](/campaign-creator/confidence-set/form-set.png)

You can then look for the “Confidence indicators” in the “API” block and “Add” as many indicators as you need.

![](/campaign-creator/confidence-set/nav-indicator.png)

For each indicator you must fill the label, the level and the associated set that you have just created.
You can define an indicator as the default one for your set by checking the “is default” checkbox.

![](/campaign-creator/confidence-set/form-indicator.png)

:::

## Submit

You're all set and can submit your new campaign by clicking on the "Create campaign" button.
After submitting your new campaign, you will be redirected:

- on the [annotator management page](./manage-annotators.md) for "Create annotations" campaigns
- on the [import result page](./import-results.md) and then on
  the [annotator management page](./manage-annotators.md) for "Check annotations" campaigns

