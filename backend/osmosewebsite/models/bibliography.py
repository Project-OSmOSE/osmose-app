"""Bibliography models"""
from django.db import models
from django.db.models import Q

from .scientist import Scientist, Institution


class PublicationStatus(models.TextChoices):
    """Bibliography publication status"""

    UPCOMING = ("U", "Upcoming")
    PUBLISHED = ("P", "Published")


class PublicationType(models.TextChoices):
    """Type of bibliography"""

    SOFTWARE = ("S", "Software")
    ARTICLE = ("A", "Article")
    CONFERENCE = ("C", "Conference")
    POSTER = ("P", "Poster")


class BibliographyTag(models.Model):
    """Bibliography tag"""

    def __str__(self):
        return self.name

    name = models.CharField(max_length=255, unique=True)


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
            models.CheckConstraint(
                name="Conference has required fields",
                check=~Q(
                    type=PublicationType.CONFERENCE,
                )
                | Q(
                    type=PublicationType.CONFERENCE,
                    conference__isnull=False,
                    conference_location__isnull=False,
                ),
            ),
        ]

    def __str__(self):
        return self.title

    title = models.CharField(max_length=255)
    doi = models.CharField(max_length=255, null=True, blank=True, unique=True)
    tags = models.ManyToManyField(BibliographyTag, blank=True)

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

    # Conference & Poster fields
    conference = models.CharField(
        max_length=255, null=True, blank=True, help_text="Required for a conference"
    )
    conference_abstract_book_url = models.URLField(null=True, blank=True)
    conference_location = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Required for a conference (format: {City}, {Country})",
    )

    # Poster fields
    poster_url = models.URLField(null=True, blank=True)

    @property
    def publication(self):
        """Get publication status and date when apply"""
        status = PublicationStatus(self.publication_status).label
        if self.publication_status == PublicationStatus.PUBLISHED:
            return f"{status} {self.publication_date}"
        return status


class Author(models.Model):
    """Bibliography author model"""

    class Meta:
        unique_together = (("order", "bibliography"),)

    def __str__(self):
        return f"{self.order} {self.scientist.short_name}"

    order = models.PositiveIntegerField()
    bibliography = models.ForeignKey(
        to=Bibliography,
        on_delete=models.CASCADE,
        related_name="authors",
    )
    scientist = models.ForeignKey(
        to=Scientist,
        on_delete=models.CASCADE,
        related_name="authors",
        blank=True,
        null=True,
    )
    institutions = models.ManyToManyField(
        Institution, related_name="bibliography_authors", blank=True
    )
