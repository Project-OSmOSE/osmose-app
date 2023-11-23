import os, glob
from random import randint, choice, shuffle
from datetime import datetime, timedelta

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
    ConfidenceIndicator,
    ConfidenceIndicatorSet,
    AnnotationComment,
    AnnotationResult,
    News,
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
        self.main_datafile_count = 50
        self._create_users()
        self._create_datasets()
        self._create_annotation_sets()
        self._create_confidence_sets()
        self._create_annotation_campaigns()
        self._create_spectro_configs()
        self._create_annotation_results()
        self._create_comments()
        self._create_news()

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
        self.dataset_1 = Dataset.objects.create(
            name="SPM Aural A 2010",
            start_date=timezone.make_aware(datetime.strptime("2010-08-19", "%Y-%m-%d")),
            end_date=timezone.make_aware(datetime.strptime("2010-11-02", "%Y-%m-%d")),
            files_type=".wav",
            status=1,
            dataset_type=dataset_type,
            audio_metadatum=audio_metadatum,
            geo_metadatum=geo_metadatum,
            owner=self.admin,
            dataset_path="seed/dataset_path",
        )
        self.dataset_2 = Dataset.objects.create(
            name="New Test Dataset",
            start_date=timezone.make_aware(datetime.strptime("2010-08-19", "%Y-%m-%d")),
            end_date=timezone.make_aware(datetime.strptime("2010-11-02", "%Y-%m-%d")),
            files_type=".wav",
            status=1,
            dataset_type=dataset_type,
            audio_metadatum=audio_metadatum,
            geo_metadatum=geo_metadatum,
            owner=self.admin,
            dataset_path="seed/dataset_path",
        )

        for dataset, datafile_count in [
            (self.dataset_1, self.main_datafile_count),
            (self.dataset_2, 30),
        ]:
            for k in range(datafile_count):
                start = parse_datetime("2012-10-03T12:00:00+0200")
                end = start + timedelta(minutes=15)
                audio_metadatum = AudioMetadatum.objects.create(
                    start=(start + timedelta(hours=k)), end=(end + timedelta(hours=k))
                )
                dataset.files.create(
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

    def _create_confidence_sets(self):

        confidenceIndicatorSet = ConfidenceIndicatorSet.objects.create(
            name="Confident/NotConfident",
            desc=self.faker.paragraph(nb_sentences=5),
        )

        confidence_0 = ConfidenceIndicator.objects.create(
            label="not confident",
            level=0,
            confidence_indicator_set=confidenceIndicatorSet,
        )
        confidence_1 = ConfidenceIndicator.objects.create(
            label="confident",
            level=1,
            confidence_indicator_set=confidenceIndicatorSet,
            is_default=True,
        )
        self.confidences_indicators = [confidence_0, confidence_1]
        self.confidenceIndicatorSet = confidenceIndicatorSet

    def _create_annotation_campaigns(self):
        print(" ###### _create_annotation_campaigns ######")
        campaigns = [
            {
                "name": "Test SPM campaign",
                "desc": "Test annotation campaign",
                "start": timezone.make_aware(
                    datetime.strptime("2010-08-19", "%Y-%m-%d")
                ),
                "end": timezone.make_aware(datetime.strptime("2010-11-02", "%Y-%m-%d")),
                "instructions_url": "https://en.wikipedia.org/wiki/Saint_Pierre_and_Miquelon",
                "annotation_scope": 1,
                "annotation_set": self.annotation_sets["Test SPM campaign"],
                "dataset": self.dataset_1,
                "confidence_indicator_set": self.confidenceIndicatorSet,
            },
            {
                "name": "Test DCLDE LF campaign",
                "desc": "Test annotation campaign DCLDE LF 2015",
                "start": timezone.make_aware(
                    datetime.strptime("2012-06-22", "%Y-%m-%d")
                ),
                "end": timezone.make_aware(datetime.strptime("2012-06-26", "%Y-%m-%d")),
                "annotation_set": self.annotation_sets["Test DCLDE LF campaign"],
                "annotation_scope": 2,
                "dataset": self.dataset_1,
                "confidence_indicator_set": self.confidenceIndicatorSet,
            },
            {
                "name": "Many tags campaign",
                "desc": "Test annotation campaign with many tags",
                "start": timezone.make_aware(
                    datetime.strptime("2012-06-22", "%Y-%m-%d")
                ),
                "end": timezone.make_aware(datetime.strptime("2012-06-26", "%Y-%m-%d")),
                "annotation_set": self.annotation_sets["Big tag set"],
                "annotation_scope": 2,
                "dataset": self.dataset_2,
                "confidence_indicator_set": self.confidenceIndicatorSet,
            },
            {
                "name": "Test SPM campaign No Confidence",
                "desc": "Test annotation campaign with many tags",
                "start": timezone.make_aware(
                    datetime.strptime("2012-06-22", "%Y-%m-%d")
                ),
                "end": timezone.make_aware(datetime.strptime("2012-06-26", "%Y-%m-%d")),
                "annotation_set": self.annotation_sets["Test SPM campaign"],
                "annotation_scope": 2,
                "dataset": self.dataset_2,
                "confidence_indicator_set": None,
            },
        ]
        self.campaigns = []
        for campaign_data in campaigns:
            dataset = campaign_data.pop("dataset")
            campaign = AnnotationCampaign.objects.create(
                **campaign_data,
                owner=self.admin,
            )

            campaign.datasets.add(dataset)
            for file in dataset.files.all():
                for user in self.users:
                    campaign.tasks.create(dataset_file=file, annotator=user, status=0)
            self.campaigns.append(campaign)

    def _create_spectro_configs(self):
        print(" ###### _create_spectro_configs ######")
        window_type = WindowType.objects.create(name="Hamming")
        spectro_config_1 = self.dataset_1.spectro_configs.create(
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
        spectro_config_2 = self.dataset_2.spectro_configs.create(
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
        spectro_config_3 = self.dataset_1.spectro_configs.create(
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

        self.campaigns[0].spectro_configs.add(spectro_config_1)
        self.campaigns[0].spectro_configs.add(spectro_config_3)
        self.campaigns[1].spectro_configs.add(spectro_config_1)
        self.campaigns[2].spectro_configs.add(spectro_config_2)

    def _create_annotation_results(self):
        print(" ###### _create_annotation_results ######")
        campaign = self.campaigns[0]
        tags = list(self.annotation_sets.values())[0].tags.values_list("id", flat=True)
        for user in self.users:
            done_files = randint(5, self.main_datafile_count - 5)
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
                        confidence_indicator=choice(self.confidences_indicators),
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

    def _generate_news_body(self):
        body = ""
        for _ in range(randint(1, 5)):
            body += f"<h2>{self.faker.sentence(nb_words=10)}</h2>"
            paragraphs = [
                f"<p>{para}</p>" for para in self.faker.paragraphs(nb=randint(1, 5))
            ]
            for _ in range(0, randint(0, 2)):
                paragraphs.append(
                    f"<img src='https://api.dicebear.com/7.x/identicon/svg?seed={self.faker.word()}' width='{100 + 50 * randint(0, 3)}px'>"
                )
            shuffle(paragraphs)
            body += "".join(paragraphs)
        return body

    def _create_news(self):
        print(" ###### _create_news ######")
        for _ in range(randint(3, 8)):
            News.objects.create(
                title=self.faker.sentence(nb_words=10)[:255],
                intro=self.faker.paragraph(nb_sentences=5)[:255],
                body=self._generate_news_body(),
                date=self.faker.date_time_between(start_date="-1y", end_date="now"),
                vignette=f"https://api.dicebear.com/7.x/identicon/svg?seed={self.faker.word()}",
            )
