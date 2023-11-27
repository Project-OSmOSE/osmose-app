# TODO : Faker is a dev tool that shouldn't be needed in production
# however currently start.sh calls this command indiscriminately so it fails
# in production if faker is imported at the start. Removing the failure on import
# is a quickfix however another solution like changing start.sh might be better.
import random

try:
    from faker import Faker
except ImportError:
    pass

from django.core.management.base import BaseCommand
from random import Random

from backend.osmosewebsite.models import TeamMember


class Command(BaseCommand):
    help = "Seeds the DB with fake data (deletes all existing data first)"
    fake = Faker()
    random = Random()

    def handle(self, *args, **options):
        # Cleanup
        self._clear_team_members()

        # Creation
        self._create_team_members()

    def _create_team_members(self):
        print(" ###### _create_team_members ######")
        for _ in range(0, self.random.randrange(start=1, stop=25)):
            profile = self.fake.profile()
            websites = profile['website']
            TeamMember.objects.create(
                name=profile['name'],
                position=profile['job'],
                biography='\n'.join(self.fake.paragraphs(5)),
                picture="https://osmose.ifremer.fr/static/media/team_dodo_420_420.38e7fc104498740d44ca.webp",
                mailAddress=profile['mail'],
                researchGateURL=websites[0] if len(websites) > 0 else None,
                personalWebsiteURL=websites[1] if len(websites) > 1 else None,
                githubURL=websites[2] if len(websites) > 2 else None,
                linkedinURL=websites[3] if len(websites) > 3 else None,
            )
        for _ in range(0, self.random.randrange(start=1, stop=15)):
            profile = self.fake.profile()
            websites = profile['website']
            TeamMember.objects.create(
                name=profile['name'],
                position=profile['job'],
                biography='\n'.join(self.fake.paragraphs(5)),
                picture="https://osmose.ifremer.fr/static/media/team_dodo_420_420.38e7fc104498740d44ca.webp",
                mailAddress=profile['mail'],
                researchGateURL=websites[0] if len(websites) > 0 else None,
                personalWebsiteURL=websites[1] if len(websites) > 1 else None,
                githubURL=websites[2] if len(websites) > 2 else None,
                linkedinURL=websites[3] if len(websites) > 3 else None,
                isFormerMember=True
            )

    def _clear_team_members(self):
        print(" ###### _clear_team_members ######")
        TeamMember.objects.all().delete()
