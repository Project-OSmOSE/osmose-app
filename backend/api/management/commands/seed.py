import os, glob

from datetime import datetime
from random import randint, choice


# TODO : Faker is a dev tool that shouldn't be needed in production
# however currently start.sh calls this command indiscriminately so it fails
# in production if faker is imported at the start. Removing the failure on import
# is a quickfix however another solution like changing start.sh might be better.
try:
    from faker import Faker
except ImportError:
    pass

from django.core import management, files
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from django.utils import timezone

from django.contrib.auth.models import User
from backend.api.models import (
    DatasetType,
    GeoMetadatum,
    AudioMetadatum,
    Dataset,
    AnnotationSet,
    AnnotationCampaign,
    WindowType,
    AnnotationComment,
    AnnotationResult,
)


class Command(management.BaseCommand):
    help = "Seeds the DB with fake data (deletes all existing data first)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--init-only",
            action="store_true",
            default=False,
            help="Only run the first time",
        )

    def handle(self, *args, **options):
        # If init_only we run only if there is no seeded data yet
        if options["init_only"] and User.objects.count() > 0:
            return

        # Cleanup
        management.call_command("flush", verbosity=0, interactive=False)

        # Creation
        self.faker = Faker()
        self.datafile_count = 50
        self._create_users()
        self._create_datasets()
        self._create_annotation_sets()
        self._create_annotation_campaigns()
        self._create_spectro_configs()
        self._create_annotation_results()
        self._create_comments()

    def _create_users(self):
        users = ["dc", "ek", "ja", "pnhd", "ad", "rv"]
        password = "osmose29"
        self.admin = User.objects.create_user(
            "admin", "admin@osmose.xyz", password, is_superuser=True, is_staff=True
        )
        self.users = [self.admin]
        for user in users:
            self.users.append(
                User.objects.create_user(user, f"{user}@osmose.xyz", password)
            )

    def _create_datasets(self):
        print(" ###### _create_datasets ######")
        dataset_type = DatasetType.objects.create(name="Coastal audio recordings")
        audio_metadatum = AudioMetadatum.objects.create(
            channel_count=1,
            dataset_sr=32768,
            total_samples=88473600,
            sample_bits=16,
            gain_db=22,
            gain_rel=-165,
            dutycycle_rdm=45,
            dutycycle_rim=60,
        )
        geo_metadatum = GeoMetadatum.objects.create(
            name="Saint-Pierre-et-Miquelon", desc="South of Saint-Pierre-et-Miquelon"
        )
        self.dataset = Dataset.objects.create(
            name="SPM Aural A 2010",
            start_date="2010-08-19",
            end_date="2010-11-02",
            files_type=".wav",
            status=1,
            dataset_type=dataset_type,
            audio_metadatum=audio_metadatum,
            geo_metadatum=geo_metadatum,
            owner=self.admin,
            dataset_path="seed/dataset_path",
            created_at=datetime.today(),
        )
        for k in range(self.datafile_count):
            start = parse_datetime("2012-10-03T12:00:00+0200")
            end = start + timedelta(minutes=15)
            audio_metadatum = AudioMetadatum.objects.create(
                start=(start + timedelta(hours=k)), end=(end + timedelta(hours=k))
            )
            self.dataset.files.create(
                filename=f"sound{k:03d}.wav",
                filepath="data/audio/50h_0.wav",
                size=58982478,
                audio_metadatum=audio_metadatum,
            )

    def _create_annotation_sets(self):
        print(" ###### _create_annotation_sets ######")
        sets = [
            {
                "name": "Test SPM campaign",
                "desc": "Annotation set made for Test SPM campaign",
                "tags": ["Mysticetes", "Odoncetes", "Boat", "Rain", "Other"],
            },
            {
                "name": "Test DCLDE LF campaign",
                "desc": "Test annotation set DCLDE LF 2015",
                "tags": ["Dcall", "40-Hz"],
            },
            {
                "name": "Big tag set",
                "desc": "Test annotation set with lots of tags",
                "tags": set([self.faker.color_name() for _ in range(0, 20)]),
            },
        ]
        self.annotation_sets = {}
        for seed_set in sets:
            annotation_set = AnnotationSet.objects.create(
                name=seed_set["name"], desc=seed_set["desc"], owner=self.admin
            )
            for tag in seed_set["tags"]:
                annotation_set.tags.create(name=tag)
            self.annotation_sets[seed_set["name"]] = annotation_set

    def _create_annotation_campaigns(self):
        print(" ###### _create_annotation_campaigns ######")
        campaigns = [
            {
                "name": "Test SPM campaign",
                "desc": "Test annotation campaign",
                "start": "2010-08-19",
                "end": "2010-11-02",
                "instructions_url": "https://en.wikipedia.org/wiki/Saint_Pierre_and_Miquelon",
                "annotation_scope": 1,
                "annotation_set": self.annotation_sets["Test SPM campaign"],
                "created_at": datetime.today(),
            },
            {
                "name": "Test DCLDE LF campaign",
                "desc": "Test annotation campaign DCLDE LF 2015",
                "start": "2012-06-22",
                "end": "2012-06-26",
                "annotation_set": self.annotation_sets["Test DCLDE LF campaign"],
                "annotation_scope": 2,
                "created_at": datetime.today(),
            },
            {
                "name": "Many tags campaign",
                "desc": "Test annotation campaign with many tags",
                "start": "2012-06-22",
                "end": "2012-06-26",
                "annotation_set": self.annotation_sets["Big tag set"],
                "annotation_scope": 2,
                "created_at": datetime.today(),
            },
        ]
        self.campaigns = []
        for campaign_data in campaigns:
            campaign = AnnotationCampaign.objects.create(
                **campaign_data, owner=self.admin
            )
            campaign.datasets.add(self.dataset)
            for file in self.dataset.files.all():
                for user in self.users:
                    campaign.tasks.create(dataset_file=file, annotator=user, status=0)
            self.campaigns.append(campaign)

    def _create_spectro_configs(self):
        print(" ###### _create_spectro_configs ######")
        window_type = WindowType.objects.create(name="Hamming")
        spectro_config1 = self.dataset.spectro_configs.create(
            name="4096_4096_90",
            nfft=4096,
            window_size=4096,
            overlap=90,
            zoom_level=3,
            spectro_normalization="density",
            data_normalization="0",
            zscore_duration="0",
            hp_filter_min_freq=0,
            colormap="Blues",
            dynamic_min=0,
            dynamic_max=0,
            window_type=window_type,
            frequency_resolution=0,
        )
        spectro_config2 = self.dataset.spectro_configs.create(
            name="2048_1000_90",
            nfft=2048,
            window_size=1000,
            overlap=90,
            zoom_level=3,
            spectro_normalization="density",
            data_normalization="0",
            zscore_duration="0",
            hp_filter_min_freq=0,
            colormap="Greens",
            dynamic_min=0,
            dynamic_max=0,
            window_type=window_type,
            frequency_resolution=0,
        )
        self.campaigns[0].spectro_configs.add(spectro_config2)
        for campaign in self.campaigns:
            campaign.spectro_configs.add(spectro_config1)
            campaign.save()

    def _create_annotation_results(self):
        print(" ###### _create_annotation_results ######")
        campaign = self.campaigns[0]
        tags = list(self.annotation_sets.values())[0].tags.values_list("id", flat=True)
        for user in self.users:
            done_files = randint(5, self.datafile_count - 5)
            tasks = campaign.tasks.filter(annotator_id=user.id)[:done_files]
            for task in tasks:
                if randint(1, 3) >= 2:
                    AnnotationComment.objects.create(
                        comment="a comment",
                        annotation_task=task,
                        annotation_result=None,
                    )
                for _ in range(randint(1, 5)):
                    start_time = randint(0, 600)
                    start_frequency = randint(0, 10000)
                    task.results.create(
                        start_time=start_time,
                        end_time=start_time + randint(30, 300),
                        start_frequency=start_frequency,
                        end_frequency=start_frequency + randint(2000, 5000),
                        annotation_tag_id=choice(tags),
                    )
                task.status = 2
                task.save()

    def _create_comments(self):
        print(" ###### _create_comments ######")
        results = AnnotationResult.objects.all()

        for result in results:
            if randint(1, 3) >= 2:
                AnnotationComment.objects.create(
                    comment=f"a comment : {result.annotation_tag.name}",
                    annotation_task=result.annotation_task,
                    annotation_result=result,
                )
