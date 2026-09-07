import json

from django_extension.tests import ExtendedTestCase

from backend.api.tests.fixtures import ALL_FIXTURES
from backend.aplose.models import User

QUERY = """
query (
    $annotatorID: ID!
    $campaignID: ID!
    $phaseType: AnnotationPhaseType!

    # Pagination
    $limit: Int!
    $offset: Int!

    # Filtering
    $search: String
    $status: AnnotationTaskStatus
    $from: DateTime
    $to: DateTime

    $withAnnotations: Boolean
    $annotationLabel: ID
    $annotationConfidence: ID
    $annotationDetector: ID
    $annotationAnnotator: ID
    $withAcousticFeatures: Boolean
) {
    allAnnotationSpectrograms(
        # Sort
        limit: $limit
        offset: $offset
        orderBy: "start"

        # Only assigned
        annotator: $annotatorID
        annotationCampaign: $campaignID
        phase: $phaseType

        # Search
        filename_Icontains: $search

        # Dates filters
        end_Gte: $from
        start_Lte: $to

        # Task filters
        annotationTasks_Status: $status

        # Annotation filters
        annotations_Exists: $withAnnotations
        annotations_Label: $annotationLabel
        annotations_Confidence: $annotationConfidence
        annotations_Detector: $annotationDetector
        annotations_Annotator: $annotationAnnotator
        annotations_AcousticFeatures_Exists: $withAcousticFeatures
    ) {
        totalCount
        resumeSpectrogramId(phase: $phaseType, campaignId: $campaignID)
        results {
            id
            filename
            start
            duration
            isAssigned(campaignId: $campaignID, phase: $phaseType)

            task(
                phase: $phaseType
                campaignId: $campaignID
            ) {
                status
                annotations: userAnnotations(
                    annotator: $annotationAnnotator
                    label: $annotationLabel
                    confidence: $annotationConfidence
                    detectorConfiguration_Detector: $annotationDetector
                    acousticFeatures_Exists: $withAcousticFeatures
                ) {
                    totalCount
                }
                validatedAnnotations: annotationsToCheck(
                    isValidatedBy: $annotatorID
                    annotator: $annotationAnnotator
                    label: $annotationLabel
                    confidence: $annotationConfidence
                    detectorConfiguration_Detector: $annotationDetector
                    acousticFeatures_Exists: $withAcousticFeatures
                ) {
                    totalCount
                }
            }
        }
        totalCount
    }
    
    _debug { exceptions { stack } }
}
"""
QUERY_FOR_SPECTROGRAM = """
query (
    $spectrogramID: ID!
    $annotatorID: ID!
    $campaignID: ID!
    $phaseType: AnnotationPhaseType!
) {
    allAnnotationSpectrograms(
        # Sort
        orderBy: "start"

        # Only assigned
        annotator: $annotatorID
        annotationCampaign: $campaignID
        phase: $phaseType
    ) {
        currentIndex(spectrogramId: $spectrogramID)
        totalCount
        previousSpectrogramId(spectrogramId: $spectrogramID)
        nextSpectrogramId(spectrogramId: $spectrogramID)
    }
}
"""
VARIABLES = {
    "annotatorID": 1,
    "campaignID": 1,
    "phaseType": "Annotation",
    "limit": 20,
    "offset": 0,
    "search": None,
    "status": None,
    "from": None,
    "to": None,
    "withAnnotations": None,
    "annotationLabel": None,
    "annotationConfidence": None,
    "annotationDetector": None,
    "annotationAnnotator": None,
    "withAcousticFeatures": None,
}
VARIABLES_FOR_SPECTROGRAM = {
    "spectrogramID": 1,
    "annotatorID": 1,
    "campaignID": 1,
    "phaseType": "Annotation",
}


class AllAnnotationSpectrogramsTestCase(ExtendedTestCase):
    # pylint: disable=too-many-public-methods

    GRAPHQL_URL = "/api/graphql"
    fixtures = ALL_FIXTURES

    def tearDown(self):
        """Logout when tests ends"""
        self.client.logout()

    def test_not_connected(self):
        response = self.gql_query(QUERY, variables=VARIABLES)
        self.assertResponseHasErrors(response)
        content = json.loads(response.content)
        self.assertEqual(content["errors"][0]["message"], "Unauthorized")

    def test_connected_owner(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="user1"),
            variables={
                **VARIABLES,
                "annotatorID": 3,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 11)
        self.assertFalse(content["results"][0]["isAssigned"])

    def test_connected_empty_user(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="user4"),
            variables={
                **VARIABLES,
                "annotatorID": 6,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 0)

    def test_connected_annotator(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="user2"),
            variables={
                **VARIABLES,
                "annotatorID": 4,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        results = content["results"]
        self.assertEqual(content["totalCount"], 4)
        self.assertEqual(content["resumeSpectrogramId"], "7")
        self.assertEqual(results[0]["id"], "7")
        self.assertTrue(results[0]["isAssigned"])
        self.assertEqual(results[0]["filename"], "sound007")
        self.assertEqual(results[0]["task"]["annotations"]["totalCount"], 3)

    def test_connected_admin(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        results = content["results"]
        self.assertEqual(content["totalCount"], 11)
        self.assertEqual(content["resumeSpectrogramId"], "2")
        self.assertEqual(results[0]["id"], "1")
        self.assertTrue(results[0]["isAssigned"])
        self.assertEqual(results[0]["filename"], "sound001")
        self.assertEqual(results[0]["task"]["annotations"]["totalCount"], 3)
        self.assertFalse(results[6]["isAssigned"])

    def test_connected_admin_for_spectrogram(self):
        response = self.gql_query(
            QUERY_FOR_SPECTROGRAM,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES_FOR_SPECTROGRAM,
                "annotatorID": 1,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 11)
        self.assertEqual(content["currentIndex"], 0)
        self.assertIsNone(content["previousSpectrogramId"])
        self.assertEqual(content["nextSpectrogramId"], "2")

    # Filters

    def test_connected_admin__search_empty(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "search": "sound020",  # This file does not exist
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 0)

    def test_connected_admin__search_correct(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "search": "sound001",  # This file is assigned to this user
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 1)

    def test_connected_admin__status_finished(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "status": "Finished",
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 1)

    def test_connected_admin__status_created(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "status": "Created",
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 5)

    def test_connected_admin__label_empty(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "withAnnotations": True,
                "annotationLabel": 3,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 0)

    def test_connected_admin__label(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "withAnnotations": True,
                "annotationLabel": 2,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 1)

    def test_connected_admin__confidence_empty(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "withAnnotations": True,
                "annotationConfidence": 3,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 0)

    def test_connected_admin__confidence(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "withAnnotations": True,
                "annotationConfidence": 1,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 1)

    def test_connected_admin__acoustic_features_exists(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "withAnnotations": True,
                "withAcousticFeatures": True,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 1)

    def test_connected_admin__acoustic_features_not_exists(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "withAnnotations": True,
                "withAcousticFeatures": False,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 1)

    def test_connected_admin__with_annotations(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "withAnnotations": True,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 1)

    def test_connected_admin__without_annotations(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "withAnnotations": False,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 5)

    def test_connected_admin__detector_empty(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "withAnnotations": True,
                "annotationDetector": 2,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 0)

    def test_connected_admin__detector(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "campaignID": 4,
                "phaseType": "Verification",
                "annotatorID": 1,
                "withAnnotations": True,
                "annotationDetector": 1,
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 1)

    def test_connected_admin__from(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "from": "2012-10-03 11:00:02+00:00",
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 10)

    def test_connected_admin__to(self):
        response = self.gql_query(
            QUERY,
            user=User.objects.get(username="admin"),
            variables={
                **VARIABLES,
                "annotatorID": 1,
                "to": "2012-10-03 11:00:02+00:00",
            },
        )
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allAnnotationSpectrograms"]
        self.assertEqual(content["totalCount"], 2)
