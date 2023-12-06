# TODO : Faker is a dev tool that shouldn't be needed in production
# however currently start.sh calls this command indiscriminately so it fails
# in production if faker is imported at the start. Removing the failure on import
# is a quickfix however another solution like changing start.sh might be better.

from random import Random
from faker import Faker

from django.core.management.base import BaseCommand

from backend.osmosewebsite.models import TeamMember


class Command(BaseCommand):
    help = "Seeds the DB with fake data (deletes all existing data first)"
    fake = Faker()
    random = Random()

    def handle(self, *args, **options):
        # Cleanup
        self._clear_team_members()

        # Creation
        self._create_current_team_members()
        self._create_former_team_members()

    def _create_current_team_members(self):
        print(" ###### _create_current_team_members ######")
        for _ in range(0, self.random.randrange(start=1, stop=25)):
            profile = self.fake.profile()
            websites = profile["website"]
            TeamMember.objects.create(
                name=profile["name"],
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
                name=profile["name"],
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

    def _clear_team_members(self):
        print(" ###### _clear_team_members ######")
        TeamMember.objects.all().delete()
