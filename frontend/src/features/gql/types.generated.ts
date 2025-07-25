export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  AccessibilityEnum: { input: any; output: any; }
  /**
   * The `BigInt` scalar type represents non-fractional whole numeric values.
   * `BigInt` is not constrained to 32-bit like the `Int` type and thus is a less
   * compatible type.
   */
  BigInt: { input: any; output: any; }
  /**
   * The `Date` scalar type represents a Date
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Date: { input: any; output: any; }
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: { input: any; output: any; }
  /** The `Decimal` scalar type represents a python Decimal. */
  Decimal: { input: any; output: any; }
  FinancingEnum: { input: any; output: any; }
  HydrophoneDirectivityEnum: { input: any; output: any; }
  RoleEnum: { input: any; output: any; }
  SignalPluralityEnum: { input: any; output: any; }
  SignalShapeEnum: { input: any; output: any; }
  StatusEnum: { input: any; output: any; }
  TypeEnum: { input: any; output: any; }
};

export type AcousticDetectorSpecificationNode = Node & {
  __typename?: 'AcousticDetectorSpecificationNode';
  algorithmName?: Maybe<Scalars['String']['output']>;
  detectedLabels: LabelNodeConnection;
  equipmentSet: EquipmentNodeConnection;
  id: Scalars['ID']['output'];
  maxFrequency?: Maybe<Scalars['Int']['output']>;
  minFrequency?: Maybe<Scalars['Int']['output']>;
};


export type AcousticDetectorSpecificationNodeDetectedLabelsArgs = {
  acousticDetectors_Id?: InputMaybe<Scalars['Decimal']['input']>;
  acousticDetectors_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  meanDuration?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gte?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lte?: InputMaybe<Scalars['Float']['input']>;
  minFrequency?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  nickname_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  plurality?: InputMaybe<Scalars['SignalPluralityEnum']['input']>;
  shape?: InputMaybe<Scalars['SignalShapeEnum']['input']>;
  soundId?: InputMaybe<Scalars['ID']['input']>;
  soundId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  sourceId?: InputMaybe<Scalars['ID']['input']>;
  sourceId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type AcousticDetectorSpecificationNodeEquipmentSetArgs = {
  acousticDetectorSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  batterySlotsCount?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gte?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lte?: InputMaybe<Scalars['Int']['input']>;
  batteryType?: InputMaybe<Scalars['String']['input']>;
  batteryType_Icontains?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cables?: InputMaybe<Scalars['String']['input']>;
  cables_Icontains?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationHydrophoneSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationHydrophoneSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationRecorderSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationRecorderSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hydrophoneSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  model?: InputMaybe<Scalars['String']['input']>;
  model_Icontains?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  ownerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  providerId?: InputMaybe<Scalars['ID']['input']>;
  providerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  purchaseDate?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  recorderSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  serialNumber_Icontains?: InputMaybe<Scalars['String']['input']>;
  storageSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AcousticDetectorSpecificationNodeConnection = {
  __typename?: 'AcousticDetectorSpecificationNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<AcousticDetectorSpecificationNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `AcousticDetectorSpecificationNode` and its cursor. */
export type AcousticDetectorSpecificationNodeEdge = {
  __typename?: 'AcousticDetectorSpecificationNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<AcousticDetectorSpecificationNode>;
};

export type AcousticDetectorSpecificationNodeNodeConnection = {
  __typename?: 'AcousticDetectorSpecificationNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<AcousticDetectorSpecificationNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Annotation result node */
export type AnnotationResultNode = Node & {
  __typename?: 'AnnotationResultNode';
  /** Expertise level of the annotator. */
  annotatorExpertiseLevel?: Maybe<ApiAnnotationResultAnnotatorExpertiseLevelChoices>;
  createdAt: Scalars['DateTime']['output'];
  endFrequency?: Maybe<Scalars['Float']['output']>;
  endTime?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  isUpdateOf?: Maybe<AnnotationResultNode>;
  label: ApiLabelNode;
  lastUpdatedAt: Scalars['DateTime']['output'];
  startFrequency?: Maybe<Scalars['Float']['output']>;
  startTime?: Maybe<Scalars['Float']['output']>;
  /** Type of the annotation */
  type: ApiAnnotationResultTypeChoices;
  updatedTo: AnnotationResultNodeConnection;
};


/** Annotation result node */
export type AnnotationResultNodeUpdatedToArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  annotationCampaignPhase_AnnotationCampaign_Datasets_RelatedChannelConfiguration_DeploymentId?: InputMaybe<Scalars['Decimal']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type AnnotationResultNodeConnection = {
  __typename?: 'AnnotationResultNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<AnnotationResultNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `AnnotationResultNode` and its cursor. */
export type AnnotationResultNodeEdge = {
  __typename?: 'AnnotationResultNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<AnnotationResultNode>;
};

export type AnnotationResultNodeNodeConnection = {
  __typename?: 'AnnotationResultNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<AnnotationResultNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An enumeration. */
export enum ApiAnnotationResultAnnotatorExpertiseLevelChoices {
  /** Average */
  A = 'A',
  /** Expert */
  E = 'E',
  /** Novice */
  N = 'N'
}

/** An enumeration. */
export enum ApiAnnotationResultTypeChoices {
  /** Box */
  B = 'B',
  /** Point */
  P = 'P',
  /** Weak */
  W = 'W'
}

/** Label node */
export type ApiLabelNode = Node & {
  __typename?: 'ApiLabelNode';
  annotationresultSet?: Maybe<AnnotationResultNodeNodeConnection>;
  id: Scalars['ID']['output'];
  metadataxLabel?: Maybe<LabelNode>;
  name: Scalars['String']['output'];
};


/** Label node */
export type ApiLabelNodeAnnotationresultSetArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  annotationCampaignPhase_AnnotationCampaign_Datasets_RelatedChannelConfiguration_DeploymentId?: InputMaybe<Scalars['Decimal']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
};

export type ApiLabelNodeConnection = {
  __typename?: 'ApiLabelNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ApiLabelNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `ApiLabelNode` and its cursor. */
export type ApiLabelNodeEdge = {
  __typename?: 'ApiLabelNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ApiLabelNode>;
};

export type ApiLabelNodeNodeConnection = {
  __typename?: 'ApiLabelNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<ApiLabelNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type AudioPropertiesNode = Node & {
  __typename?: 'AudioPropertiesNode';
  /** Duration of the audio file (in seconds). */
  duration: Scalars['Int']['output'];
  file?: Maybe<FileNode>;
  id: Scalars['ID']['output'];
  /** Date and time of the audio file start (in UTC). */
  initialTimestamp: Scalars['DateTime']['output'];
  /** Number of quantization bits used to represent each sample (in bits). If it is different from the channel sampling frequency, re-quantization has been performed. */
  sampleDepth?: Maybe<Scalars['Int']['output']>;
  /** Sampling frequency of the audio file (in Hertz). If it is different from the channel sampling frequency, resampling has been performed. */
  samplingFrequency: Scalars['Int']['output'];
};

export type AudioPropertiesNodeNodeConnection = {
  __typename?: 'AudioPropertiesNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<AudioPropertiesNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type AuthorNode = Node & {
  __typename?: 'AuthorNode';
  bibliography: BibliographyNode;
  contact?: Maybe<ContactNode>;
  /** The ID of the object */
  id: Scalars['ID']['output'];
  institutions: InstitutionNodeConnection;
  order: Scalars['Int']['output'];
};


export type AuthorNodeInstitutionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  bibliographyAuthors_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownedEquipments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  ownedPlatforms_Id?: InputMaybe<Scalars['Decimal']['input']>;
  performedMaintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  providedEquipments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  providedPlatforms_Id?: InputMaybe<Scalars['Decimal']['input']>;
  roles_Id?: InputMaybe<Scalars['Decimal']['input']>;
};

export type AuthorNodeConnection = {
  __typename?: 'AuthorNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<AuthorNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `AuthorNode` and its cursor. */
export type AuthorNodeEdge = {
  __typename?: 'AuthorNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<AuthorNode>;
};

export type AuthorNodeNodeConnection = {
  __typename?: 'AuthorNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<AuthorNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type BibliographyArticleNode = Node & {
  __typename?: 'BibliographyArticleNode';
  articleNb?: Maybe<Scalars['Int']['output']>;
  bibliography?: Maybe<BibliographyNode>;
  id: Scalars['ID']['output'];
  issueNb?: Maybe<Scalars['Int']['output']>;
  /** Required for an article */
  journal: Scalars['String']['output'];
  pagesFrom?: Maybe<Scalars['Int']['output']>;
  pagesTo?: Maybe<Scalars['Int']['output']>;
  volumes?: Maybe<Scalars['String']['output']>;
};

export type BibliographyConferenceNode = Node & {
  __typename?: 'BibliographyConferenceNode';
  bibliography: BibliographyNodeConnection;
  conferenceAbstractBookUrl?: Maybe<Scalars['String']['output']>;
  /** Required for a conference (format: {City}, {Country}) */
  conferenceLocation: Scalars['String']['output'];
  /** Required for a conference */
  conferenceName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};


export type BibliographyConferenceNodeBibliographyArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  doi?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  publicationDate?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['StatusEnum']['input']>;
  tags_Name?: InputMaybe<Scalars['String']['input']>;
  tags_Name_In?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_Icontains?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['TypeEnum']['input']>;
};

export type BibliographyNode = Node & {
  __typename?: 'BibliographyNode';
  /** Each information is dedicated to one file. */
  articleInformation?: Maybe<BibliographyArticleNode>;
  authors: AuthorNodeConnection;
  conferenceInformation?: Maybe<BibliographyConferenceNode>;
  doi?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Each information is dedicated to one file. */
  posterInformation?: Maybe<BibliographyPosterNode>;
  /** Required for any published bibliography */
  publicationDate?: Maybe<Scalars['Date']['output']>;
  relatedLabels: LabelNodeConnection;
  relatedProjects: ProjectNodeConnection;
  relatedSounds: SoundNodeConnection;
  relatedSources: SourceNodeConnection;
  /** Each information is dedicated to one file. */
  softwareInformation?: Maybe<BibliographySoftwareNode>;
  status?: Maybe<Scalars['StatusEnum']['output']>;
  tags: TagNodeConnection;
  title: Scalars['String']['output'];
  type: Scalars['TypeEnum']['output'];
};


export type BibliographyNodeAuthorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  bibliographyId?: InputMaybe<Scalars['ID']['input']>;
  bibliographyId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contactId?: InputMaybe<Scalars['ID']['input']>;
  contactId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institutions?: InputMaybe<Scalars['Decimal']['input']>;
  institutions_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  order_Gt?: InputMaybe<Scalars['Int']['input']>;
  order_Gte?: InputMaybe<Scalars['Int']['input']>;
  order_Lt?: InputMaybe<Scalars['Int']['input']>;
  order_Lte?: InputMaybe<Scalars['Int']['input']>;
};


export type BibliographyNodeRelatedLabelsArgs = {
  acousticDetectors_Id?: InputMaybe<Scalars['Decimal']['input']>;
  acousticDetectors_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  meanDuration?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gte?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lte?: InputMaybe<Scalars['Float']['input']>;
  minFrequency?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  nickname_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  plurality?: InputMaybe<Scalars['SignalPluralityEnum']['input']>;
  shape?: InputMaybe<Scalars['SignalShapeEnum']['input']>;
  soundId?: InputMaybe<Scalars['ID']['input']>;
  soundId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  sourceId?: InputMaybe<Scalars['ID']['input']>;
  sourceId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type BibliographyNodeRelatedProjectsArgs = {
  accessibility?: InputMaybe<Scalars['AccessibilityEnum']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  campaigns_Id?: InputMaybe<Scalars['Decimal']['input']>;
  campaigns_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  doi?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['Date']['input']>;
  endDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  endDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  endDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  endDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  financing?: InputMaybe<Scalars['FinancingEnum']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  projectGoal?: InputMaybe<Scalars['String']['input']>;
  projectGoal_Icontains?: InputMaybe<Scalars['String']['input']>;
  projectType?: InputMaybe<Scalars['Decimal']['input']>;
  projectType_Id?: InputMaybe<Scalars['Decimal']['input']>;
  projectType_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  sites_Id?: InputMaybe<Scalars['Decimal']['input']>;
  sites_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  startDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  startDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  startDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  startDate_Lte?: InputMaybe<Scalars['Date']['input']>;
};


export type BibliographyNodeRelatedSoundsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  codeName?: InputMaybe<Scalars['String']['input']>;
  codeName_Icontains?: InputMaybe<Scalars['String']['input']>;
  englishName?: InputMaybe<Scalars['String']['input']>;
  englishName_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  frenchName?: InputMaybe<Scalars['String']['input']>;
  frenchName_Icontains?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  labels_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  taxon?: InputMaybe<Scalars['String']['input']>;
  taxon_Icontains?: InputMaybe<Scalars['String']['input']>;
};


export type BibliographyNodeRelatedSourcesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  codeName?: InputMaybe<Scalars['String']['input']>;
  codeName_Icontains?: InputMaybe<Scalars['String']['input']>;
  englishName?: InputMaybe<Scalars['String']['input']>;
  englishName_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  frenchName?: InputMaybe<Scalars['String']['input']>;
  frenchName_Icontains?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  labels_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latinName?: InputMaybe<Scalars['String']['input']>;
  latinName_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  taxon?: InputMaybe<Scalars['String']['input']>;
  taxon_Icontains?: InputMaybe<Scalars['String']['input']>;
};


export type BibliographyNodeTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type BibliographyNodeConnection = {
  __typename?: 'BibliographyNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<BibliographyNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `BibliographyNode` and its cursor. */
export type BibliographyNodeEdge = {
  __typename?: 'BibliographyNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<BibliographyNode>;
};

export type BibliographyNodeNodeConnection = {
  __typename?: 'BibliographyNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<BibliographyNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type BibliographyPosterNode = Node & {
  __typename?: 'BibliographyPosterNode';
  bibliography?: Maybe<BibliographyNode>;
  id: Scalars['ID']['output'];
  posterUrl?: Maybe<Scalars['String']['output']>;
};

export type BibliographySoftwareNode = Node & {
  __typename?: 'BibliographySoftwareNode';
  bibliography?: Maybe<BibliographyNode>;
  id: Scalars['ID']['output'];
  /** Required for a software */
  publicationPlace: Scalars['String']['output'];
  repositoryUrl?: Maybe<Scalars['String']['output']>;
};

export type CampaignNode = Node & {
  __typename?: 'CampaignNode';
  /** Campaign during which the instrument was deployed. */
  deployments: DeploymentNodeConnection;
  id: Scalars['ID']['output'];
  /** Name of the campaign during which the instrument was deployed. */
  name: Scalars['String']['output'];
  /** Project associated to this campaign */
  project: ProjectNode;
};


export type CampaignNodeDeploymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  bathymetricDepth?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Gt?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Gte?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Lt?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Lte?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  campaignId?: InputMaybe<Scalars['ID']['input']>;
  campaignId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  deploymentDate?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentVessel?: InputMaybe<Scalars['String']['input']>;
  deploymentVessel_Icontains?: InputMaybe<Scalars['String']['input']>;
  description_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  mobilePositions_Id?: InputMaybe<Scalars['Decimal']['input']>;
  mobilePositions_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  projectId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  project_WebsiteProject_Id?: InputMaybe<Scalars['Decimal']['input']>;
  recoveryDate?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryVessel?: InputMaybe<Scalars['String']['input']>;
  recoveryVessel_Icontains?: InputMaybe<Scalars['String']['input']>;
  siteId?: InputMaybe<Scalars['ID']['input']>;
  siteId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type CampaignNodeConnection = {
  __typename?: 'CampaignNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<CampaignNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `CampaignNode` and its cursor. */
export type CampaignNodeEdge = {
  __typename?: 'CampaignNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<CampaignNode>;
};

export type CampaignNodeNodeConnection = {
  __typename?: 'CampaignNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<CampaignNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ChannelConfigurationDetectorSpecificationNode = Node & {
  __typename?: 'ChannelConfigurationDetectorSpecificationNode';
  channelConfiguration?: Maybe<ChannelConfigurationNode>;
  configuration?: Maybe<Scalars['String']['output']>;
  detector: EquipmentNode;
  filter?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  labels: LabelNodeConnection;
  /** Maximum frequency (in Hertz). */
  maxFrequency?: Maybe<Scalars['Int']['output']>;
  /** Minimum frequency (in Hertz). */
  minFrequency?: Maybe<Scalars['Int']['output']>;
  outputFormats: FileFormatNodeConnection;
};


export type ChannelConfigurationDetectorSpecificationNodeLabelsArgs = {
  acousticDetectors_Id?: InputMaybe<Scalars['Decimal']['input']>;
  acousticDetectors_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  meanDuration?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gte?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lte?: InputMaybe<Scalars['Float']['input']>;
  minFrequency?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  nickname_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  plurality?: InputMaybe<Scalars['SignalPluralityEnum']['input']>;
  shape?: InputMaybe<Scalars['SignalShapeEnum']['input']>;
  soundId?: InputMaybe<Scalars['ID']['input']>;
  soundId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  sourceId?: InputMaybe<Scalars['ID']['input']>;
  sourceId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type ChannelConfigurationDetectorSpecificationNodeOutputFormatsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationRecorderSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationRecorderSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  files_Id?: InputMaybe<Scalars['Decimal']['input']>;
  files_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type ChannelConfigurationDetectorSpecificationNodeConnection = {
  __typename?: 'ChannelConfigurationDetectorSpecificationNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ChannelConfigurationDetectorSpecificationNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `ChannelConfigurationDetectorSpecificationNode` and its cursor. */
export type ChannelConfigurationDetectorSpecificationNodeEdge = {
  __typename?: 'ChannelConfigurationDetectorSpecificationNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ChannelConfigurationDetectorSpecificationNode>;
};

export type ChannelConfigurationDetectorSpecificationNodeNodeConnection = {
  __typename?: 'ChannelConfigurationDetectorSpecificationNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<ChannelConfigurationDetectorSpecificationNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ChannelConfigurationNode = Node & {
  __typename?: 'ChannelConfigurationNode';
  /** Boolean indicating if the record is continuous (1) or has a duty cycle (0). */
  continuous?: Maybe<Scalars['Boolean']['output']>;
  deployment: DeploymentNode;
  /** Each specification is dedicated to one file. */
  detectorSpecification?: Maybe<ChannelConfigurationDetectorSpecificationNode>;
  /** If it's not Continuous, time length (in second) during which the recorder is off. */
  dutyCycleOff?: Maybe<Scalars['Int']['output']>;
  /** If it's not Continuous, time length (in second) during which the recorder is on. */
  dutyCycleOn?: Maybe<Scalars['Int']['output']>;
  extraInformation?: Maybe<Scalars['String']['output']>;
  files: FileNodeConnection;
  /** Harvest stop date at which the channel configuration finished to record in (in UTC). */
  harvestEndingDate?: Maybe<Scalars['DateTime']['output']>;
  /** Harvest start date at which the channel configuration was idle to record (in UTC). */
  harvestStartingDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  /** Immersion depth of instrument (in positive meters). */
  instrumentDepth?: Maybe<Scalars['Int']['output']>;
  /** Each specification is dedicated to one file. */
  recorderSpecification?: Maybe<ChannelConfigurationRecorderSpecificationNode>;
  storages: EquipmentNodeConnection;
  timezone?: Maybe<Scalars['String']['output']>;
};


export type ChannelConfigurationNodeFilesArgs = {
  accessibility?: InputMaybe<Scalars['AccessibilityEnum']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  audioPropertiesId?: InputMaybe<Scalars['ID']['input']>;
  audioPropertiesId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  detectionPropertiesId?: InputMaybe<Scalars['ID']['input']>;
  detectionPropertiesId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  fileSize?: InputMaybe<Scalars['BigInt']['input']>;
  fileSize_Gt?: InputMaybe<Scalars['BigInt']['input']>;
  fileSize_Gte?: InputMaybe<Scalars['BigInt']['input']>;
  fileSize_Lt?: InputMaybe<Scalars['BigInt']['input']>;
  fileSize_Lte?: InputMaybe<Scalars['BigInt']['input']>;
  filename?: InputMaybe<Scalars['String']['input']>;
  filename_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  format?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  storageLocation?: InputMaybe<Scalars['String']['input']>;
  storageLocation_Icontains?: InputMaybe<Scalars['String']['input']>;
};


export type ChannelConfigurationNodeStoragesArgs = {
  acousticDetectorSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  batterySlotsCount?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gte?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lte?: InputMaybe<Scalars['Int']['input']>;
  batteryType?: InputMaybe<Scalars['String']['input']>;
  batteryType_Icontains?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cables?: InputMaybe<Scalars['String']['input']>;
  cables_Icontains?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationHydrophoneSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationHydrophoneSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationRecorderSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationRecorderSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hydrophoneSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  model?: InputMaybe<Scalars['String']['input']>;
  model_Icontains?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  ownerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  providerId?: InputMaybe<Scalars['ID']['input']>;
  providerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  purchaseDate?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  recorderSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  serialNumber_Icontains?: InputMaybe<Scalars['String']['input']>;
  storageSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ChannelConfigurationNodeConnection = {
  __typename?: 'ChannelConfigurationNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ChannelConfigurationNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `ChannelConfigurationNode` and its cursor. */
export type ChannelConfigurationNodeEdge = {
  __typename?: 'ChannelConfigurationNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ChannelConfigurationNode>;
};

export type ChannelConfigurationNodeNodeConnection = {
  __typename?: 'ChannelConfigurationNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<ChannelConfigurationNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ChannelConfigurationRecorderSpecificationNode = Node & {
  __typename?: 'ChannelConfigurationRecorderSpecificationNode';
  channelConfiguration?: Maybe<ChannelConfigurationNode>;
  /** Name of the channel used for recording. */
  channelName?: Maybe<Scalars['String']['output']>;
  /** Gain of the channel (recorder), with correction factors if applicable, without hydrophone sensibility (in dB). If end-to-end calibration with hydrophone sensibility, set it in Sensitivity and set Gain to 0 dB.<br>Gain G of the channel such that : data(uPa) = data(volt)*10^((-Sh-G)/20). See Sensitivity for Sh definition. */
  gain: Scalars['Float']['output'];
  hydrophone: EquipmentNode;
  id: Scalars['ID']['output'];
  recorder: EquipmentNode;
  recordingFormats: FileFormatNodeConnection;
  /** Number of quantization bits used to represent each sample by the recorder channel (in bits). */
  sampleDepth: Scalars['Int']['output'];
  /** Sampling frequency of the recording channel (in Hertz). */
  samplingFrequency: Scalars['Int']['output'];
};


export type ChannelConfigurationRecorderSpecificationNodeRecordingFormatsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationRecorderSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationRecorderSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  files_Id?: InputMaybe<Scalars['Decimal']['input']>;
  files_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type ChannelConfigurationRecorderSpecificationNodeConnection = {
  __typename?: 'ChannelConfigurationRecorderSpecificationNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ChannelConfigurationRecorderSpecificationNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `ChannelConfigurationRecorderSpecificationNode` and its cursor. */
export type ChannelConfigurationRecorderSpecificationNodeEdge = {
  __typename?: 'ChannelConfigurationRecorderSpecificationNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ChannelConfigurationRecorderSpecificationNode>;
};

export type ChannelConfigurationRecorderSpecificationNodeNodeConnection = {
  __typename?: 'ChannelConfigurationRecorderSpecificationNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<ChannelConfigurationRecorderSpecificationNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ContactNode = Node & {
  __typename?: 'ContactNode';
  authors: AuthorNodeConnection;
  currentInstitutions: InstitutionNodeConnection;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  mail?: Maybe<Scalars['String']['output']>;
  performedMaintenances: MaintenanceNodeConnection;
  roles: ContactRoleNodeConnection;
  website?: Maybe<Scalars['String']['output']>;
};


export type ContactNodeAuthorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  bibliographyId?: InputMaybe<Scalars['ID']['input']>;
  bibliographyId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contactId?: InputMaybe<Scalars['ID']['input']>;
  contactId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institutions?: InputMaybe<Scalars['Decimal']['input']>;
  institutions_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  order_Gt?: InputMaybe<Scalars['Int']['input']>;
  order_Gte?: InputMaybe<Scalars['Int']['input']>;
  order_Lt?: InputMaybe<Scalars['Int']['input']>;
  order_Lte?: InputMaybe<Scalars['Int']['input']>;
};


export type ContactNodeCurrentInstitutionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  bibliographyAuthors_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownedEquipments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  ownedPlatforms_Id?: InputMaybe<Scalars['Decimal']['input']>;
  performedMaintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  providedEquipments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  providedPlatforms_Id?: InputMaybe<Scalars['Decimal']['input']>;
  roles_Id?: InputMaybe<Scalars['Decimal']['input']>;
};


export type ContactNodePerformedMaintenancesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['Date']['input']>;
  date_Gt?: InputMaybe<Scalars['Date']['input']>;
  date_Gte?: InputMaybe<Scalars['Date']['input']>;
  date_Lt?: InputMaybe<Scalars['Date']['input']>;
  date_Lte?: InputMaybe<Scalars['Date']['input']>;
  equipmentId?: InputMaybe<Scalars['ID']['input']>;
  equipmentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintainerId?: InputMaybe<Scalars['ID']['input']>;
  maintainerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  maintainerInstitutionId?: InputMaybe<Scalars['ID']['input']>;
  maintainerInstitutionId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  typeId?: InputMaybe<Scalars['ID']['input']>;
  typeId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type ContactNodeRolesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  contact_FirstName?: InputMaybe<Scalars['String']['input']>;
  contact_FirstName_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contact_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contact_LastName?: InputMaybe<Scalars['String']['input']>;
  contact_LastName_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Mail?: InputMaybe<Scalars['String']['input']>;
  contact_Mail_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Website?: InputMaybe<Scalars['String']['input']>;
  contact_Website_Icontains?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institution_Id?: InputMaybe<Scalars['Decimal']['input']>;
  institution_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institution_Mail?: InputMaybe<Scalars['String']['input']>;
  institution_Mail_Icontains?: InputMaybe<Scalars['String']['input']>;
  institution_Name?: InputMaybe<Scalars['String']['input']>;
  institution_Name_Icontains?: InputMaybe<Scalars['String']['input']>;
  institution_Website?: InputMaybe<Scalars['String']['input']>;
  institution_Website_Icontains?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  projects_Id?: InputMaybe<Scalars['Decimal']['input']>;
  projects_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  role?: InputMaybe<Scalars['RoleEnum']['input']>;
};

export type ContactNodeConnection = {
  __typename?: 'ContactNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ContactNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `ContactNode` and its cursor. */
export type ContactNodeEdge = {
  __typename?: 'ContactNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ContactNode>;
};

export type ContactNodeNodeConnection = {
  __typename?: 'ContactNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<ContactNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ContactRoleNode = Node & {
  __typename?: 'ContactRoleNode';
  contact?: Maybe<ContactNode>;
  /** Contacts related to the deployment. */
  deployments: DeploymentNodeConnection;
  id: Scalars['ID']['output'];
  institution?: Maybe<InstitutionNode>;
  /** Should have at least one 'Main Contact' */
  projects: ProjectNodeConnection;
  role?: Maybe<Scalars['RoleEnum']['output']>;
};


export type ContactRoleNodeDeploymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  bathymetricDepth?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Gt?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Gte?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Lt?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Lte?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  campaignId?: InputMaybe<Scalars['ID']['input']>;
  campaignId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  deploymentDate?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentVessel?: InputMaybe<Scalars['String']['input']>;
  deploymentVessel_Icontains?: InputMaybe<Scalars['String']['input']>;
  description_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  mobilePositions_Id?: InputMaybe<Scalars['Decimal']['input']>;
  mobilePositions_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  projectId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  project_WebsiteProject_Id?: InputMaybe<Scalars['Decimal']['input']>;
  recoveryDate?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryVessel?: InputMaybe<Scalars['String']['input']>;
  recoveryVessel_Icontains?: InputMaybe<Scalars['String']['input']>;
  siteId?: InputMaybe<Scalars['ID']['input']>;
  siteId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type ContactRoleNodeProjectsArgs = {
  accessibility?: InputMaybe<Scalars['AccessibilityEnum']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  campaigns_Id?: InputMaybe<Scalars['Decimal']['input']>;
  campaigns_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  doi?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['Date']['input']>;
  endDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  endDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  endDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  endDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  financing?: InputMaybe<Scalars['FinancingEnum']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  projectGoal?: InputMaybe<Scalars['String']['input']>;
  projectGoal_Icontains?: InputMaybe<Scalars['String']['input']>;
  projectType?: InputMaybe<Scalars['Decimal']['input']>;
  projectType_Id?: InputMaybe<Scalars['Decimal']['input']>;
  projectType_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  sites_Id?: InputMaybe<Scalars['Decimal']['input']>;
  sites_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  startDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  startDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  startDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  startDate_Lte?: InputMaybe<Scalars['Date']['input']>;
};

export type ContactRoleNodeConnection = {
  __typename?: 'ContactRoleNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ContactRoleNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `ContactRoleNode` and its cursor. */
export type ContactRoleNodeEdge = {
  __typename?: 'ContactRoleNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ContactRoleNode>;
};

export type ContactRoleNodeNodeConnection = {
  __typename?: 'ContactRoleNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<ContactRoleNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type DeleteSoundMutation = {
  __typename?: 'DeleteSoundMutation';
  ok?: Maybe<Scalars['Boolean']['output']>;
};

export type DeleteSourceMutation = {
  __typename?: 'DeleteSourceMutation';
  ok?: Maybe<Scalars['Boolean']['output']>;
};

export type DeploymentMobilePositionNode = Node & {
  __typename?: 'DeploymentMobilePositionNode';
  /** Datetime for the mobile platform position */
  datetime: Scalars['DateTime']['output'];
  /** Related deployment */
  deployment: DeploymentNode;
  /** Hydrophone depth of the mobile platform (In positive meters) */
  depth: Scalars['Float']['output'];
  /** Heading of the mobile platform */
  heading?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  /** Latitude of the mobile platform */
  latitude: Scalars['Float']['output'];
  /** Longitude of the mobile platform */
  longitude: Scalars['Float']['output'];
  /** Pitch of the mobile platform */
  pitch?: Maybe<Scalars['Float']['output']>;
  /** Roll of the mobile platform */
  roll?: Maybe<Scalars['Float']['output']>;
};

export type DeploymentMobilePositionNodeConnection = {
  __typename?: 'DeploymentMobilePositionNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<DeploymentMobilePositionNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `DeploymentMobilePositionNode` and its cursor. */
export type DeploymentMobilePositionNodeEdge = {
  __typename?: 'DeploymentMobilePositionNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<DeploymentMobilePositionNode>;
};

export type DeploymentMobilePositionNodeNodeConnection = {
  __typename?: 'DeploymentMobilePositionNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<DeploymentMobilePositionNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type DeploymentNode = Node & {
  __typename?: 'DeploymentNode';
  /** Underwater depth of ocean floor at the platform position (in positive meters). */
  bathymetricDepth?: Maybe<Scalars['Int']['output']>;
  /** Campaign during which the instrument was deployed. */
  campaign?: Maybe<CampaignNode>;
  channelConfigurations: ChannelConfigurationNodeConnection;
  /** Contacts related to the deployment. */
  contacts: ContactRoleNodeConnection;
  /** Date and time at which the measurement system was deployed in UTC. */
  deploymentDate?: Maybe<Scalars['DateTime']['output']>;
  /** Name of the vehicle associated with the deployment. */
  deploymentVessel?: Maybe<Scalars['String']['output']>;
  /** Optional description of deployment and recovery conditions (weather, technical issues,...). */
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Latitude of the platform position (WGS84 decimal degrees). */
  latitude: Scalars['Float']['output'];
  /** Longitude of the platform position (WGS84 decimal degree). */
  longitude: Scalars['Float']['output'];
  /** Related deployment */
  mobilePositions: DeploymentMobilePositionNodeConnection;
  /** Name of the deployment. */
  name?: Maybe<Scalars['String']['output']>;
  /** Support of the deployed instruments */
  platform?: Maybe<PlatformNode>;
  /** Project associated to this deployment */
  project: ProjectNode;
  /** Date and time at which the measurement system was recovered in UTC. */
  recoveryDate?: Maybe<Scalars['DateTime']['output']>;
  /** Name of the vehicle associated with the recovery. */
  recoveryVessel?: Maybe<Scalars['String']['output']>;
  /** Conceptual location. A site may group together several platforms in relatively close proximity, or describes a location where regular deployments are carried out. */
  site?: Maybe<SiteNode>;
};


export type DeploymentNodeChannelConfigurationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  continuous?: InputMaybe<Scalars['Boolean']['input']>;
  deploymentId?: InputMaybe<Scalars['ID']['input']>;
  deploymentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  detectorSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  dutyCycleOff?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Gt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Gte?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Lt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Lte?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Gt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Gte?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Lt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Lte?: InputMaybe<Scalars['Int']['input']>;
  files_Id?: InputMaybe<Scalars['Decimal']['input']>;
  files_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  harvestEndingDate?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  instrumentDepth?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Gt?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Gte?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Lt?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Lte?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  recorderSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  storages_Id?: InputMaybe<Scalars['Decimal']['input']>;
  storages_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};


export type DeploymentNodeContactsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  contact_FirstName?: InputMaybe<Scalars['String']['input']>;
  contact_FirstName_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contact_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contact_LastName?: InputMaybe<Scalars['String']['input']>;
  contact_LastName_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Mail?: InputMaybe<Scalars['String']['input']>;
  contact_Mail_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Website?: InputMaybe<Scalars['String']['input']>;
  contact_Website_Icontains?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institution_Id?: InputMaybe<Scalars['Decimal']['input']>;
  institution_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institution_Mail?: InputMaybe<Scalars['String']['input']>;
  institution_Mail_Icontains?: InputMaybe<Scalars['String']['input']>;
  institution_Name?: InputMaybe<Scalars['String']['input']>;
  institution_Name_Icontains?: InputMaybe<Scalars['String']['input']>;
  institution_Website?: InputMaybe<Scalars['String']['input']>;
  institution_Website_Icontains?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  projects_Id?: InputMaybe<Scalars['Decimal']['input']>;
  projects_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  role?: InputMaybe<Scalars['RoleEnum']['input']>;
};


export type DeploymentNodeMobilePositionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  datetime?: InputMaybe<Scalars['DateTime']['input']>;
  datetime_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  datetime_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  datetime_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  datetime_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentId?: InputMaybe<Scalars['ID']['input']>;
  deploymentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  depth?: InputMaybe<Scalars['Float']['input']>;
  depth_Gt?: InputMaybe<Scalars['Float']['input']>;
  depth_Gte?: InputMaybe<Scalars['Float']['input']>;
  depth_Lt?: InputMaybe<Scalars['Float']['input']>;
  depth_Lte?: InputMaybe<Scalars['Float']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  heading?: InputMaybe<Scalars['Float']['input']>;
  heading_Gt?: InputMaybe<Scalars['Float']['input']>;
  heading_Gte?: InputMaybe<Scalars['Float']['input']>;
  heading_Lt?: InputMaybe<Scalars['Float']['input']>;
  heading_Lte?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  pitch?: InputMaybe<Scalars['Float']['input']>;
  pitch_Gt?: InputMaybe<Scalars['Float']['input']>;
  pitch_Gte?: InputMaybe<Scalars['Float']['input']>;
  pitch_Lt?: InputMaybe<Scalars['Float']['input']>;
  pitch_Lte?: InputMaybe<Scalars['Float']['input']>;
  roll?: InputMaybe<Scalars['Float']['input']>;
  roll_Gt?: InputMaybe<Scalars['Float']['input']>;
  roll_Gte?: InputMaybe<Scalars['Float']['input']>;
  roll_Lt?: InputMaybe<Scalars['Float']['input']>;
  roll_Lte?: InputMaybe<Scalars['Float']['input']>;
};

export type DeploymentNodeConnection = {
  __typename?: 'DeploymentNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<DeploymentNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `DeploymentNode` and its cursor. */
export type DeploymentNodeEdge = {
  __typename?: 'DeploymentNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<DeploymentNode>;
};

export type DeploymentNodeNodeConnection = {
  __typename?: 'DeploymentNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<DeploymentNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type DetectionPropertiesNode = Node & {
  __typename?: 'DetectionPropertiesNode';
  /** End of the detection file covering (in UTC). */
  end: Scalars['DateTime']['output'];
  file?: Maybe<FileNode>;
  id: Scalars['ID']['output'];
  /** Start of the detection file covering (in UTC). */
  start: Scalars['DateTime']['output'];
};

export type DetectionPropertiesNodeNodeConnection = {
  __typename?: 'DetectionPropertiesNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<DetectionPropertiesNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EquipmentNode = Node & {
  __typename?: 'EquipmentNode';
  acousticDetectorSpecification?: Maybe<AcousticDetectorSpecificationNode>;
  batterySlotsCount?: Maybe<Scalars['Int']['output']>;
  batteryType?: Maybe<Scalars['String']['output']>;
  cables?: Maybe<Scalars['String']['output']>;
  channelConfigurationDetectorSpecifications: ChannelConfigurationDetectorSpecificationNodeConnection;
  channelConfigurationHydrophoneSpecifications: ChannelConfigurationRecorderSpecificationNodeConnection;
  channelConfigurationRecorderSpecifications: ChannelConfigurationRecorderSpecificationNodeConnection;
  channelConfigurations: ChannelConfigurationNodeConnection;
  hydrophoneSpecification?: Maybe<HydrophoneSpecificationNode>;
  id: Scalars['ID']['output'];
  maintenances: MaintenanceNodeConnection;
  model: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  owner: InstitutionNode;
  provider: InstitutionNode;
  purchaseDate?: Maybe<Scalars['Date']['output']>;
  recorderSpecification?: Maybe<RecorderSpecificationNode>;
  serialNumber: Scalars['String']['output'];
  storageSpecification?: Maybe<StorageSpecificationNode>;
};


export type EquipmentNodeChannelConfigurationDetectorSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfiguration_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfiguration_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  detectorId?: InputMaybe<Scalars['ID']['input']>;
  detectorId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  labels_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  outputFormats?: InputMaybe<Scalars['String']['input']>;
};


export type EquipmentNodeChannelConfigurationHydrophoneSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfiguration_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfiguration_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hydrophoneId?: InputMaybe<Scalars['ID']['input']>;
  hydrophoneId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  recorderId?: InputMaybe<Scalars['ID']['input']>;
  recorderId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  recordingFormats?: InputMaybe<Scalars['String']['input']>;
};


export type EquipmentNodeChannelConfigurationRecorderSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfiguration_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfiguration_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hydrophoneId?: InputMaybe<Scalars['ID']['input']>;
  hydrophoneId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  recorderId?: InputMaybe<Scalars['ID']['input']>;
  recorderId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  recordingFormats?: InputMaybe<Scalars['String']['input']>;
};


export type EquipmentNodeChannelConfigurationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  continuous?: InputMaybe<Scalars['Boolean']['input']>;
  deploymentId?: InputMaybe<Scalars['ID']['input']>;
  deploymentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  detectorSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  dutyCycleOff?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Gt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Gte?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Lt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Lte?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Gt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Gte?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Lt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Lte?: InputMaybe<Scalars['Int']['input']>;
  files_Id?: InputMaybe<Scalars['Decimal']['input']>;
  files_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  harvestEndingDate?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  instrumentDepth?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Gt?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Gte?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Lt?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Lte?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  recorderSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  storages_Id?: InputMaybe<Scalars['Decimal']['input']>;
  storages_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};


export type EquipmentNodeMaintenancesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['Date']['input']>;
  date_Gt?: InputMaybe<Scalars['Date']['input']>;
  date_Gte?: InputMaybe<Scalars['Date']['input']>;
  date_Lt?: InputMaybe<Scalars['Date']['input']>;
  date_Lte?: InputMaybe<Scalars['Date']['input']>;
  equipmentId?: InputMaybe<Scalars['ID']['input']>;
  equipmentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintainerId?: InputMaybe<Scalars['ID']['input']>;
  maintainerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  maintainerInstitutionId?: InputMaybe<Scalars['ID']['input']>;
  maintainerInstitutionId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  typeId?: InputMaybe<Scalars['ID']['input']>;
  typeId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type EquipmentNodeConnection = {
  __typename?: 'EquipmentNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<EquipmentNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `EquipmentNode` and its cursor. */
export type EquipmentNodeEdge = {
  __typename?: 'EquipmentNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<EquipmentNode>;
};

export type EquipmentNodeNodeConnection = {
  __typename?: 'EquipmentNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<EquipmentNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ErrorType = {
  __typename?: 'ErrorType';
  field: Scalars['String']['output'];
  messages: Array<Scalars['String']['output']>;
};

export type FileFormatNode = Node & {
  __typename?: 'FileFormatNode';
  channelConfigurationDetectorSpecifications: ChannelConfigurationDetectorSpecificationNodeConnection;
  channelConfigurationRecorderSpecifications: ChannelConfigurationRecorderSpecificationNodeConnection;
  /** Format of the audio file. */
  files: FileNodeConnection;
  id: Scalars['ID']['output'];
  /** Format of the file */
  name: Scalars['String']['output'];
};


export type FileFormatNodeChannelConfigurationDetectorSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfiguration_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfiguration_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  detectorId?: InputMaybe<Scalars['ID']['input']>;
  detectorId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  labels_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  outputFormats?: InputMaybe<Scalars['String']['input']>;
};


export type FileFormatNodeChannelConfigurationRecorderSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfiguration_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfiguration_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hydrophoneId?: InputMaybe<Scalars['ID']['input']>;
  hydrophoneId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  recorderId?: InputMaybe<Scalars['ID']['input']>;
  recorderId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  recordingFormats?: InputMaybe<Scalars['String']['input']>;
};


export type FileFormatNodeFilesArgs = {
  accessibility?: InputMaybe<Scalars['AccessibilityEnum']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  audioPropertiesId?: InputMaybe<Scalars['ID']['input']>;
  audioPropertiesId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  detectionPropertiesId?: InputMaybe<Scalars['ID']['input']>;
  detectionPropertiesId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  fileSize?: InputMaybe<Scalars['BigInt']['input']>;
  fileSize_Gt?: InputMaybe<Scalars['BigInt']['input']>;
  fileSize_Gte?: InputMaybe<Scalars['BigInt']['input']>;
  fileSize_Lt?: InputMaybe<Scalars['BigInt']['input']>;
  fileSize_Lte?: InputMaybe<Scalars['BigInt']['input']>;
  filename?: InputMaybe<Scalars['String']['input']>;
  filename_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  format?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  storageLocation?: InputMaybe<Scalars['String']['input']>;
  storageLocation_Icontains?: InputMaybe<Scalars['String']['input']>;
};

export type FileFormatNodeConnection = {
  __typename?: 'FileFormatNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<FileFormatNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `FileFormatNode` and its cursor. */
export type FileFormatNodeEdge = {
  __typename?: 'FileFormatNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<FileFormatNode>;
};

export type FileFormatNodeNodeConnection = {
  __typename?: 'FileFormatNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<FileFormatNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type FileNode = Node & {
  __typename?: 'FileNode';
  accessibility?: Maybe<Scalars['AccessibilityEnum']['output']>;
  /** Each property is dedicated to one file. */
  audioProperties?: Maybe<AudioPropertiesNode>;
  channelConfigurations: ChannelConfigurationNodeConnection;
  /** Each property is dedicated to one file. */
  detectionProperties?: Maybe<DetectionPropertiesNode>;
  /** Total number of bytes of the audio file (in bytes). */
  fileSize?: Maybe<Scalars['BigInt']['output']>;
  /** Name of the file, with extension. */
  filename: Scalars['String']['output'];
  /** Format of the audio file. */
  format: FileFormatNode;
  id: Scalars['ID']['output'];
  /** Description of the path to access the data. */
  storageLocation?: Maybe<Scalars['String']['output']>;
};


export type FileNodeChannelConfigurationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  continuous?: InputMaybe<Scalars['Boolean']['input']>;
  deploymentId?: InputMaybe<Scalars['ID']['input']>;
  deploymentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  detectorSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  dutyCycleOff?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Gt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Gte?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Lt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Lte?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Gt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Gte?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Lt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Lte?: InputMaybe<Scalars['Int']['input']>;
  files_Id?: InputMaybe<Scalars['Decimal']['input']>;
  files_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  harvestEndingDate?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  instrumentDepth?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Gt?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Gte?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Lt?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Lte?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  recorderSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  storages_Id?: InputMaybe<Scalars['Decimal']['input']>;
  storages_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type FileNodeConnection = {
  __typename?: 'FileNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<FileNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `FileNode` and its cursor. */
export type FileNodeEdge = {
  __typename?: 'FileNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<FileNode>;
};

export type FileNodeNodeConnection = {
  __typename?: 'FileNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<FileNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type HydrophoneSpecificationNode = Node & {
  __typename?: 'HydrophoneSpecificationNode';
  directivity?: Maybe<Scalars['HydrophoneDirectivityEnum']['output']>;
  equipmentSet: EquipmentNodeConnection;
  id: Scalars['ID']['output'];
  /** Upper limiting frequency within a more or less flat response of the hydrophone, pre-amplification included if applicable. */
  maxBandwidth?: Maybe<Scalars['Float']['output']>;
  /** Highest level which the hydrophone can handle (dB SPL RMS or peak), pre-amplification included if applicable. */
  maxDynamicRange?: Maybe<Scalars['Float']['output']>;
  /** Maximum depth at which hydrophone operates (in positive meters). */
  maxOperatingDepth?: Maybe<Scalars['Float']['output']>;
  /** Lower limiting frequency for a more or less flat response of the hydrophone, pre-amplification included if applicable. */
  minBandwidth?: Maybe<Scalars['Float']['output']>;
  /** Lowest level which the hydrophone can handle (dB SPL RMS or peak), pre-amplification included if applicable. */
  minDynamicRange?: Maybe<Scalars['Float']['output']>;
  /** Minimum depth at which hydrophone operates (in positive meters). */
  minOperatingDepth?: Maybe<Scalars['Float']['output']>;
  /** Self noise of the hydrophone (dB re 1µPa^2/Hz), pre-amplification included if applicable.<br>Average on bandwidth or a fix frequency (generally @5kHz for example). Possibility to 'below sea-state zero' (equivalent to around 30dB @5kHz) could be nice because it is often described like that. */
  noiseFloor?: Maybe<Scalars['Float']['output']>;
  /** Maximal temperature where the hydrophone operates (in degree Celsius) */
  operatingMaxTemperature?: Maybe<Scalars['Float']['output']>;
  /** Minimal temperature where the hydrophone operates (in degree Celsius) */
  operatingMinTemperature?: Maybe<Scalars['Float']['output']>;
  sensitivity: Scalars['Float']['output'];
};


export type HydrophoneSpecificationNodeEquipmentSetArgs = {
  acousticDetectorSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  batterySlotsCount?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gte?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lte?: InputMaybe<Scalars['Int']['input']>;
  batteryType?: InputMaybe<Scalars['String']['input']>;
  batteryType_Icontains?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cables?: InputMaybe<Scalars['String']['input']>;
  cables_Icontains?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationHydrophoneSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationHydrophoneSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationRecorderSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationRecorderSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hydrophoneSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  model?: InputMaybe<Scalars['String']['input']>;
  model_Icontains?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  ownerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  providerId?: InputMaybe<Scalars['ID']['input']>;
  providerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  purchaseDate?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  recorderSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  serialNumber_Icontains?: InputMaybe<Scalars['String']['input']>;
  storageSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
};

export type HydrophoneSpecificationNodeNodeConnection = {
  __typename?: 'HydrophoneSpecificationNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<HydrophoneSpecificationNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type InstitutionNode = Node & {
  __typename?: 'InstitutionNode';
  bibliographyAuthors: AuthorNodeConnection;
  city: Scalars['String']['output'];
  contacts: ContactNodeConnection;
  country: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mail?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  ownedEquipments: EquipmentNodeConnection;
  ownedPlatforms: PlatformNodeConnection;
  performedMaintenances: MaintenanceNodeConnection;
  providedEquipments: EquipmentNodeConnection;
  providedPlatforms: PlatformNodeConnection;
  roles: ContactRoleNodeConnection;
  website?: Maybe<Scalars['String']['output']>;
};


export type InstitutionNodeBibliographyAuthorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  bibliographyId?: InputMaybe<Scalars['ID']['input']>;
  bibliographyId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contactId?: InputMaybe<Scalars['ID']['input']>;
  contactId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institutions?: InputMaybe<Scalars['Decimal']['input']>;
  institutions_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  order_Gt?: InputMaybe<Scalars['Int']['input']>;
  order_Gte?: InputMaybe<Scalars['Int']['input']>;
  order_Lt?: InputMaybe<Scalars['Int']['input']>;
  order_Lte?: InputMaybe<Scalars['Int']['input']>;
};


export type InstitutionNodeContactsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownedEquipments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  ownedPlatforms_Id?: InputMaybe<Scalars['Decimal']['input']>;
  performedMaintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  providedEquipments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  providedPlatforms_Id?: InputMaybe<Scalars['Decimal']['input']>;
  roles_Id?: InputMaybe<Scalars['Decimal']['input']>;
};


export type InstitutionNodeOwnedEquipmentsArgs = {
  acousticDetectorSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  batterySlotsCount?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gte?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lte?: InputMaybe<Scalars['Int']['input']>;
  batteryType?: InputMaybe<Scalars['String']['input']>;
  batteryType_Icontains?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cables?: InputMaybe<Scalars['String']['input']>;
  cables_Icontains?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationHydrophoneSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationHydrophoneSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationRecorderSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationRecorderSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hydrophoneSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  model?: InputMaybe<Scalars['String']['input']>;
  model_Icontains?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  ownerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  providerId?: InputMaybe<Scalars['ID']['input']>;
  providerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  purchaseDate?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  recorderSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  serialNumber_Icontains?: InputMaybe<Scalars['String']['input']>;
  storageSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
};


export type InstitutionNodeOwnedPlatformsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  isMobile?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  ownerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  providerId?: InputMaybe<Scalars['ID']['input']>;
  providerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type InstitutionNodePerformedMaintenancesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['Date']['input']>;
  date_Gt?: InputMaybe<Scalars['Date']['input']>;
  date_Gte?: InputMaybe<Scalars['Date']['input']>;
  date_Lt?: InputMaybe<Scalars['Date']['input']>;
  date_Lte?: InputMaybe<Scalars['Date']['input']>;
  equipmentId?: InputMaybe<Scalars['ID']['input']>;
  equipmentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintainerId?: InputMaybe<Scalars['ID']['input']>;
  maintainerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  maintainerInstitutionId?: InputMaybe<Scalars['ID']['input']>;
  maintainerInstitutionId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  typeId?: InputMaybe<Scalars['ID']['input']>;
  typeId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type InstitutionNodeProvidedEquipmentsArgs = {
  acousticDetectorSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  batterySlotsCount?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gte?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lte?: InputMaybe<Scalars['Int']['input']>;
  batteryType?: InputMaybe<Scalars['String']['input']>;
  batteryType_Icontains?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cables?: InputMaybe<Scalars['String']['input']>;
  cables_Icontains?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationHydrophoneSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationHydrophoneSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationRecorderSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationRecorderSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hydrophoneSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  model?: InputMaybe<Scalars['String']['input']>;
  model_Icontains?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  ownerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  providerId?: InputMaybe<Scalars['ID']['input']>;
  providerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  purchaseDate?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  recorderSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  serialNumber_Icontains?: InputMaybe<Scalars['String']['input']>;
  storageSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
};


export type InstitutionNodeProvidedPlatformsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  isMobile?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  ownerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  providerId?: InputMaybe<Scalars['ID']['input']>;
  providerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type InstitutionNodeRolesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  contact_FirstName?: InputMaybe<Scalars['String']['input']>;
  contact_FirstName_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contact_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contact_LastName?: InputMaybe<Scalars['String']['input']>;
  contact_LastName_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Mail?: InputMaybe<Scalars['String']['input']>;
  contact_Mail_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Website?: InputMaybe<Scalars['String']['input']>;
  contact_Website_Icontains?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institution_Id?: InputMaybe<Scalars['Decimal']['input']>;
  institution_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institution_Mail?: InputMaybe<Scalars['String']['input']>;
  institution_Mail_Icontains?: InputMaybe<Scalars['String']['input']>;
  institution_Name?: InputMaybe<Scalars['String']['input']>;
  institution_Name_Icontains?: InputMaybe<Scalars['String']['input']>;
  institution_Website?: InputMaybe<Scalars['String']['input']>;
  institution_Website_Icontains?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  projects_Id?: InputMaybe<Scalars['Decimal']['input']>;
  projects_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  role?: InputMaybe<Scalars['RoleEnum']['input']>;
};

export type InstitutionNodeConnection = {
  __typename?: 'InstitutionNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<InstitutionNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `InstitutionNode` and its cursor. */
export type InstitutionNodeEdge = {
  __typename?: 'InstitutionNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<InstitutionNode>;
};

export type InstitutionNodeNodeConnection = {
  __typename?: 'InstitutionNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<InstitutionNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type LabelNode = Node & {
  __typename?: 'LabelNode';
  acousticDetectors: AcousticDetectorSpecificationNodeConnection;
  /** Other name found in the bibliography for this label */
  associatedNames?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  channelConfigurationDetectorSpecifications: ChannelConfigurationDetectorSpecificationNodeConnection;
  children: LabelNodeConnection;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  labelSet: ApiLabelNodeConnection;
  maxFrequency?: Maybe<Scalars['Int']['output']>;
  meanDuration?: Maybe<Scalars['Float']['output']>;
  minFrequency?: Maybe<Scalars['Int']['output']>;
  nickname?: Maybe<Scalars['String']['output']>;
  parent?: Maybe<LabelNode>;
  plurality?: Maybe<Scalars['SignalPluralityEnum']['output']>;
  relatedBibliography: BibliographyNodeConnection;
  shape?: Maybe<Scalars['SignalShapeEnum']['output']>;
  sound?: Maybe<SoundNode>;
  source: SourceNode;
};


export type LabelNodeAcousticDetectorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  algorithmName?: InputMaybe<Scalars['String']['input']>;
  algorithmName_Icontains?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  detectedLabels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  detectedLabels_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  equipment_Id?: InputMaybe<Scalars['Decimal']['input']>;
  equipment_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  minFrequency?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type LabelNodeChannelConfigurationDetectorSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfiguration_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfiguration_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  detectorId?: InputMaybe<Scalars['ID']['input']>;
  detectorId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  labels_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  outputFormats?: InputMaybe<Scalars['String']['input']>;
};


export type LabelNodeChildrenArgs = {
  acousticDetectors_Id?: InputMaybe<Scalars['Decimal']['input']>;
  acousticDetectors_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  meanDuration?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gte?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lte?: InputMaybe<Scalars['Float']['input']>;
  minFrequency?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  nickname_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  plurality?: InputMaybe<Scalars['SignalPluralityEnum']['input']>;
  shape?: InputMaybe<Scalars['SignalShapeEnum']['input']>;
  soundId?: InputMaybe<Scalars['ID']['input']>;
  soundId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  sourceId?: InputMaybe<Scalars['ID']['input']>;
  sourceId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type LabelNodeLabelSetArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  annotationresult_AnnotationCampaignPhase_AnnotationCampaign_Datasets_RelatedChannelConfiguration_DeploymentId?: InputMaybe<Scalars['Decimal']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
};


export type LabelNodeRelatedBibliographyArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  doi?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  publicationDate?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['StatusEnum']['input']>;
  tags_Name?: InputMaybe<Scalars['String']['input']>;
  tags_Name_In?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_Icontains?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['TypeEnum']['input']>;
};

export type LabelNodeConnection = {
  __typename?: 'LabelNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<LabelNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `LabelNode` and its cursor. */
export type LabelNodeEdge = {
  __typename?: 'LabelNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<LabelNode>;
};

export type LabelNodeNodeConnection = {
  __typename?: 'LabelNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<LabelNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type MaintenanceNode = Node & {
  __typename?: 'MaintenanceNode';
  date: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  equipment?: Maybe<EquipmentNode>;
  id: Scalars['ID']['output'];
  maintainer?: Maybe<ContactNode>;
  maintainerInstitution?: Maybe<InstitutionNode>;
  platform?: Maybe<PlatformNode>;
  type: MaintenanceTypeNode;
};

export type MaintenanceNodeConnection = {
  __typename?: 'MaintenanceNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<MaintenanceNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `MaintenanceNode` and its cursor. */
export type MaintenanceNodeEdge = {
  __typename?: 'MaintenanceNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<MaintenanceNode>;
};

export type MaintenanceNodeNodeConnection = {
  __typename?: 'MaintenanceNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<MaintenanceNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type MaintenanceTypeNode = Node & {
  __typename?: 'MaintenanceTypeNode';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  interval?: Maybe<Scalars['Float']['output']>;
  maintenances: MaintenanceNodeConnection;
  name: Scalars['String']['output'];
};


export type MaintenanceTypeNodeMaintenancesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['Date']['input']>;
  date_Gt?: InputMaybe<Scalars['Date']['input']>;
  date_Gte?: InputMaybe<Scalars['Date']['input']>;
  date_Lt?: InputMaybe<Scalars['Date']['input']>;
  date_Lte?: InputMaybe<Scalars['Date']['input']>;
  equipmentId?: InputMaybe<Scalars['ID']['input']>;
  equipmentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintainerId?: InputMaybe<Scalars['ID']['input']>;
  maintainerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  maintainerInstitutionId?: InputMaybe<Scalars['ID']['input']>;
  maintainerInstitutionId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  typeId?: InputMaybe<Scalars['ID']['input']>;
  typeId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type MaintenanceTypeNodeNodeConnection = {
  __typename?: 'MaintenanceTypeNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<MaintenanceTypeNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Global mutation */
export type Mutation = {
  __typename?: 'Mutation';
  deleteSound?: Maybe<DeleteSoundMutation>;
  deleteSource?: Maybe<DeleteSourceMutation>;
  postSound?: Maybe<PostSoundMutationPayload>;
  postSource?: Maybe<PostSourceMutationPayload>;
};


/** Global mutation */
export type MutationDeleteSoundArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** Global mutation */
export type MutationDeleteSourceArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** Global mutation */
export type MutationPostSoundArgs = {
  input: PostSoundMutationInput;
};


/** Global mutation */
export type MutationPostSourceArgs = {
  input: PostSourceMutationInput;
};

/** An object with an ID */
export type Node = {
  /** The ID of the object */
  id: Scalars['ID']['output'];
};

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PageInfoExtra = {
  __typename?: 'PageInfoExtra';
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
};

export type PlatformNode = Node & {
  __typename?: 'PlatformNode';
  /** Support of the deployed instruments */
  deployments: DeploymentNodeConnection;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  maintenances: MaintenanceNodeConnection;
  name?: Maybe<Scalars['String']['output']>;
  owner: InstitutionNode;
  provider: InstitutionNode;
  type: PlatformTypeNode;
};


export type PlatformNodeDeploymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  bathymetricDepth?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Gt?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Gte?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Lt?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Lte?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  campaignId?: InputMaybe<Scalars['ID']['input']>;
  campaignId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  deploymentDate?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentVessel?: InputMaybe<Scalars['String']['input']>;
  deploymentVessel_Icontains?: InputMaybe<Scalars['String']['input']>;
  description_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  mobilePositions_Id?: InputMaybe<Scalars['Decimal']['input']>;
  mobilePositions_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  projectId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  project_WebsiteProject_Id?: InputMaybe<Scalars['Decimal']['input']>;
  recoveryDate?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryVessel?: InputMaybe<Scalars['String']['input']>;
  recoveryVessel_Icontains?: InputMaybe<Scalars['String']['input']>;
  siteId?: InputMaybe<Scalars['ID']['input']>;
  siteId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type PlatformNodeMaintenancesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['Date']['input']>;
  date_Gt?: InputMaybe<Scalars['Date']['input']>;
  date_Gte?: InputMaybe<Scalars['Date']['input']>;
  date_Lt?: InputMaybe<Scalars['Date']['input']>;
  date_Lte?: InputMaybe<Scalars['Date']['input']>;
  equipmentId?: InputMaybe<Scalars['ID']['input']>;
  equipmentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintainerId?: InputMaybe<Scalars['ID']['input']>;
  maintainerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  maintainerInstitutionId?: InputMaybe<Scalars['ID']['input']>;
  maintainerInstitutionId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  typeId?: InputMaybe<Scalars['ID']['input']>;
  typeId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type PlatformNodeConnection = {
  __typename?: 'PlatformNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<PlatformNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `PlatformNode` and its cursor. */
export type PlatformNodeEdge = {
  __typename?: 'PlatformNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<PlatformNode>;
};

export type PlatformNodeNodeConnection = {
  __typename?: 'PlatformNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<PlatformNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PlatformTypeNode = Node & {
  __typename?: 'PlatformTypeNode';
  id: Scalars['ID']['output'];
  isMobile: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  platforms: PlatformNodeConnection;
};


export type PlatformTypeNodePlatformsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  isMobile?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  ownerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  providerId?: InputMaybe<Scalars['ID']['input']>;
  providerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type PlatformTypeNodeNodeConnection = {
  __typename?: 'PlatformTypeNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<PlatformTypeNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PostSoundMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  codeName?: InputMaybe<Scalars['String']['input']>;
  englishName: Scalars['String']['input'];
  frenchName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  parent?: InputMaybe<Scalars['String']['input']>;
  taxon?: InputMaybe<Scalars['String']['input']>;
};

export type PostSoundMutationPayload = {
  __typename?: 'PostSoundMutationPayload';
  associatedNames?: Maybe<Scalars['String']['output']>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
  codeName?: Maybe<Scalars['String']['output']>;
  data?: Maybe<SoundNode>;
  englishName?: Maybe<Scalars['String']['output']>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  frenchName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  ok?: Maybe<Scalars['Boolean']['output']>;
  parent?: Maybe<Scalars['String']['output']>;
  relatedBibliography?: Maybe<Scalars['String']['output']>;
  taxon?: Maybe<Scalars['String']['output']>;
};

export type PostSourceMutationInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  codeName?: InputMaybe<Scalars['String']['input']>;
  englishName: Scalars['String']['input'];
  frenchName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  latinName?: InputMaybe<Scalars['String']['input']>;
  parent?: InputMaybe<Scalars['String']['input']>;
  taxon?: InputMaybe<Scalars['String']['input']>;
};

export type PostSourceMutationPayload = {
  __typename?: 'PostSourceMutationPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  codeName?: Maybe<Scalars['String']['output']>;
  data?: Maybe<SourceNode>;
  englishName?: Maybe<Scalars['String']['output']>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  frenchName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  latinName?: Maybe<Scalars['String']['output']>;
  ok?: Maybe<Scalars['Boolean']['output']>;
  parent?: Maybe<Scalars['String']['output']>;
  relatedBibliography?: Maybe<Scalars['String']['output']>;
  taxon?: Maybe<Scalars['String']['output']>;
};

export type ProjectNode = Node & {
  __typename?: 'ProjectNode';
  accessibility?: Maybe<Scalars['AccessibilityEnum']['output']>;
  /** Project associated to this campaign */
  campaigns: CampaignNodeConnection;
  /** Should have at least one 'Main Contact' */
  contacts: ContactRoleNodeConnection;
  /** Project associated to this deployment */
  deployments: DeploymentNodeConnection;
  /** Digital Object Identifier of the data, if existing. */
  doi?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['Date']['output']>;
  financing?: Maybe<Scalars['FinancingEnum']['output']>;
  id: Scalars['ID']['output'];
  /** Name of the project */
  name: Scalars['String']['output'];
  /** Description of the goal of the project. */
  projectGoal?: Maybe<Scalars['String']['output']>;
  /** Description of the type of the project (e.g., research, marine renewable energies, long monitoring,...). */
  projectType?: Maybe<ProjectTypeNode>;
  relatedBibliography: BibliographyNodeConnection;
  /** Project associated to this site */
  sites: SiteNodeConnection;
  startDate?: Maybe<Scalars['Date']['output']>;
  websiteProject?: Maybe<ProjectNode>;
};


export type ProjectNodeCampaignsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  projectId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type ProjectNodeContactsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  contact_FirstName?: InputMaybe<Scalars['String']['input']>;
  contact_FirstName_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contact_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contact_LastName?: InputMaybe<Scalars['String']['input']>;
  contact_LastName_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Mail?: InputMaybe<Scalars['String']['input']>;
  contact_Mail_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Website?: InputMaybe<Scalars['String']['input']>;
  contact_Website_Icontains?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institution_Id?: InputMaybe<Scalars['Decimal']['input']>;
  institution_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institution_Mail?: InputMaybe<Scalars['String']['input']>;
  institution_Mail_Icontains?: InputMaybe<Scalars['String']['input']>;
  institution_Name?: InputMaybe<Scalars['String']['input']>;
  institution_Name_Icontains?: InputMaybe<Scalars['String']['input']>;
  institution_Website?: InputMaybe<Scalars['String']['input']>;
  institution_Website_Icontains?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  projects_Id?: InputMaybe<Scalars['Decimal']['input']>;
  projects_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  role?: InputMaybe<Scalars['RoleEnum']['input']>;
};


export type ProjectNodeDeploymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  bathymetricDepth?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Gt?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Gte?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Lt?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Lte?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  campaignId?: InputMaybe<Scalars['ID']['input']>;
  campaignId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  deploymentDate?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentVessel?: InputMaybe<Scalars['String']['input']>;
  deploymentVessel_Icontains?: InputMaybe<Scalars['String']['input']>;
  description_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  mobilePositions_Id?: InputMaybe<Scalars['Decimal']['input']>;
  mobilePositions_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  projectId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  project_WebsiteProject_Id?: InputMaybe<Scalars['Decimal']['input']>;
  recoveryDate?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryVessel?: InputMaybe<Scalars['String']['input']>;
  recoveryVessel_Icontains?: InputMaybe<Scalars['String']['input']>;
  siteId?: InputMaybe<Scalars['ID']['input']>;
  siteId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type ProjectNodeRelatedBibliographyArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  doi?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  publicationDate?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['StatusEnum']['input']>;
  tags_Name?: InputMaybe<Scalars['String']['input']>;
  tags_Name_In?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_Icontains?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['TypeEnum']['input']>;
};


export type ProjectNodeSitesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  projectId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type ProjectNodeConnection = {
  __typename?: 'ProjectNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ProjectNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `ProjectNode` and its cursor. */
export type ProjectNodeEdge = {
  __typename?: 'ProjectNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ProjectNode>;
};

export type ProjectNodeNodeConnection = {
  __typename?: 'ProjectNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<ProjectNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ProjectTypeNode = Node & {
  __typename?: 'ProjectTypeNode';
  id: Scalars['ID']['output'];
  /** Description of the type of the project */
  name: Scalars['String']['output'];
  /** Description of the type of the project (e.g., research, marine renewable energies, long monitoring,...). */
  projects: ProjectNodeConnection;
};


export type ProjectTypeNodeProjectsArgs = {
  accessibility?: InputMaybe<Scalars['AccessibilityEnum']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  campaigns_Id?: InputMaybe<Scalars['Decimal']['input']>;
  campaigns_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  doi?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['Date']['input']>;
  endDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  endDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  endDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  endDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  financing?: InputMaybe<Scalars['FinancingEnum']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  projectGoal?: InputMaybe<Scalars['String']['input']>;
  projectGoal_Icontains?: InputMaybe<Scalars['String']['input']>;
  projectType?: InputMaybe<Scalars['Decimal']['input']>;
  projectType_Id?: InputMaybe<Scalars['Decimal']['input']>;
  projectType_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  sites_Id?: InputMaybe<Scalars['Decimal']['input']>;
  sites_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  startDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  startDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  startDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  startDate_Lte?: InputMaybe<Scalars['Date']['input']>;
};

export type ProjectTypeNodeNodeConnection = {
  __typename?: 'ProjectTypeNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<ProjectTypeNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Global query */
export type Query = {
  __typename?: 'Query';
  acousticDetectorSpecificationById?: Maybe<AcousticDetectorSpecificationNode>;
  allAcousticDetectorSpecifications?: Maybe<AcousticDetectorSpecificationNodeNodeConnection>;
  allApiAnnotationResults?: Maybe<AnnotationResultNodeNodeConnection>;
  allApiLabels?: Maybe<ApiLabelNodeNodeConnection>;
  allAudioProperties?: Maybe<AudioPropertiesNodeNodeConnection>;
  allAuthors?: Maybe<AuthorNodeNodeConnection>;
  allBibliography?: Maybe<BibliographyNodeNodeConnection>;
  allCampaigns?: Maybe<CampaignNodeNodeConnection>;
  allChannelConfigurations?: Maybe<ChannelConfigurationNodeNodeConnection>;
  allChannelConfigurationsDetectorSpecifications?: Maybe<ChannelConfigurationDetectorSpecificationNodeNodeConnection>;
  allChannelConfigurationsRecorderSpecifications?: Maybe<ChannelConfigurationRecorderSpecificationNodeNodeConnection>;
  allContactRoles?: Maybe<ContactRoleNodeNodeConnection>;
  allContacts?: Maybe<ContactNodeNodeConnection>;
  allDeploymentMobilePositions?: Maybe<DeploymentMobilePositionNodeNodeConnection>;
  allDeployments?: Maybe<DeploymentNodeNodeConnection>;
  allDetectionProperties?: Maybe<DetectionPropertiesNodeNodeConnection>;
  allEquipments?: Maybe<EquipmentNodeNodeConnection>;
  allFile?: Maybe<FileNodeNodeConnection>;
  allFileFormats?: Maybe<FileFormatNodeNodeConnection>;
  allHydrophoneSpecifications?: Maybe<HydrophoneSpecificationNodeNodeConnection>;
  allInstitutions?: Maybe<InstitutionNodeNodeConnection>;
  allLabels?: Maybe<LabelNodeNodeConnection>;
  allMaintenanceTypes?: Maybe<MaintenanceTypeNodeNodeConnection>;
  allMaintenances?: Maybe<MaintenanceNodeNodeConnection>;
  allPlatformTypes?: Maybe<PlatformTypeNodeNodeConnection>;
  allPlatforms?: Maybe<PlatformNodeNodeConnection>;
  allProjectTypes?: Maybe<ProjectTypeNodeNodeConnection>;
  allProjects?: Maybe<ProjectNodeNodeConnection>;
  allRecorderSpecifications?: Maybe<RecorderSpecificationNodeNodeConnection>;
  allSites?: Maybe<SiteNodeNodeConnection>;
  allSounds?: Maybe<SoundNodeNodeConnection>;
  allSources?: Maybe<SourceNodeNodeConnection>;
  allStorageSpecifications?: Maybe<StorageSpecificationNodeNodeConnection>;
  allTags?: Maybe<TagNodeNodeConnection>;
  allWebsiteProjects?: Maybe<ProjectNodeNodeConnection>;
  audioPropertyById?: Maybe<AudioPropertiesNode>;
  authorById?: Maybe<AuthorNode>;
  bibliographyArticleById?: Maybe<BibliographyArticleNode>;
  bibliographyById?: Maybe<BibliographyNode>;
  bibliographyConferenceById?: Maybe<BibliographyConferenceNode>;
  bibliographyPosterById?: Maybe<BibliographyPosterNode>;
  bibliographySoftwareById?: Maybe<BibliographySoftwareNode>;
  campaignById?: Maybe<CampaignNode>;
  channelConfigurationById?: Maybe<ChannelConfigurationNode>;
  channelConfigurationDetectorSpecificationById?: Maybe<ChannelConfigurationDetectorSpecificationNode>;
  channelConfigurationRecorderSpecificationById?: Maybe<ChannelConfigurationRecorderSpecificationNode>;
  contactById?: Maybe<ContactNode>;
  contactRoleById?: Maybe<ContactRoleNode>;
  deploymentById?: Maybe<DeploymentNode>;
  deploymentMobilePositionById?: Maybe<DeploymentMobilePositionNode>;
  detectionPropertyById?: Maybe<DetectionPropertiesNode>;
  equipmentById?: Maybe<EquipmentNode>;
  fileById?: Maybe<FileNode>;
  fileFormatById?: Maybe<FileFormatNode>;
  hydrophoneSpecificationById?: Maybe<HydrophoneSpecificationNode>;
  institutionById?: Maybe<InstitutionNode>;
  labelById?: Maybe<LabelNode>;
  maintenanceById?: Maybe<MaintenanceNode>;
  maintenanceTypeById?: Maybe<MaintenanceTypeNode>;
  platformById?: Maybe<PlatformNode>;
  platformTypeById?: Maybe<PlatformTypeNode>;
  projectById?: Maybe<ProjectNode>;
  projectTypeById?: Maybe<ProjectTypeNode>;
  recorderSpecificationById?: Maybe<RecorderSpecificationNode>;
  siteById?: Maybe<SiteNode>;
  soundById?: Maybe<SoundNode>;
  sourceById?: Maybe<SourceNode>;
  storageSpecificationById?: Maybe<StorageSpecificationNode>;
  tagById?: Maybe<TagNode>;
};


/** Global query */
export type QueryAcousticDetectorSpecificationByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryAllAcousticDetectorSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  algorithmName?: InputMaybe<Scalars['String']['input']>;
  algorithmName_Icontains?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  detectedLabels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  detectedLabels_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  equipment_Id?: InputMaybe<Scalars['Decimal']['input']>;
  equipment_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  minFrequency?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllApiAnnotationResultsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  annotationCampaignPhase_AnnotationCampaign_Datasets_RelatedChannelConfiguration_DeploymentId?: InputMaybe<Scalars['Decimal']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllApiLabelsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  annotationresult_AnnotationCampaignPhase_AnnotationCampaign_Datasets_RelatedChannelConfiguration_DeploymentId?: InputMaybe<Scalars['Decimal']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllAudioPropertiesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  duration_Gt?: InputMaybe<Scalars['Int']['input']>;
  duration_Gte?: InputMaybe<Scalars['Int']['input']>;
  duration_Lt?: InputMaybe<Scalars['Int']['input']>;
  duration_Lte?: InputMaybe<Scalars['Int']['input']>;
  file_Id?: InputMaybe<Scalars['Decimal']['input']>;
  file_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  initialTimestamp?: InputMaybe<Scalars['DateTime']['input']>;
  initialTimestamp_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  initialTimestamp_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  initialTimestamp_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  initialTimestamp_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  sampleDepth?: InputMaybe<Scalars['Int']['input']>;
  sampleDepth_Gt?: InputMaybe<Scalars['Int']['input']>;
  sampleDepth_Gte?: InputMaybe<Scalars['Int']['input']>;
  sampleDepth_Lt?: InputMaybe<Scalars['Int']['input']>;
  sampleDepth_Lte?: InputMaybe<Scalars['Int']['input']>;
  samplingFrequency?: InputMaybe<Scalars['Int']['input']>;
  samplingFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  samplingFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  samplingFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  samplingFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
};


/** Global query */
export type QueryAllAuthorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  bibliographyId?: InputMaybe<Scalars['ID']['input']>;
  bibliographyId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contactId?: InputMaybe<Scalars['ID']['input']>;
  contactId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institutions?: InputMaybe<Scalars['Decimal']['input']>;
  institutions_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  order_Gt?: InputMaybe<Scalars['Int']['input']>;
  order_Gte?: InputMaybe<Scalars['Int']['input']>;
  order_Lt?: InputMaybe<Scalars['Int']['input']>;
  order_Lte?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllBibliographyArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  doi?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  publicationDate?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['StatusEnum']['input']>;
  tags_Name?: InputMaybe<Scalars['String']['input']>;
  tags_Name_In?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_Icontains?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['TypeEnum']['input']>;
};


/** Global query */
export type QueryAllCampaignsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  projectId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


/** Global query */
export type QueryAllChannelConfigurationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  continuous?: InputMaybe<Scalars['Boolean']['input']>;
  deploymentId?: InputMaybe<Scalars['ID']['input']>;
  deploymentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  detectorSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  dutyCycleOff?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Gt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Gte?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Lt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOff_Lte?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Gt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Gte?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Lt?: InputMaybe<Scalars['Int']['input']>;
  dutyCycleOn_Lte?: InputMaybe<Scalars['Int']['input']>;
  files_Id?: InputMaybe<Scalars['Decimal']['input']>;
  files_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  harvestEndingDate?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestEndingDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  harvestStartingDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  instrumentDepth?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Gt?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Gte?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Lt?: InputMaybe<Scalars['Int']['input']>;
  instrumentDepth_Lte?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  recorderSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  storages_Id?: InputMaybe<Scalars['Decimal']['input']>;
  storages_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllChannelConfigurationsDetectorSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfiguration_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfiguration_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  detectorId?: InputMaybe<Scalars['ID']['input']>;
  detectorId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  labels_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  outputFormats?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllChannelConfigurationsRecorderSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfiguration_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfiguration_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hydrophoneId?: InputMaybe<Scalars['ID']['input']>;
  hydrophoneId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  recorderId?: InputMaybe<Scalars['ID']['input']>;
  recorderId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  recordingFormats?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllContactRolesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  contact_FirstName?: InputMaybe<Scalars['String']['input']>;
  contact_FirstName_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contact_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contact_LastName?: InputMaybe<Scalars['String']['input']>;
  contact_LastName_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Mail?: InputMaybe<Scalars['String']['input']>;
  contact_Mail_Icontains?: InputMaybe<Scalars['String']['input']>;
  contact_Website?: InputMaybe<Scalars['String']['input']>;
  contact_Website_Icontains?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institution_Id?: InputMaybe<Scalars['Decimal']['input']>;
  institution_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  institution_Mail?: InputMaybe<Scalars['String']['input']>;
  institution_Mail_Icontains?: InputMaybe<Scalars['String']['input']>;
  institution_Name?: InputMaybe<Scalars['String']['input']>;
  institution_Name_Icontains?: InputMaybe<Scalars['String']['input']>;
  institution_Website?: InputMaybe<Scalars['String']['input']>;
  institution_Website_Icontains?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  projects_Id?: InputMaybe<Scalars['Decimal']['input']>;
  projects_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  role?: InputMaybe<Scalars['RoleEnum']['input']>;
};


/** Global query */
export type QueryAllContactsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  ownedEquipments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  ownedPlatforms_Id?: InputMaybe<Scalars['Decimal']['input']>;
  performedMaintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  providedEquipments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  providedPlatforms_Id?: InputMaybe<Scalars['Decimal']['input']>;
  roles_Id?: InputMaybe<Scalars['Decimal']['input']>;
};


/** Global query */
export type QueryAllDeploymentMobilePositionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  datetime?: InputMaybe<Scalars['DateTime']['input']>;
  datetime_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  datetime_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  datetime_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  datetime_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentId?: InputMaybe<Scalars['ID']['input']>;
  deploymentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  depth?: InputMaybe<Scalars['Float']['input']>;
  depth_Gt?: InputMaybe<Scalars['Float']['input']>;
  depth_Gte?: InputMaybe<Scalars['Float']['input']>;
  depth_Lt?: InputMaybe<Scalars['Float']['input']>;
  depth_Lte?: InputMaybe<Scalars['Float']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  heading?: InputMaybe<Scalars['Float']['input']>;
  heading_Gt?: InputMaybe<Scalars['Float']['input']>;
  heading_Gte?: InputMaybe<Scalars['Float']['input']>;
  heading_Lt?: InputMaybe<Scalars['Float']['input']>;
  heading_Lte?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  pitch?: InputMaybe<Scalars['Float']['input']>;
  pitch_Gt?: InputMaybe<Scalars['Float']['input']>;
  pitch_Gte?: InputMaybe<Scalars['Float']['input']>;
  pitch_Lt?: InputMaybe<Scalars['Float']['input']>;
  pitch_Lte?: InputMaybe<Scalars['Float']['input']>;
  roll?: InputMaybe<Scalars['Float']['input']>;
  roll_Gt?: InputMaybe<Scalars['Float']['input']>;
  roll_Gte?: InputMaybe<Scalars['Float']['input']>;
  roll_Lt?: InputMaybe<Scalars['Float']['input']>;
  roll_Lte?: InputMaybe<Scalars['Float']['input']>;
};


/** Global query */
export type QueryAllDeploymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  bathymetricDepth?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Gt?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Gte?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Lt?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Lte?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  campaignId?: InputMaybe<Scalars['ID']['input']>;
  campaignId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  deploymentDate?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentVessel?: InputMaybe<Scalars['String']['input']>;
  deploymentVessel_Icontains?: InputMaybe<Scalars['String']['input']>;
  description_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  mobilePositions_Id?: InputMaybe<Scalars['Decimal']['input']>;
  mobilePositions_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  projectId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  project_WebsiteProject_Id?: InputMaybe<Scalars['Decimal']['input']>;
  recoveryDate?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryVessel?: InputMaybe<Scalars['String']['input']>;
  recoveryVessel_Icontains?: InputMaybe<Scalars['String']['input']>;
  siteId?: InputMaybe<Scalars['ID']['input']>;
  siteId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


/** Global query */
export type QueryAllDetectionPropertiesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  end?: InputMaybe<Scalars['DateTime']['input']>;
  end_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  end_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  end_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  end_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  file_Id?: InputMaybe<Scalars['Decimal']['input']>;
  file_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
  start_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  start_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  start_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  start_Lte?: InputMaybe<Scalars['DateTime']['input']>;
};


/** Global query */
export type QueryAllEquipmentsArgs = {
  acousticDetectorSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  batterySlotsCount?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gte?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lte?: InputMaybe<Scalars['Int']['input']>;
  batteryType?: InputMaybe<Scalars['String']['input']>;
  batteryType_Icontains?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cables?: InputMaybe<Scalars['String']['input']>;
  cables_Icontains?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationHydrophoneSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationHydrophoneSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationRecorderSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationRecorderSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hydrophoneSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  model?: InputMaybe<Scalars['String']['input']>;
  model_Icontains?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  ownerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  providerId?: InputMaybe<Scalars['ID']['input']>;
  providerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  purchaseDate?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  recorderSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  serialNumber_Icontains?: InputMaybe<Scalars['String']['input']>;
  storageSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Global query */
export type QueryAllFileArgs = {
  accessibility?: InputMaybe<Scalars['AccessibilityEnum']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  audioPropertiesId?: InputMaybe<Scalars['ID']['input']>;
  audioPropertiesId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  detectionPropertiesId?: InputMaybe<Scalars['ID']['input']>;
  detectionPropertiesId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  fileSize?: InputMaybe<Scalars['BigInt']['input']>;
  fileSize_Gt?: InputMaybe<Scalars['BigInt']['input']>;
  fileSize_Gte?: InputMaybe<Scalars['BigInt']['input']>;
  fileSize_Lt?: InputMaybe<Scalars['BigInt']['input']>;
  fileSize_Lte?: InputMaybe<Scalars['BigInt']['input']>;
  filename?: InputMaybe<Scalars['String']['input']>;
  filename_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  format?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  storageLocation?: InputMaybe<Scalars['String']['input']>;
  storageLocation_Icontains?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllFileFormatsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationRecorderSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationRecorderSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  files_Id?: InputMaybe<Scalars['Decimal']['input']>;
  files_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllHydrophoneSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  directivity?: InputMaybe<Scalars['HydrophoneDirectivityEnum']['input']>;
  equipment_Id?: InputMaybe<Scalars['Decimal']['input']>;
  equipment_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxBandwidth?: InputMaybe<Scalars['Float']['input']>;
  maxBandwidth_Gt?: InputMaybe<Scalars['Float']['input']>;
  maxBandwidth_Gte?: InputMaybe<Scalars['Float']['input']>;
  maxBandwidth_Lt?: InputMaybe<Scalars['Float']['input']>;
  maxBandwidth_Lte?: InputMaybe<Scalars['Float']['input']>;
  maxDynamicRange?: InputMaybe<Scalars['Float']['input']>;
  maxDynamicRange_Gt?: InputMaybe<Scalars['Float']['input']>;
  maxDynamicRange_Gte?: InputMaybe<Scalars['Float']['input']>;
  maxDynamicRange_Lt?: InputMaybe<Scalars['Float']['input']>;
  maxDynamicRange_Lte?: InputMaybe<Scalars['Float']['input']>;
  maxOperatingDepth?: InputMaybe<Scalars['Float']['input']>;
  maxOperatingDepth_Gt?: InputMaybe<Scalars['Float']['input']>;
  maxOperatingDepth_Gte?: InputMaybe<Scalars['Float']['input']>;
  maxOperatingDepth_Lt?: InputMaybe<Scalars['Float']['input']>;
  maxOperatingDepth_Lte?: InputMaybe<Scalars['Float']['input']>;
  minBandwidth?: InputMaybe<Scalars['Float']['input']>;
  minBandwidth_Gt?: InputMaybe<Scalars['Float']['input']>;
  minBandwidth_Gte?: InputMaybe<Scalars['Float']['input']>;
  minBandwidth_Lt?: InputMaybe<Scalars['Float']['input']>;
  minBandwidth_Lte?: InputMaybe<Scalars['Float']['input']>;
  minDynamicRange?: InputMaybe<Scalars['Float']['input']>;
  minDynamicRange_Gt?: InputMaybe<Scalars['Float']['input']>;
  minDynamicRange_Gte?: InputMaybe<Scalars['Float']['input']>;
  minDynamicRange_Lt?: InputMaybe<Scalars['Float']['input']>;
  minDynamicRange_Lte?: InputMaybe<Scalars['Float']['input']>;
  minOperatingDepth?: InputMaybe<Scalars['Float']['input']>;
  minOperatingDepth_Gt?: InputMaybe<Scalars['Float']['input']>;
  minOperatingDepth_Gte?: InputMaybe<Scalars['Float']['input']>;
  minOperatingDepth_Lt?: InputMaybe<Scalars['Float']['input']>;
  minOperatingDepth_Lte?: InputMaybe<Scalars['Float']['input']>;
  noiseFloor?: InputMaybe<Scalars['Float']['input']>;
  noiseFloor_Gt?: InputMaybe<Scalars['Float']['input']>;
  noiseFloor_Gte?: InputMaybe<Scalars['Float']['input']>;
  noiseFloor_Lt?: InputMaybe<Scalars['Float']['input']>;
  noiseFloor_Lte?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  operatingMaxTemperature?: InputMaybe<Scalars['Float']['input']>;
  operatingMaxTemperature_Gt?: InputMaybe<Scalars['Float']['input']>;
  operatingMaxTemperature_Gte?: InputMaybe<Scalars['Float']['input']>;
  operatingMaxTemperature_Lt?: InputMaybe<Scalars['Float']['input']>;
  operatingMaxTemperature_Lte?: InputMaybe<Scalars['Float']['input']>;
  operatingMinTemperature?: InputMaybe<Scalars['Float']['input']>;
  operatingMinTemperature_Gt?: InputMaybe<Scalars['Float']['input']>;
  operatingMinTemperature_Gte?: InputMaybe<Scalars['Float']['input']>;
  operatingMinTemperature_Lt?: InputMaybe<Scalars['Float']['input']>;
  operatingMinTemperature_Lte?: InputMaybe<Scalars['Float']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  sensitivity?: InputMaybe<Scalars['Float']['input']>;
  sensitivity_Gt?: InputMaybe<Scalars['Float']['input']>;
  sensitivity_Gte?: InputMaybe<Scalars['Float']['input']>;
  sensitivity_Lt?: InputMaybe<Scalars['Float']['input']>;
  sensitivity_Lte?: InputMaybe<Scalars['Float']['input']>;
};


/** Global query */
export type QueryAllInstitutionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  bibliographyAuthors_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  ownedEquipments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  ownedPlatforms_Id?: InputMaybe<Scalars['Decimal']['input']>;
  performedMaintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  providedEquipments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  providedPlatforms_Id?: InputMaybe<Scalars['Decimal']['input']>;
  roles_Id?: InputMaybe<Scalars['Decimal']['input']>;
};


/** Global query */
export type QueryAllLabelsArgs = {
  acousticDetectors_Id?: InputMaybe<Scalars['Decimal']['input']>;
  acousticDetectors_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  meanDuration?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gte?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lte?: InputMaybe<Scalars['Float']['input']>;
  minFrequency?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  nickname_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  plurality?: InputMaybe<Scalars['SignalPluralityEnum']['input']>;
  shape?: InputMaybe<Scalars['SignalShapeEnum']['input']>;
  soundId?: InputMaybe<Scalars['ID']['input']>;
  soundId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  sourceId?: InputMaybe<Scalars['ID']['input']>;
  sourceId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


/** Global query */
export type QueryAllMaintenanceTypesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  interval?: InputMaybe<Scalars['Float']['input']>;
  interval_Gt?: InputMaybe<Scalars['Float']['input']>;
  interval_Gte?: InputMaybe<Scalars['Float']['input']>;
  interval_Lt?: InputMaybe<Scalars['Float']['input']>;
  interval_Lte?: InputMaybe<Scalars['Float']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllMaintenancesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['Date']['input']>;
  date_Gt?: InputMaybe<Scalars['Date']['input']>;
  date_Gte?: InputMaybe<Scalars['Date']['input']>;
  date_Lt?: InputMaybe<Scalars['Date']['input']>;
  date_Lte?: InputMaybe<Scalars['Date']['input']>;
  equipmentId?: InputMaybe<Scalars['ID']['input']>;
  equipmentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maintainerId?: InputMaybe<Scalars['ID']['input']>;
  maintainerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  maintainerInstitutionId?: InputMaybe<Scalars['ID']['input']>;
  maintainerInstitutionId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  typeId?: InputMaybe<Scalars['ID']['input']>;
  typeId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


/** Global query */
export type QueryAllPlatformTypesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  isMobile?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  platforms_Id?: InputMaybe<Scalars['Decimal']['input']>;
  platforms_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


/** Global query */
export type QueryAllPlatformsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  isMobile?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  ownerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  providerId?: InputMaybe<Scalars['ID']['input']>;
  providerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllProjectTypesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  projects_Id?: InputMaybe<Scalars['Decimal']['input']>;
  projects_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


/** Global query */
export type QueryAllProjectsArgs = {
  accessibility?: InputMaybe<Scalars['AccessibilityEnum']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  campaigns_Id?: InputMaybe<Scalars['Decimal']['input']>;
  campaigns_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  doi?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['Date']['input']>;
  endDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  endDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  endDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  endDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  financing?: InputMaybe<Scalars['FinancingEnum']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  projectGoal?: InputMaybe<Scalars['String']['input']>;
  projectGoal_Icontains?: InputMaybe<Scalars['String']['input']>;
  projectType?: InputMaybe<Scalars['Decimal']['input']>;
  projectType_Id?: InputMaybe<Scalars['Decimal']['input']>;
  projectType_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  sites_Id?: InputMaybe<Scalars['Decimal']['input']>;
  sites_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  startDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  startDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  startDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  startDate_Lte?: InputMaybe<Scalars['Date']['input']>;
};


/** Global query */
export type QueryAllRecorderSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelsCount?: InputMaybe<Scalars['Int']['input']>;
  channelsCount_Gt?: InputMaybe<Scalars['Int']['input']>;
  channelsCount_Gte?: InputMaybe<Scalars['Int']['input']>;
  channelsCount_Lt?: InputMaybe<Scalars['Int']['input']>;
  channelsCount_Lte?: InputMaybe<Scalars['Int']['input']>;
  equipment_Id?: InputMaybe<Scalars['Decimal']['input']>;
  equipment_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  storageSlotsCount?: InputMaybe<Scalars['Int']['input']>;
  storageSlotsCount_Gt?: InputMaybe<Scalars['Int']['input']>;
  storageSlotsCount_Gte?: InputMaybe<Scalars['Int']['input']>;
  storageSlotsCount_Lt?: InputMaybe<Scalars['Int']['input']>;
  storageSlotsCount_Lte?: InputMaybe<Scalars['Int']['input']>;
  storageType?: InputMaybe<Scalars['String']['input']>;
  storageType_Icontains?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllSitesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  deployments_Id?: InputMaybe<Scalars['Decimal']['input']>;
  deployments_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  projectId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


/** Global query */
export type QueryAllSoundsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  codeName?: InputMaybe<Scalars['String']['input']>;
  codeName_Icontains?: InputMaybe<Scalars['String']['input']>;
  englishName?: InputMaybe<Scalars['String']['input']>;
  englishName_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  frenchName?: InputMaybe<Scalars['String']['input']>;
  frenchName_Icontains?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  labels_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  taxon?: InputMaybe<Scalars['String']['input']>;
  taxon_Icontains?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllSourcesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  codeName?: InputMaybe<Scalars['String']['input']>;
  codeName_Icontains?: InputMaybe<Scalars['String']['input']>;
  englishName?: InputMaybe<Scalars['String']['input']>;
  englishName_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  frenchName?: InputMaybe<Scalars['String']['input']>;
  frenchName_Icontains?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  labels_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latinName?: InputMaybe<Scalars['String']['input']>;
  latinName_Icontains?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  taxon?: InputMaybe<Scalars['String']['input']>;
  taxon_Icontains?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllStorageSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  equipment_Id?: InputMaybe<Scalars['Decimal']['input']>;
  equipment_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAllWebsiteProjectsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ordering?: InputMaybe<Scalars['String']['input']>;
};


/** Global query */
export type QueryAudioPropertyByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryAuthorByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryBibliographyArticleByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryBibliographyByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryBibliographyConferenceByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryBibliographyPosterByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryBibliographySoftwareByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryCampaignByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryChannelConfigurationByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryChannelConfigurationDetectorSpecificationByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryChannelConfigurationRecorderSpecificationByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryContactByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryContactRoleByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryDeploymentByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryDeploymentMobilePositionByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryDetectionPropertyByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryEquipmentByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryFileByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryFileFormatByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryHydrophoneSpecificationByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryInstitutionByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryLabelByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryMaintenanceByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryMaintenanceTypeByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryPlatformByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryPlatformTypeByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryProjectByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryProjectTypeByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryRecorderSpecificationByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QuerySiteByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QuerySoundByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QuerySourceByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryStorageSpecificationByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Global query */
export type QueryTagByIdArgs = {
  id: Scalars['ID']['input'];
};

export type RecorderSpecificationNode = Node & {
  __typename?: 'RecorderSpecificationNode';
  /** Number of all the channels on the recorder, even if unused. */
  channelsCount?: Maybe<Scalars['Int']['output']>;
  equipmentSet: EquipmentNodeConnection;
  id: Scalars['ID']['output'];
  storageMaximumCapacity?: Maybe<Array<Scalars['String']['output']>>;
  storageSlotsCount?: Maybe<Scalars['Int']['output']>;
  storageType?: Maybe<Scalars['String']['output']>;
};


export type RecorderSpecificationNodeEquipmentSetArgs = {
  acousticDetectorSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  batterySlotsCount?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gte?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lte?: InputMaybe<Scalars['Int']['input']>;
  batteryType?: InputMaybe<Scalars['String']['input']>;
  batteryType_Icontains?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cables?: InputMaybe<Scalars['String']['input']>;
  cables_Icontains?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationHydrophoneSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationHydrophoneSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationRecorderSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationRecorderSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hydrophoneSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  model?: InputMaybe<Scalars['String']['input']>;
  model_Icontains?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  ownerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  providerId?: InputMaybe<Scalars['ID']['input']>;
  providerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  purchaseDate?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  recorderSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  serialNumber_Icontains?: InputMaybe<Scalars['String']['input']>;
  storageSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
};

export type RecorderSpecificationNodeNodeConnection = {
  __typename?: 'RecorderSpecificationNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<RecorderSpecificationNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type SiteNode = Node & {
  __typename?: 'SiteNode';
  /** Conceptual location. A site may group together several platforms in relatively close proximity, or describes a location where regular deployments are carried out. */
  deployments: DeploymentNodeConnection;
  id: Scalars['ID']['output'];
  /** Name of the platform conceptual location. A site may group together several platforms in relatively close proximity, or describes a location where regular deployments are carried out. */
  name: Scalars['String']['output'];
  /** Project associated to this site */
  project: ProjectNode;
};


export type SiteNodeDeploymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  bathymetricDepth?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Gt?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Gte?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Lt?: InputMaybe<Scalars['Int']['input']>;
  bathymetricDepth_Lte?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  campaignId?: InputMaybe<Scalars['ID']['input']>;
  campaignId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contacts_Id?: InputMaybe<Scalars['Decimal']['input']>;
  contacts_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  deploymentDate?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  deploymentVessel?: InputMaybe<Scalars['String']['input']>;
  deploymentVessel_Icontains?: InputMaybe<Scalars['String']['input']>;
  description_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  latitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Gte?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lt?: InputMaybe<Scalars['Float']['input']>;
  longitude_Lte?: InputMaybe<Scalars['Float']['input']>;
  mobilePositions_Id?: InputMaybe<Scalars['Decimal']['input']>;
  mobilePositions_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  projectId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  project_WebsiteProject_Id?: InputMaybe<Scalars['Decimal']['input']>;
  recoveryDate?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Gt?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Gte?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Lt?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryDate_Lte?: InputMaybe<Scalars['DateTime']['input']>;
  recoveryVessel?: InputMaybe<Scalars['String']['input']>;
  recoveryVessel_Icontains?: InputMaybe<Scalars['String']['input']>;
  siteId?: InputMaybe<Scalars['ID']['input']>;
  siteId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type SiteNodeConnection = {
  __typename?: 'SiteNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<SiteNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `SiteNode` and its cursor. */
export type SiteNodeEdge = {
  __typename?: 'SiteNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<SiteNode>;
};

export type SiteNodeNodeConnection = {
  __typename?: 'SiteNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<SiteNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type SoundNode = Node & {
  __typename?: 'SoundNode';
  children: SoundNodeConnection;
  codeName?: Maybe<Scalars['String']['output']>;
  englishName: Scalars['String']['output'];
  frenchName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  labels: LabelNodeConnection;
  parent?: Maybe<SoundNode>;
  relatedBibliography: BibliographyNodeConnection;
  taxon?: Maybe<Scalars['String']['output']>;
};


export type SoundNodeChildrenArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  codeName?: InputMaybe<Scalars['String']['input']>;
  codeName_Icontains?: InputMaybe<Scalars['String']['input']>;
  englishName?: InputMaybe<Scalars['String']['input']>;
  englishName_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  frenchName?: InputMaybe<Scalars['String']['input']>;
  frenchName_Icontains?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  labels_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  taxon?: InputMaybe<Scalars['String']['input']>;
  taxon_Icontains?: InputMaybe<Scalars['String']['input']>;
};


export type SoundNodeLabelsArgs = {
  acousticDetectors_Id?: InputMaybe<Scalars['Decimal']['input']>;
  acousticDetectors_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  meanDuration?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gte?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lte?: InputMaybe<Scalars['Float']['input']>;
  minFrequency?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  nickname_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  plurality?: InputMaybe<Scalars['SignalPluralityEnum']['input']>;
  shape?: InputMaybe<Scalars['SignalShapeEnum']['input']>;
  soundId?: InputMaybe<Scalars['ID']['input']>;
  soundId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  sourceId?: InputMaybe<Scalars['ID']['input']>;
  sourceId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type SoundNodeRelatedBibliographyArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  doi?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  publicationDate?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['StatusEnum']['input']>;
  tags_Name?: InputMaybe<Scalars['String']['input']>;
  tags_Name_In?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_Icontains?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['TypeEnum']['input']>;
};

export type SoundNodeConnection = {
  __typename?: 'SoundNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<SoundNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `SoundNode` and its cursor. */
export type SoundNodeEdge = {
  __typename?: 'SoundNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<SoundNode>;
};

export type SoundNodeNodeConnection = {
  __typename?: 'SoundNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<SoundNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type SourceNode = Node & {
  __typename?: 'SourceNode';
  children: SourceNodeConnection;
  codeName?: Maybe<Scalars['String']['output']>;
  englishName: Scalars['String']['output'];
  frenchName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  labels: LabelNodeConnection;
  latinName?: Maybe<Scalars['String']['output']>;
  parent?: Maybe<SourceNode>;
  relatedBibliography: BibliographyNodeConnection;
  taxon?: Maybe<Scalars['String']['output']>;
};


export type SourceNodeChildrenArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  codeName?: InputMaybe<Scalars['String']['input']>;
  codeName_Icontains?: InputMaybe<Scalars['String']['input']>;
  englishName?: InputMaybe<Scalars['String']['input']>;
  englishName_Icontains?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  frenchName?: InputMaybe<Scalars['String']['input']>;
  frenchName_Icontains?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  labels_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latinName?: InputMaybe<Scalars['String']['input']>;
  latinName_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  taxon?: InputMaybe<Scalars['String']['input']>;
  taxon_Icontains?: InputMaybe<Scalars['String']['input']>;
};


export type SourceNodeLabelsArgs = {
  acousticDetectors_Id?: InputMaybe<Scalars['Decimal']['input']>;
  acousticDetectors_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  children_Id?: InputMaybe<Scalars['Decimal']['input']>;
  children_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  labels_Id?: InputMaybe<Scalars['Decimal']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  maxFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  meanDuration?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Gte?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lt?: InputMaybe<Scalars['Float']['input']>;
  meanDuration_Lte?: InputMaybe<Scalars['Float']['input']>;
  minFrequency?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Gte?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lt?: InputMaybe<Scalars['Int']['input']>;
  minFrequency_Lte?: InputMaybe<Scalars['Int']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  nickname_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  plurality?: InputMaybe<Scalars['SignalPluralityEnum']['input']>;
  shape?: InputMaybe<Scalars['SignalShapeEnum']['input']>;
  soundId?: InputMaybe<Scalars['ID']['input']>;
  soundId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  sourceId?: InputMaybe<Scalars['ID']['input']>;
  sourceId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type SourceNodeRelatedBibliographyArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  doi?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  publicationDate?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['StatusEnum']['input']>;
  tags_Name?: InputMaybe<Scalars['String']['input']>;
  tags_Name_In?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_Icontains?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['TypeEnum']['input']>;
};

export type SourceNodeConnection = {
  __typename?: 'SourceNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<SourceNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `SourceNode` and its cursor. */
export type SourceNodeEdge = {
  __typename?: 'SourceNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<SourceNode>;
};

export type SourceNodeNodeConnection = {
  __typename?: 'SourceNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<SourceNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type StorageSpecificationNode = Node & {
  __typename?: 'StorageSpecificationNode';
  capacity: Array<Scalars['String']['output']>;
  equipmentSet: EquipmentNodeConnection;
  id: Scalars['ID']['output'];
  type?: Maybe<Scalars['String']['output']>;
};


export type StorageSpecificationNodeEquipmentSetArgs = {
  acousticDetectorSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  batterySlotsCount?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Gte?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lt?: InputMaybe<Scalars['Int']['input']>;
  batterySlotsCount_Lte?: InputMaybe<Scalars['Int']['input']>;
  batteryType?: InputMaybe<Scalars['String']['input']>;
  batteryType_Icontains?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cables?: InputMaybe<Scalars['String']['input']>;
  cables_Icontains?: InputMaybe<Scalars['String']['input']>;
  channelConfigurationDetectorSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationDetectorSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationHydrophoneSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationHydrophoneSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurationRecorderSpecifications_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurationRecorderSpecifications_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  channelConfigurations_Id?: InputMaybe<Scalars['Decimal']['input']>;
  channelConfigurations_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hydrophoneSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maintenances_Id?: InputMaybe<Scalars['Decimal']['input']>;
  maintenances_Id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  model?: InputMaybe<Scalars['String']['input']>;
  model_Icontains?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_Icontains?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  ownerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  providerId?: InputMaybe<Scalars['ID']['input']>;
  providerId_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  purchaseDate?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  purchaseDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  recorderSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  serialNumber_Icontains?: InputMaybe<Scalars['String']['input']>;
  storageSpecification_Isnull?: InputMaybe<Scalars['Boolean']['input']>;
};

export type StorageSpecificationNodeNodeConnection = {
  __typename?: 'StorageSpecificationNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<StorageSpecificationNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TagNode = Node & {
  __typename?: 'TagNode';
  bibliographySet: BibliographyNodeConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};


export type TagNodeBibliographySetArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  doi?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  publicationDate?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Gte?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lt?: InputMaybe<Scalars['Date']['input']>;
  publicationDate_Lte?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['StatusEnum']['input']>;
  tags_Name?: InputMaybe<Scalars['String']['input']>;
  tags_Name_In?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_Icontains?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['TypeEnum']['input']>;
};

export type TagNodeConnection = {
  __typename?: 'TagNodeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<TagNodeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `TagNode` and its cursor. */
export type TagNodeEdge = {
  __typename?: 'TagNodeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<TagNode>;
};

export type TagNodeNodeConnection = {
  __typename?: 'TagNodeNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfoExtra;
  /** Contains the nodes in this connection. */
  results: Array<Maybe<TagNode>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};
