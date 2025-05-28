"""Bibliography models tests"""
from django.test import TestCase

from backend.osmosewebsite.models import (
    TeamMember,
    Bibliography,
    PublicationStatus,
    PublicationType,
    Author,
)


class AuthorTestCase(TestCase):
    """Bibliography author tests"""

    def test_delete_teammember(self):
        member = TeamMember.objects.create(
            firstname="John",
            lastname="Doe",
            position="Intern",
        )
        bibliography = Bibliography.objects.create(
            title="Bibliography",
            publication_status=PublicationStatus.DRAFT,
            type=PublicationType.SOFTWARE,
            publication_place="GitHub",
        )
        author = Author.objects.create(
            order=1,
            bibliography=bibliography,
            team_member=member,
        )

        member.delete()

        author = Author.objects.get(pk=author.pk)
        self.assertIsNone(author.team_member)
        self.assertEqual(author.name, "Doe, J.")
