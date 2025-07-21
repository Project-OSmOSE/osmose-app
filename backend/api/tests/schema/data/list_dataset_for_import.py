"""API data GraphQL tests - List datasets for import"""
# pylint: disable=missing-class-docstring, missing-function-docstring
import json
from os.path import join

from django.conf import settings
from django.test import override_settings
from graphene_django.utils.testing import GraphQLTestCase

IMPORT_FIXTURES = settings.FIXTURE_DIRS[1] / "data" / "dataset" / "list_to_import"

QUERY = """
query {
    allDatasetsAvailableForImport {
        name
        path
        legacy
        analysis {
            name
            path
        }
    }
}
"""


class AllDatasetsAvailableForImportTestCase(GraphQLTestCase):

    GRAPHQL_URL = "/api/graphql"
    fixtures = ["users"]

    def tearDown(self):
        """Logout when tests ends"""
        self.client.logout()

    def test_not_connected(self):
        response = self.query(QUERY)
        self.assertResponseHasErrors(response)
        content = json.loads(response.content)
        self.assertEqual(content["errors"][0]["message"], "Unauthorized")

    def test_connected_not_staff(self):
        self.client.login(username="user1", password="osmose29")
        response = self.query(QUERY)
        self.assertResponseHasErrors(response)
        content = json.loads(response.content)
        self.assertEqual(content["errors"][0]["message"], "Forbidden")

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "legacy_good")
    def test_list_legacy(self):
        self.client.login(username="staff", password="osmose29")
        response = self.query(QUERY)
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allDatasetsAvailableForImport"]
        self.assertEqual(len(content), 1)
        self.assertEqual(content[0]["name"], "gliderSPAmsDemo")
        self.assertEqual(content[0]["path"], "gliderSPAmsDemo")
        self.assertEqual(len(content[0]["analysis"]), 1)
        self.assertEqual(content[0]["analysis"][0]["name"], "4096_512_85")
        self.assertEqual(
            content[0]["analysis"][0]["path"],
            join("processed", "spectrogram", "600_480", "4096_512_85"),
        )

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "good")
    def test_list(self):
        self.client.login(username="staff", password="osmose29")
        response = self.query(QUERY)
        self.assertResponseNoErrors(response)

        content = json.loads(response.content)["data"]["allDatasetsAvailableForImport"]
        self.assertEqual(len(content), 1)
        self.assertEqual(content[0]["name"], "tp_osekit")
        self.assertEqual(content[0]["path"], "tp_osekit")
        self.assertEqual(len(content[0]["analysis"]), 1)
        self.assertEqual(content[0]["analysis"][0]["name"], "my_first_analysis")
        self.assertEqual(
            content[0]["analysis"][0]["path"], join("processed", "my_first_analysis")
        )
