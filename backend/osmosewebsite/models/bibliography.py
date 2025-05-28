"""Bibliography models"""
from django.db import models
from django.db.models import Q

from .team_member import TeamMember


class PublicationStatus(models.TextChoices):
    """Bibliography publication status"""

    DRAFT = ("D", "Draft")
    IN_REVIEW = ("R", "In Review")
    PUBLISHED = ("P", "Published")


class PublicationType(models.TextChoices):
    """Type of bibliography"""

    SOFTWARE = ("S", "Software")
    ARTICLE = ("A", "Article")


class Bibliography(models.Model):
    """Bibliography model"""

    class Meta:
        verbose_name_plural = "Bibliography"
        constraints = [
            models.CheckConstraint(
                name="Published publication has a publication date",
                check=(
                    Q(
                        publication_status=PublicationStatus.PUBLISHED,
                        publication_date__isnull=False,
                    )
                    | ~Q(publication_status=PublicationStatus.PUBLISHED)
                ),
            ),
            models.CheckConstraint(
                name="Article has required fields",
                check=~Q(
                    type=PublicationType.ARTICLE,
                )
                | Q(
                    type=PublicationType.ARTICLE,
                    journal__isnull=False,
                ),
            ),
            models.CheckConstraint(
                name="Software has required fields",
                check=~Q(
                    type=PublicationType.SOFTWARE,
                )
                | Q(
                    type=PublicationType.SOFTWARE,
                    publication_place__isnull=False,
                ),
            ),
        ]

    def __str__(self):
        return self.title

    title = models.CharField(max_length=255)
    doi = models.CharField(max_length=255, null=True, blank=True, unique=True)

    publication_status = models.CharField(
        choices=PublicationStatus.choices,
        max_length=1,
    )
    publication_date = models.DateField(
        null=True, blank=True, help_text="Required for any published bibliography"
    )

    type = models.CharField(
        choices=PublicationType.choices,
        max_length=1,
    )

    # Article fields
    journal = models.CharField(
        max_length=255, null=True, blank=True, help_text="Required for an article"
    )
    volumes = models.CharField(max_length=255, null=True, blank=True)
    pages_from = models.PositiveIntegerField(null=True, blank=True)
    pages_to = models.PositiveIntegerField(null=True, blank=True)
    issue_nb = models.PositiveIntegerField(null=True, blank=True)
    article_nb = models.PositiveIntegerField(null=True, blank=True)

    # Software fields
    publication_place = models.CharField(
        max_length=255, null=True, blank=True, help_text="Required for a software"
    )
    repository_url = models.URLField(null=True, blank=True)

    @property
    def publication(self):
        """Get publication status and date when apply"""
        if self.publication_status == PublicationStatus.PUBLISHED:
            return f"{self.publication_status} {self.publication_date}"
        return self.publication_status


class Author(models.Model):
    """Bibliography author model"""

    class Meta:
        unique_together = (("order", "bibliography"),)
        constraints = [
            models.CheckConstraint(
                name="Author has a name XOR a team member",
                check=(
                    Q(name__isnull=False, team_member__isnull=True)
                    | Q(name__isnull=True, team_member__isnull=False)
                ),
            )
        ]

    def __str__(self):
        if self.team_member:
            return f"{self.order} {self.team_member.bibliography_name}"
        return f"{self.order} {self.name}"

    order = models.PositiveIntegerField()
    bibliography = models.ForeignKey(
        to=Bibliography,
        on_delete=models.CASCADE,
        related_name="authors",
    )

    # Author denomination
    team_member = models.ForeignKey(
        to=TeamMember,
        on_delete=models.DO_NOTHING,
        related_name="authors",
        blank=True,
        null=True,
    )
    name = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Required if no team member is provided (format: {lastname}, {first letter of firstname}.)",
    )
