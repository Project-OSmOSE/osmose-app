# TODO : Faker is a dev tool that shouldn't be needed in production
# however currently start.sh calls this command indiscriminately so it fails
# in production if faker is imported at the start. Removing the failure on import
# is a quickfix however another solution like changing start.sh might be better.

from random import Random
from faker import Faker

from django.core.management.base import BaseCommand

from backend.osmosewebsite.models import TeamMember, News


class Command(BaseCommand):
    help = "Seeds the DB with fake data (deletes all existing data first)"
    fake = Faker()
    random = Random()

    def handle(self, *args, **options):

        # Creation
        self._create_team_members()
        self._create_news()

    def _create_team_members(self):
        print(" ###### _create_team_members ######")
        for _ in range(0, self.random.randrange(start=1, stop=25)):
            profile = self.fake.profile()
            websites = profile["website"]
            TeamMember.objects.create(
                firstname=self.fake.first_name(),
                lastname=self.fake.last_name(),
                position=profile["job"],
                biography="\n".join(self.fake.paragraphs(5)),
                picture="https://osmose.ifremer.fr/static/media/team_dodo_420_420.38e7fc104498740d44ca.webp",
                mail_address=profile["mail"],
                research_gate_url=websites[0] if len(websites) > 0 else None,
                personal_website_url=websites[1] if len(websites) > 1 else None,
                github_url=websites[2] if len(websites) > 2 else None,
                linkedin_url=websites[3] if len(websites) > 3 else None,
            )

    def _create_former_team_members(self):
        print(" ###### _create_former_team_members ######")
        for _ in range(0, self.random.randrange(start=1, stop=15)):
            profile = self.fake.profile()
            websites = profile["website"]
            TeamMember.objects.create(
                firstname=self.fake.first_name(),
                lastname=self.fake.last_name(),
                position=profile["job"],
                biography="\n".join(self.fake.paragraphs(5)),
                picture="https://osmose.ifremer.fr/static/media/team_dodo_420_420.38e7fc104498740d44ca.webp",
                mail_address=profile["mail"],
                research_gate_url=websites[0] if len(websites) > 0 else None,
                personal_website_url=websites[1] if len(websites) > 1 else None,
                github_url=websites[2] if len(websites) > 2 else None,
                linkedin_url=websites[3] if len(websites) > 3 else None,
                is_former_member=True,
            )

    def _generate_news_body(self):
        body = ""
        for _ in range(self.random.randrange(1, 5)):
            body += f"<h2>{self.fake.sentence(nb_words=10)}</h2>"
            paragraphs = [
                f"<p>{para}</p>"
                for para in self.fake.paragraphs(nb=self.random.randrange(1, 5))
            ]
            for _ in range(0, self.random.randrange(0, 2)):
                paragraphs.append(
                    f"<img src='https://api.dicebear.com/7.x/identicon/svg?seed={self.fake.word()}' width='{100 + 50 * self.random.randint(0, 3)}px'>"
                )
            self.random.shuffle(paragraphs)
            body += "".join(paragraphs)
        return body

    def _create_news(self):
        print(" ###### _create_news ######")
        for _ in range(self.random.randrange(start=5, stop=15)):
            News.objects.create(
                title=self.fake.sentence(nb_words=10)[:255],
                intro=self.fake.paragraph(nb_sentences=5)[:255],
                body=self._generate_news_body(),
                date=self.fake.date_time_between(start_date="-1y", end_date="now"),
                vignette=f"https://api.dicebear.com/7.x/identicon/svg?seed={self.fake.word()}",
            )
