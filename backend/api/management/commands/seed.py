import os, glob

from datetime import datetime

#from faker import Faker

from django.core import management, files
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from django.utils import timezone

from django.contrib.auth.models import User
from backend.api.models import DatasetType, GeoMetadatum, AudioMetadatum, Dataset, AnnotationSet, AnnotationCampaign

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
        self.users = []
        for user in users:
            self.users.append(User.objects.create_user(user, f'{user}@osmose.xyz', password))

    def _create_datasets(self):
        dataset_type = DatasetType.objects.create(name='Coastal audio recordings')
        audio_metadatum = AudioMetadatum.objects.create(num_channels=1, sample_rate_khz=32768,
            total_samples=88473600, sample_bits=16, gain_db=22, gain_rel=-165, dutycycle_rdm=45,
            dutycycle_rim=60)
        geo_metadatum = GeoMetadatum.objects.create(name='Saint-Pierre-et-Miquelon',
            desc='South of Saint-Pierre-et-Miquelon')
        self.dataset = Dataset.objects.create(name='SPM Aural A 2010', start_date='2010-08-19',
            end_date='2010-11-02', files_type='.wav', status=1, dataset_type=dataset_type,
            audio_metadatum=audio_metadatum, geo_metadatum=geo_metadatum, owner=self.admin)
        for k in range(50):
            start = parse_datetime('2012-10-03T12:00:00+0200')
            end = start + timedelta(minutes=15)
            audio_metadatum = AudioMetadatum.objects.create(start=(start + timedelta(hours=k)), end=(end + timedelta(hours=k)))
            self.dataset.files.create(filename=f'sound{k:03d}.wav', size=58982478, audio_metadatum=audio_metadatum)

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
        self.annotation_sets = []
        for seed_set in sets:
            annotation_set = AnnotationSet.objects.create(name=seed_set['name'], desc=seed_set['desc'], owner=self.admin)
            for tag in seed_set['tags']:
                annotation_set.tags.create(name=tag)
            self.annotation_sets.append(annotation_set)

    def _create_annotation_campaigns(self):
        campaigns = [
            {'name': 'Test SPM campaign', 'desc': 'Test annotation campaign', 'start': '2010-08-19', 'end': '2010-11-02',
            'instructions_url': 'https://en.wikipedia.org/wiki/Saint_Pierre_and_Miquelon'},
            {'name': 'Test DCLDE LF campaign', 'desc': 'Test annotation campaign DCLDE LF 2015', 'start': '2012-06-22',
            'end': '2012-06-26'},
        ]
        for campaign_data, annotation_set in zip(campaigns, self.annotation_sets):
            campaign = AnnotationCampaign.objects.create(**campaign_data, annotation_set=annotation_set, owner=self.admin)
            campaign.datasets.add(self.dataset)
            for file in self.dataset.files.all():
                for user in self.users + [self.admin]:
                    campaign.tasks.create(dataset_file=file, annotator=user, status=0)
