# pylint: disable=missing-module-docstring, missing-class-docstring, missing-function-docstring
from django.test import TestCase

from backend.api.models import Dataset, AudioMetadatum
from backend.aplose.models import User


class MetadataTestCase(TestCase):
    def test_delete_dataset(self):
        user = User.objects.create_user(username="testuser", password="password")

        original_dataset_nb = Dataset.objects.count()
        dataset = Dataset.objects.create(
            name="Test delete",
            dataset_path="test/delete",
            status=0,
            files_type="test",
            owner=user,
        )
        self.assertEqual(Dataset.objects.count(), original_dataset_nb + 1)

        original_audio_metadatum_nb = AudioMetadatum.objects.count()
        dataset.audio_metadatum = AudioMetadatum.objects.create()
        dataset.save()
        self.assertEqual(
            AudioMetadatum.objects.count(), original_audio_metadatum_nb + 1
        )

        dataset.delete()
        self.assertEqual(Dataset.objects.count(), original_dataset_nb)
        self.assertEqual(AudioMetadatum.objects.count(), original_audio_metadatum_nb)
