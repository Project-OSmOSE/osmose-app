import { Page } from "@playwright/test";
import { Dataset, ImportDataset } from "../../src/service/dataset";
import { AnnotationCampaign } from "../../src/service/campaign";
import { User } from "../../src/service/user";
import { SpectrogramConfiguration } from "../../src/service/dataset/spectrogram-configuration";
import { LabelSet } from "../../src/service/campaign/label-set";
import { ConfidenceIndicator, ConfidenceIndicatorSet } from "../../src/service/campaign/confidence-set";
import { AnnotationFileRange } from "../../src/service/campaign/annotation-file-range";
import { Paginated } from "../../src/service/type";
import { AnnotationFile } from "../../src/service/campaign/annotation-file-range/type";

export class Mock {

  static readonly DATASET_SR: number = 480;
  static readonly SPECTROGRAM_CONFIGURATION: SpectrogramConfiguration = {
    id: -1,
    dataset_sr: Mock.DATASET_SR
  }
  static readonly DATASET: Dataset = {
    id: -1,
    name: 'Test dataset',
    created_at: new Date().toISOString(),
    files_type: ".wav",
    start_date: "2010-08-19",
    end_date: "2010-11-02",
    files_count: 99,
    type: "Coastal audio recordings",
    spectros: [ Mock.SPECTROGRAM_CONFIGURATION ]
  }
  static readonly IMPORT_DATASET: ImportDataset = {
    name: 'Test import dataset',
    dataset: 'Test import dataset',
    dataset_sr: '480',
    path: 'mypath/dataset',
    file_type: ".wav",
    spectro_duration: '3600'
  }

  static readonly ANNOTATOR: User = {
    is_staff: false,
    is_superuser: false,
    id: -1,
    username: 'user',
    email: 'user@user.com',
    first_name: 'User',
    last_name: 'Annotator',
    expertise_level: 'Novice'
  }
  static readonly CAMPAIGN_CREATOR: User = {
    is_staff: false,
    is_superuser: false,
    id: 2,
    username: 'creator',
    email: 'creator@user.com',
    first_name: 'User',
    last_name: 'Creator',
    expertise_level: 'Expert'
  }
  static readonly CLASSIC_LABEL: string = 'Rain';
  static readonly FEATURE_LABEL: string = 'Whistle';
  static readonly LABEL_SET: LabelSet = {
    id: -1,
    name: 'Test label set',
    labels: [ Mock.CLASSIC_LABEL, Mock.FEATURE_LABEL ]
  }
  static readonly NOT_SURE_CONFIDENCE: ConfidenceIndicator = {
    id: -1,
    level: 0,
    isDefault: false,
    label: 'not sure'
  }
  static readonly SURE_CONFIDENCE: ConfidenceIndicator = {
    id: -2,
    level: 1,
    isDefault: true,
    label: 'sure'
  }
  static readonly CONFIDENCE_SET: ConfidenceIndicatorSet = {
    id: -1,
    name: 'Test confidence set',
    desc: 'My test confidence indicator set',
    confidence_indicators: [ Mock.NOT_SURE_CONFIDENCE, Mock.SURE_CONFIDENCE ]
  }
  static readonly CAMPAIGN: AnnotationCampaign = {
    id: -1,
    owner: this.CAMPAIGN_CREATOR.username,
    name: 'Test campaign',
    desc: 'Test campaign description',
    deadline: new Date().toISOString(),
    files_count: 10,
    created_at: new Date().toISOString(),
    label_set: Mock.LABEL_SET.id,
    confidence_indicator_set: Mock.CONFIDENCE_SET.id,
    instructions_url: 'testurl.fr',
    datasets: [ Mock.DATASET.name ],
    spectro_configs: [ Mock.SPECTROGRAM_CONFIGURATION.id ],
    labels_with_acoustic_features: [ Mock.FEATURE_LABEL ],
    usage: 'Create'
  }

  static readonly FILE_RANGE: AnnotationFileRange = {
    id: -1,
    files_count: 2,
    finished_tasks_count: 1,
    first_file_index: -2,
    last_file_index: -1,
    annotator: Mock.ANNOTATOR.id,
    annotation_campaign: Mock.CAMPAIGN.id
  }
  static readonly SUBMITTED_FILE: AnnotationFile = {
    id: -2,
    is_submitted: true,
    dataset_sr: Mock.DATASET_SR,
    dataset_name: Mock.DATASET.name,
    filename: 'File 1'
  }
  static readonly NON_SUBMITTED_FILE: AnnotationFile = {
    id: -1,
    is_submitted: false,
    dataset_sr: Mock.DATASET_SR,
    dataset_name: Mock.DATASET.name,
    filename: 'File 2'
  }

  constructor(private readonly page: Page) {
  }

  async mockUser(user: Partial<User>): Promise<void> {
    await this.page.route(/api\/user\/self\/?/g, route => route.fulfill({
      status: 200,
      json: {
        ...Mock.ANNOTATOR,
        ...user
      }
    }))
  }

  async mockDatasets(json: Dataset[] = [ Mock.DATASET ]): Promise<void> {
    await this.page.route(/\/api\/dataset\/?$/, route => route.fulfill({ status: 200, json }))
    for (const dataset of json) {
      const regex = new RegExp(`/api/dataset/${dataset.id}/?$`)
      await this.page.route(regex, route => route.fulfill({ status: 200, json: dataset }))
    }
  }

  async mockImportDatasetList(json: ImportDataset[] = [ Mock.IMPORT_DATASET ],): Promise<void> {
    await this.page.route(/\/api\/dataset\/list_to_import\/?$/, route => route.fulfill({ status: 200, json }))
  }

  async mockCampaigns(json: AnnotationCampaign[] = [ Mock.CAMPAIGN ]): Promise<void> {
    await this.page.route(/\/api\/annotation-campaign\/?(\?.*)?$/, route => route.fulfill({ status: 200, json }))
    for (const campaign of json) {
      const regex = new RegExp(`/api/annotation-campaign/${campaign.id}/?$`)
      await this.page.route(regex, route => route.fulfill({ status: 200, json: campaign }))
    }
  }

  async mockCampaignCreation(json: AnnotationCampaign = Mock.CAMPAIGN,
                             fileRanges: AnnotationFileRange[] = []): Promise<void> {
    await this.page.route(/\/api\/annotation-campaign\/$/, (route, request) => {
      if (request.method() === 'POST') route.fulfill({ status: 200, json })
    })
    await this.page.route(/\/api\/annotation-file-range\//g, (route, request) => {
      if (request.method() === 'POST') route.fulfill({ status: 200, json: fileRanges })
    })
  }

  async mockLabelSets(json: LabelSet[] = [ Mock.LABEL_SET ]): Promise<void> {
    await this.page.route(/\/api\/label-set\/?(\?.*)?$/, route => route.fulfill({ status: 200, json }))
    for (const set of json) {
      const regex = new RegExp(`/api/label-set/${set.id}/?$`)
      await this.page.route(regex, route => route.fulfill({ status: 200, json: set }))
    }
  }

  async mockConfidenceSets(json: ConfidenceIndicatorSet[] = [ Mock.CONFIDENCE_SET ]): Promise<void> {
    await this.page.route(/\/api\/confidence-indicator\/?(\?.*)?$/, route => route.fulfill({ status: 200, json }))
    for (const set of json) {
      const regex = new RegExp(`/api/confidence-indicator/${set.id}/?$`)
      await this.page.route(regex, route => route.fulfill({ status: 200, json: set }))
    }
  }

  async mockFileRanges(results: AnnotationFileRange[] = [ Mock.FILE_RANGE ]) {
    await this.page.route(/\/api\/annotation-file-range\/?/g, route => route.fulfill({
      status: 200, json: {
        results,
        count: results.length,
      } satisfies Partial<Paginated<AnnotationFileRange>>
    }))
  }

  async mockFileRangesFiles(results: AnnotationFile[] = [ Mock.SUBMITTED_FILE, Mock.NON_SUBMITTED_FILE ]) {
    await this.page.route(/\/api\/annotation-file-range\/campaign\/\d\/files/g, route => route.fulfill({
      status: 200, json: {
        results,
        count: results.length,
      } satisfies Partial<Paginated<AnnotationFile>>
    }))
  }

}