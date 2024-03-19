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
    startDate,
    endDate,
    annotationSet,
    confidenceSet,
    dataset,
    datasetSpectroConfigs,
    annotators,
    annotatorsPerFile,
    detectors
  } = useAppSelector(state => state.createCampaignForm.global);
  const importedAnnotations = useImportAnnotations();

  function submitCampaign() {
    if (!usage) throw new Error('Missing required field: Annotation mode')
    if (!name) throw new Error('Missing required field: Campaign name')
    if (!dataset) throw new Error('Missing required field: Dataset')
    if (datasetSpectroConfigs.length === 0) throw new Error('Missing required field: Spectrogram configurations')

    const data = {
      name: name.trim(),
      desc: description?.trim(),
      instructions_url: instructionURL?.trim(),
      start: startDate ? startDate.trim() + 'T00:00' : undefined,
      end: endDate ? endDate.trim() + 'T00:00' : undefined,
      datasets: [dataset.id],
      spectro_configs: datasetSpectroConfigs.map(d => d.id),
      annotators: annotators.map(a => a.id),
      annotation_goal: annotatorsPerFile,
      annotation_scope: AnnotationMode.wholeFile,
    }

    switch (usage) {
      case Usage.create:
        if (!annotationSet) throw new Error('Missing required field: Annotation set')
        return campaignAPI.create({
          ...data,
          usage,
          annotation_set: annotationSet.id,
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
          annotation_set_labels: importedAnnotations.distinctLabels,
          confidence_set_indicators: importedAnnotations.distinctConfidenceIndicators,
          results: importedAnnotations.results
        });
    }
  }

  return {
    submitCampaign
  }
}
