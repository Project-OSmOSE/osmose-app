from datetime import datetime, timedelta
from random import randint, choice, shuffle

from django.contrib.auth.models import User
from django.core import management
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from faker import Faker

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
    AnnotationTask,
    DatasetFile,
    SpectroConfig,
)


class BigDataCommand(management.BaseCommand):
    help = "Seeds the DB with fake data (deletes all existing data first)"
    fake = Faker()

    users = []
    main_datafile_count = 50
    data_count = range(1, 20)
    files_count = range(1, randint(200, 10000))

    def handle(self, *args, **options):
        # Cleanup
        management.call_command("flush", verbosity=0, interactive=False)

        # Creation
        self._create_users()
        self._create_metadata()
        self._create_datasets()
        self._create_annotation_sets()
        self._create_confidence_sets()
        AnnotationCampaign.objects.all().delete()
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
        self.users.append(self.admin)
        for user in users:
            self.users.append(
                User.objects.create_user(user, f"{user}@osmose.xyz", password)
            )

    def _create_metadata(self):
        print(" ###### _create_metadata ######")
        self.dataset_type = DatasetType.objects.create(name="Coastal audio recordings")
        self.audio_metadatum = AudioMetadatum.objects.create(
            channel_count=1,
            dataset_sr=32768,
            total_samples=88473600,
            sample_bits=16,
            gain_db=22,
            gain_rel=-165,
            dutycycle_rdm=45,
            dutycycle_rim=60,
        )
        self.geo_metadatum = GeoMetadatum.objects.create(
            name="Saint-Pierre-et-Miquelon", desc="South of Saint-Pierre-et-Miquelon"
        )

    def _create_datasets(self):
        print(" ###### _create_datasets ######")
        self.datasets = []
        for i in self.data_count:
            dataset = Dataset.objects.create(
                name=self.fake.name(),
                start_date=timezone.make_aware(
                    datetime.strptime("2010-08-19", "%Y-%m-%d")
                ),
                end_date=timezone.make_aware(
                    datetime.strptime("2010-11-02", "%Y-%m-%d")
                ),
                files_type=".wav",
                status=1,
                dataset_type=self.dataset_type,
                audio_metadatum=self.audio_metadatum,
                geo_metadatum=self.geo_metadatum,
                owner=self.admin,
                dataset_path="seed/dataset_path",
            )
            print("   >", dataset.id)
            self.datasets.append(dataset)

            files = []
            for k in self.files_count:
                start = parse_datetime("2012-10-03T12:00:00+0200")
                end = start + timedelta(minutes=15)
                audio_metadatum = AudioMetadatum.objects.create(
                    start=(start + timedelta(hours=k)), end=(end + timedelta(hours=k))
                )
                files.append(
                    DatasetFile(
                        filename=f"sound{k:03d}.wav",
                        filepath="data/audio/50h_0.wav",
                        size=58982478,
                        audio_metadatum=audio_metadatum,
                        dataset_id=dataset.id,
                    )
                )
            dataset.files.bulk_create(files)

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
                "tags": set([self.fake.color_name() for _ in range(0, 20)]),
            },
        ]
        self.annotation_sets = []
        for seed_set in sets:
            annotation_set = AnnotationSet.objects.create(
                name=seed_set["name"], desc=seed_set["desc"], owner=self.admin
            )
            for tag in seed_set["tags"]:
                annotation_set.tags.create(name=tag)
            self.annotation_sets.append(annotation_set)

    def _create_confidence_sets(self):
        self.confidence_indicator_set = ConfidenceIndicatorSet.objects.create(
            name="Confident/NotConfident",
            desc=self.fake.paragraph(nb_sentences=5),
        )

        confidence_0 = ConfidenceIndicator.objects.create(
            label="not confident",
            level=0,
            confidence_indicator_set=self.confidence_indicator_set,
        )
        confidence_1 = ConfidenceIndicator.objects.create(
            label="confident",
            level=1,
            confidence_indicator_set=self.confidence_indicator_set,
            is_default=True,
        )
        self.confidences_indicators = [confidence_0, confidence_1]

    def _create_annotation_campaigns(self):
        print(" ###### _create_annotation_campaigns ######")
        self.campaigns = []
        for i in self.data_count:
            dataset = self.datasets[i - 1]
            campaign = AnnotationCampaign.objects.create(
                name=self.fake.name(),
                desc=self.fake.sentence(),
                start=timezone.make_aware(datetime.strptime("2010-08-19", "%Y-%m-%d")),
                end=timezone.make_aware(datetime.strptime("2010-11-02", "%Y-%m-%d")),
                instructions_url=self.fake.uri(),
                annotation_scope=1,
                annotation_set=self.annotation_sets[0],
                confidence_indicator_set=self.confidence_indicator_set,
                owner=self.admin,
            )
            print("   >", campaign.id)
            self.campaigns.append(campaign)
            campaign.datasets.add(dataset)
            tasks = []
            for file in dataset.files.all():
                for user in self.users:
                    tasks.append(
                        AnnotationTask(
                            dataset_file=file,
                            annotator=user,
                            status=0,
                            annotation_campaign_id=campaign.id,
                        )
                    )
            campaign.tasks.bulk_create(tasks)

    def _create_spectro_configs(self):
        print(" ###### _create_spectro_configs ######")
        window_type = WindowType.objects.create(name="Hamming")
        spectro_data = {
            "name": "4096_4096_90",
            "nfft": 4096,
            "window_size": 4096,
            "overlap": 90,
            "zoom_level": 3,
            "spectro_normalization": "density",
            "data_normalization": "0",
            "zscore_duration": "0",
            "hp_filter_min_freq": 0,
            "colormap": "Blues",
            "dynamic_min": 0,
            "dynamic_max": 0,
            "window_type": window_type,
            "frequency_resolution": 0,
        }
        for i in self.data_count:
            spectro = SpectroConfig.objects.create(
                **spectro_data, dataset_id=self.datasets[i - 1].id
            )
            self.campaigns[i - 1].spectro_configs.add(spectro)
            self.campaigns[i - 1].save()

    def _create_annotation_results(self):
        print(" ###### _create_annotation_results ######")
        campaign = self.campaigns[0]
        tags = self.annotation_sets[0].tags.values_list("id", flat=True)
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
            body += f"<h2>{self.fake.sentence(nb_words=10)}</h2>"
            paragraphs = [
                f"<p>{para}</p>" for para in self.fake.paragraphs(nb=randint(1, 5))
            ]
            for _ in range(0, randint(0, 2)):
                paragraphs.append(
                    f"<p><img src='https://api.dicebear.com/7.x/identicon/svg?seed={self.fake.word()}' "
                    f"width='{100 + 50 * randint(0, 3)}px'/></p>"
                )
            shuffle(paragraphs)
            body += "".join(paragraphs)
        return body

    def _create_news(self):
        print(" ###### _create_news ######")
        for _ in range(randint(3, 8)):
            News.objects.create(
                title=self.fake.sentence(nb_words=10)[:255],
                intro=self.fake.paragraph(nb_sentences=5)[:255],
                body=self._generate_news_body(),
                date=self.fake.date_time_between(start_date="-1y", end_date="now"),
                vignette=f"https://api.dicebear.com/7.x/identicon/svg?seed={self.fake.word()}",
            )
