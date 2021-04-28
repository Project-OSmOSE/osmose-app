import os, glob

from datetime import datetime

#from faker import Faker

from django.core import management, files
from django.utils import timezone

from django.contrib.auth.models import User
from backend.api.models import DatasetType, GeoMetadatum, AudioMetadatum, Dataset, AnnotationSet

class Command(management.BaseCommand):
    help = 'Seeds the DB with fake data (deletes all existing data first)'

    def handle(self, *args, **options):
        #self.faker = Faker()
        # Cleanup
        management.call_command('flush', verbosity=0, interactive=False)
        # Creation
        self._create_users()
        self._create_datasets()
        self._create_annotation_sets()
        self._create_annotation_campaigns()

    def _create_users(self):
        users = ['dc', 'ek', 'ja', 'pnhd', 'ad', 'rv']
        password = 'osmose29'
        self.admin = User.objects.create_user('admin', 'admin@osmose.xyz', password, is_superuser=True)
        for user in users:
            User.objects.create_user(user, f'{user}@osmose.xyz', password)

    def _create_datasets(self):
        dataset_type = DatasetType.objects.create(name='Coastal audio recordings')
        audio_metadatum = AudioMetadatum.objects.create(num_channels=1, sample_rate_khz=32768,
            total_samples=88473600, sample_bits=16, gain_db=22, gain_rel=-165, dutycycle_rdm=45,
            dutycycle_rim=60)
        geo_metadatum = GeoMetadatum.objects.create(name='Saint-Pierre-et-Miquelon',
            desc='South of Saint-Pierre-et-Miquelon')
        Dataset.objects.create(name='SPM Aural A 2010', start_date='2010-08-19',
            end_date='2010-11-02', files_type='WAV files', status=1, dataset_type=dataset_type,
            audio_metadatum=audio_metadatum, geo_metadatum=geo_metadatum, owner=self.admin)

    def _create_annotation_sets(self):
        sets = [
            {
                'name': 'Test SPM campaign',
                'desc': 'Annotation set made for Test SPM campaign',
                'tags': ['Mysticetes', 'Odoncetes', 'Boat', 'Rain', 'Other']
            }, {
                'name': 'Test DCLDE LF campaign',
                'desc': 'Test annotation campaign DCLDE LF 2015',
                'tags': ['Dcall', '40-Hz']
            }
        ]
        for seed_set in sets:
            annotation_set = AnnotationSet.objects.create(name=seed_set['name'], desc=seed_set['desc'], owner=self.admin)
            for tag in seed_set['tags']:
                annotation_set.tags.create(name=tag)

    def _create_annotation_campaigns(self):
        pass

