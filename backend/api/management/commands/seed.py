import os, glob

from datetime import datetime
from random import randint, choice

#from faker import Faker

from django.core import management, files
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from django.utils import timezone

from django.contrib.auth.models import User
from backend.api.models import DatasetType, GeoMetadatum, AudioMetadatum, Dataset, AnnotationSet, AnnotationCampaign

class Command(management.BaseCommand):
    help = 'Seeds the DB with fake data (deletes all existing data first)'

    def add_arguments(self, parser):
        parser.add_argument('--init-only', action='store_true', default=False, help='Only run the first time')

    def handle(self, *args, **options):
        # If init_only we run only if there is no seeded data yet
        if options['init_only'] and User.objects.count() > 0:
            return

        # Cleanup
        management.call_command('flush', verbosity=0, interactive=False)

        # Creation
        self.datafile_count = 50
        self._create_users()
        self._create_datasets()
        self._create_annotation_sets()
        self._create_annotation_campaigns()
        self._create_spectro_configs()
        self._create_annotation_results()

    def _create_users(self):
        users = ['dc', 'ek', 'ja', 'pnhd', 'ad', 'rv']
        password = 'osmose29'
        self.admin = User.objects.create_user('admin', 'admin@osmose.xyz', password, is_superuser=True, is_staff=True)
        self.users = [self.admin]
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
            audio_metadatum=audio_metadatum, geo_metadatum=geo_metadatum, owner=self.admin,
            dataset_path='seed/dataset_path')
        for k in range(self.datafile_count):
            start = parse_datetime('2012-10-03T12:00:00+0200')
            end = start + timedelta(minutes=15)
            audio_metadatum = AudioMetadatum.objects.create(start=(start + timedelta(hours=k)), end=(end + timedelta(hours=k)))
            self.dataset.files.create(filename=f'sound{k:03d}.wav', filepath='audio/50h_0.wav', size=58982478, audio_metadatum=audio_metadatum)

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
        self.campaigns = []
        for campaign_data, annotation_set in zip(campaigns, self.annotation_sets):
            campaign = AnnotationCampaign.objects.create(**campaign_data, annotation_set=annotation_set, owner=self.admin)
            campaign.datasets.add(self.dataset)
            for file in self.dataset.files.all():
                for user in self.users:
                    campaign.tasks.create(dataset_file=file, annotator=user, status=0)
            self.campaigns.append(campaign)

    def _create_spectro_configs(self):
        spectro_config1 = self.dataset.spectro_configs.create(
            name='spectro_config1',
            nfft=4096,
            window_size=2000,
            overlap=90,
            zoom_level=8
        )
        spectro_config2 = self.dataset.spectro_configs.create(
            name='spectro_config1',
            nfft=2048,
            window_size=1000,
            overlap=90,
            zoom_level=8
        )
        self.campaigns[0].spectro_configs.add(spectro_config2)
        for campaign in self.campaigns:
            campaign.spectro_configs.add(spectro_config1)
            campaign.save()

    def _create_annotation_results(self):
        campaign = self.campaigns[0]
        tags = self.annotation_sets[0].tags.values_list('id', flat=True)
        for user in self.users:
            done_files = randint(5, self.datafile_count - 5)
            tasks = campaign.tasks.filter(annotator_id=user.id)[:done_files]
            for task in tasks:
                for _ in range(randint(1,5)):
                    start_time = randint(0, 600)
                    start_frequency = randint(0, 10000)
                    task.results.create(
                        start_time = start_time,
                        end_time = start_time + randint(30, 300),
                        start_frequency = start_frequency,
                        end_frequency = start_frequency + randint(2000, 5000),
                        annotation_tag_id = choice(tags)
                    )
                task.status = 2
                task.save()
