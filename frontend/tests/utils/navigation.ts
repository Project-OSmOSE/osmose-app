import { Page } from "@playwright/test";
import { Auth } from "./auth";
import { Mock } from "./mock";
import { Dataset, ImportDataset } from "../../src/service/dataset";
import { AnnotationCampaign } from "../../src/service/campaign";
import { LabelSet } from "../../src/service/campaign/label-set";
import { ConfidenceIndicatorSet } from "../../src/service/campaign/confidence-set";
import { AnnotationFileRange } from "../../src/service/campaign/annotation-file-range";

export class Navigation {

  constructor(private page: Page,
              private auth: Auth,
              private mock: Mock) {
  }

  // Pure navigation

  async goHome() {
    await this.page.goto('/app/');
  }

  async goLogin() {
    await this.page.goto('/app/login/');
  }

  async goDatasets(mock?: { datasets?: Dataset[], importDatasets?: ImportDataset[], }) {
    await this.goLogin();
    await this.auth.login();
    await this.mock.mockDatasets(mock?.datasets)
    await this.mock.mockImportDatasetList(mock?.importDatasets)
    await this.page.goto('/app/datasets/');
  }

  async goAnnotationCampaigns(mock?: { campaigns?: AnnotationCampaign[] }) {
    await this.goLogin();
    await this.auth.login();
    await this.mock.mockCampaigns(mock?.campaigns)
    await this.page.goto('/app/annotation-campaign/');
  }

  async goAnnotationCampaignDetail(mock?: {
    campaign?: AnnotationCampaign,
    confidenceSet?: ConfidenceIndicatorSet | null,
    fileRanges?: AnnotationFileRange[]
  }) {
    await this.goLogin();
    await this.auth.login();
    await this.mock.mockCampaigns()
    await this.mock.mockLabelSets()
    await this.mock.mockConfidenceSets(mock?.confidenceSet ? [mock.confidenceSet] : undefined)
    await this.mock.mockFileRangesFiles(mock?.fileRanges)
    await this.page.goto(`/app/annotation-campaign/${ (mock?.campaign ?? Mock.CAMPAIGN).id }/`);
  }

  async goAnnotationCampaignCreate(mock?: {
    datasets?: Dataset[],
    labelSets?: LabelSet[],
    confidenceSets?: ConfidenceIndicatorSet[],
    createdCampaign?: AnnotationCampaign,
    createdFileRanges?: AnnotationFileRange[],
  }) {
    await this.goLogin();
    await this.auth.login();
    await this.mock.mockDatasets(mock?.datasets)
    await this.mock.mockLabelSets(mock?.labelSets)
    await this.mock.mockConfidenceSets(mock?.confidenceSets)
    await this.mock.mockCampaignCreation(mock?.createdCampaign, mock?.createdFileRanges)
    await this.page.goto('/app/annotation-campaign/create/');
  }
}
