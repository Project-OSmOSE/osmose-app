# TODO : Faker is a dev tool that shouldn't be needed in production
# however currently start.sh calls this command indiscriminately so it fails
# in production if faker is imported at the start. Removing the failure on import
# is a quickfix however another solution like changing start.sh might be better.

from random import Random

from django.core.management.base import BaseCommand
from faker import Faker
from metadatax.common.models import Contact

from backend.osmosewebsite.models import (
    TeamMember,
    News,
    Collaborator,
    Project,
    ScientificTalk,
)

fake = Faker()
random = Random()


def get_fake_image_url():
    return fake.image_url(
        width=random.randint(300, 800), height=random.randint(100, 600)
    )


def generate_html_body(self):
    body = ""
    for _ in range(random.randint(1, 5)):
        body += f"<blockquote><p>{fake.sentence(nb_words=10)}</p></blockquote>"
        paragraphs = []
        for k in (0, random.randint(2, 5)):
            text = ""
            for paragraph in fake.paragraph(nb_sentences=random.randint(8, 15)):
                text += paragraph
            paragraphs.append(f"<p>{text}</p>")
        for _ in range(0, random.randint(0, 2)):
            paragraphs.append(
                f"<p><img src='{get_fake_image_url()}' alt='{fake.sentence()}'/></p>"
            )
        random.shuffle(paragraphs)
        body += "".join(paragraphs)
    return body


class Command(BaseCommand):
    help = "Seeds the DB with fake data (deletes all existing data first)"

    def handle(self, *args, **options):

        # Creation
        self._create_team_members()
        self._create_news()
        self._create_scientific_talk()
        self._create_collaborators()
        self._create_projects()

    def _create_team_members(self):
        print(" ###### _create_team_members ######")
        for _ in range(0, random.randrange(start=5, stop=25)):
            profile = fake.profile()
            websites = profile["website"]
            contact = Contact.objects.create(
                first_name=fake.first_name(),
                last_name=fake.last_name(),
            )
            TeamMember.objects.create(
                contact=contact,
                position=profile["job"],
                biography="\n".join(fake.paragraphs(5)),
                picture=f"https://api.dicebear.com/7.x/identicon/svg?seed={profile['name']}",
                mail_address=profile["mail"] if random.randint(0, 1) > 0 else None,
                research_gate_url=websites[0] if len(websites) > 0 else None,
                personal_website_url=websites[1] if len(websites) > 1 else None,
                github_url=websites[2] if len(websites) > 2 else None,
                linkedin_url=websites[3] if len(websites) > 3 else None,
            )
        for _ in range(0, random.randrange(start=1, stop=15)):
            profile = fake.profile()
            websites = profile["website"]
            contact = Contact.objects.create(
                first_name=fake.first_name(),
                last_name=fake.last_name(),
            )
            TeamMember.objects.create(
                contact=contact,
                position=profile["job"],
                biography="\n".join(fake.paragraphs(5)),
                picture=f"https://api.dicebear.com/7.x/identicon/svg?seed={profile['name']}",
                mail_address=profile["mail"] if random.randint(0, 1) > 0 else None,
                research_gate_url=websites[0] if len(websites) > 0 else None,
                personal_website_url=websites[1] if len(websites) > 1 else None,
                github_url=websites[2] if len(websites) > 2 else None,
                linkedin_url=websites[3] if len(websites) > 3 else None,
                is_former_member=True,
            )

    def _generate_html_body(self):
        body = ""
        for _ in range(random.randint(1, 5)):
            body += f"<blockquote><p>{fake.sentence(nb_words=10)}</p></blockquote>"
            paragraphs = []
            for k in (0, random.randint(2, 5)):
                text = ""
                for paragraph in fake.paragraph(nb_sentences=random.randint(8, 15)):
                    text += paragraph
                paragraphs.append(f"<p>{text}</p>")
            for _ in range(0, random.randint(0, 2)):
                paragraphs.append(
                    f"<p><img src='{get_fake_image_url()}' alt='{fake.sentence()}'/></p>"
                )
            random.shuffle(paragraphs)
            body += "".join(paragraphs)
        return body

    def _create_news(self):
        print(" ###### _create_news ######")
        for _ in range(0, random.randint(5, 15)):
            news = News.objects.create(
                title=fake.sentence(nb_words=10)[:255],
                intro=fake.paragraph(nb_sentences=5)[:255],
                body=self._generate_html_body(),
                date=fake.date_time_between(start_date="-1y", end_date="now"),
                thumbnail=f"https://api.dicebear.com/7.x/identicon/svg?seed={fake.word()}",
            )
            for i in range(1, random.randint(2, 5)):
                news.osmose_member_authors.add(TeamMember.objects.filter(id=i).first())
                news.save()
            other_authors = []
            for i in range(1, random.randint(2, 5)):
                other_authors.append(fake.name())
            news.other_authors = "{" + ",".join(other_authors) + "}"
            news.save()

    def _create_scientific_talk(self):
        print(" ###### _create_scientific_talk ######")
        for _ in range(0, random.randint(5, 15)):
            talk = ScientificTalk.objects.create(
                title=fake.sentence(nb_words=10)[:255],
                intro=fake.paragraph(nb_sentences=5)[:255],
                date=fake.date_time_between(start_date="-1y", end_date="now"),
                thumbnail=f"https://api.dicebear.com/7.x/identicon/svg?seed={fake.word()}",
            )
            for i in range(1, random.randint(2, 5)):
                talk.osmose_member_presenters.add(
                    TeamMember.objects.filter(id=i).first()
                )
                talk.save()

    def _create_collaborators(self):
        print(" ###### _create_collaborators ######")
        for i in range(0, random.randint(5, 15)):
            # OSmOSE Website Home page
            Collaborator.objects.create(
                name=fake.name(),
                level=random.randint(0, 5),
                thumbnail=get_fake_image_url(),
                url=fake.uri(),
                show_on_home_page=True,
                show_on_aplose_home=False,
            )
        for i in range(0, random.randint(0, 5)):
            # APLOSE Home page
            Collaborator.objects.create(
                name=fake.name(),
                level=random.randint(0, 5),
                thumbnail=get_fake_image_url(),
                url=fake.uri(),
                show_on_home_page=False,
                show_on_aplose_home=True,
            )
        for i in range(0, random.randint(5, 15)):
            # Other ones
            Collaborator.objects.create(
                name=fake.name(),
                thumbnail=get_fake_image_url(),
                url=fake.uri(),
                show_on_home_page=False,
                show_on_aplose_home=False,
            )

    def _create_projects(self):
        print(" ###### _create_projects ######")
        for _ in range(0, random.randint(5, 15)):
            project = Project.objects.create(
                title=fake.sentence(nb_words=10)[:255],
                intro=fake.paragraph(nb_sentences=5)[:255],
                body=self._generate_html_body(),
                start=fake.date_time_between(
                    start_date="-" + str(random.randint(3, 8)) + "y",
                    end_date="-3y",
                ),
                end=fake.date_time_between(
                    start_date="-" + str(random.randint(1, 3)) + "y",
                    end_date="now",
                ),
                thumbnail=get_fake_image_url(),
            )
            for i in range(1, random.randint(2, 3)):
                project.osmose_member_contacts.add(
                    TeamMember.objects.filter(id=i).first()
                )
                project.save()
            for i in range(1, random.randint(2, 7)):
                project.collaborators.add(Collaborator.objects.filter(id=i).first())
                project.save()
