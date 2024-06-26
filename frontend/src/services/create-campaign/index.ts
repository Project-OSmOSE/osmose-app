import { useAppSelector } from "@/slices/app.ts";
import { AnnotationMode, Usage } from "@/types/annotations.ts";
import { useAnnotationCampaignAPI } from "@/services/api";
import { useImportAnnotations } from "@/services/create-campaign/import-annotations.ts";

export const useCreateCampaign = () => {
  const campaignAPI = useAnnotationCampaignAPI();
  const {
    usage,
    name,
    description,
    instructionURL,
    deadline,
    labelSet,
    confidenceSet,
    dataset,
    datasetSpectroConfigs,
    annotators,
    annotatorsPerFile,
    detectors
  } = useAppSelector(state => state.createCampaignForm.global);
  const importedAnnotations = useImportAnnotations();

  function submitCampaign(force?: boolean) {
    if (!usage) throw new Error('Missing required field: Annotation mode')
    if (!name) throw new Error('Missing required field: Campaign name')
    if (!dataset) throw new Error('Missing required field: Dataset')
    if (datasetSpectroConfigs.length === 0) throw new Error('Missing required field: Spectrogram configurations')

    const data = {
      force,
      name: name.trim(),
      desc: description?.trim(),
      instructions_url: instructionURL?.trim(),
      deadline: deadline ? deadline.trim() + 'T00:00' : undefined,
      datasets: [dataset.id],
      spectro_configs: datasetSpectroConfigs.map(d => d.id),
      annotators: annotators.map(a => a.id),
      annotation_goal: annotatorsPerFile,
      annotation_scope: AnnotationMode.wholeFile,
    }

    switch (usage) {
      case Usage.create:
        if (!labelSet) throw new Error('Missing required field: Label set')
        return campaignAPI.create({
          ...data,
          usage,
          label_set: labelSet.id,
          confidence_indicator_set: confidenceSet?.id,
        });
      case Usage.check:
        return campaignAPI.create({
          ...data,
          usage,
          detectors: detectors.map(d => ({
            detectorId: d.existingDetector?.id,
            detectorName: d.display_name,
            configurationId: d.existingConfiguration?.id,
            configuration: d.existingConfiguration?.configuration ?? d.editConfiguration!
          })),
          label_set_labels: importedAnnotations.distinctLabels,
          confidence_set_indicators: importedAnnotations.distinctConfidenceIndicators,
          results: importedAnnotations.results
        });
    }
  }

  return {
    submitCampaign
  }
}
