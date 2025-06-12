# Add phases

A phase characterises the work carried out on a campaign. There are two types of phase:

- "Annotation": This type of phase is used to make an initial annotation of the campaign, based on empty spectrograms.
  This type of phase can also be used to import external annotations, for example from automatic detectors.
- "Verification": Verification phases are used to validate/invalidate annotations made in the “Annotation” phase. If a
  user is assigned to both phases, he will not be able to validate his own annotations.

The two phases can take place simultaneously.

## Annotation

To create a phase, click on the "Annotation" tab.

![](/campaign-creator/new-annotation-phase.png)

You will need to fill in the Label set and a confidence indicator set. You can also specify whether the "Point"
annotation is authorised.

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

## Verification

You must have an annotation phase to create a verification phase.

To create a phase, click on the "Verification" tab.

![](/campaign-creator/new-verification-phase.png)

Then "Create".
