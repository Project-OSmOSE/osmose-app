"""OSmOSE Website API Administration"""
from django.contrib import admin

from backend.osmosewebsite.models import (
    News,
    Collaborator,
)
from .bibliography import BibliographyAdmin, BibliographyTagAdmin
from .collaborator import CollaboratorAdmin
from .news import NewsAdmin
from .project import ProjectAdmin
from .scientific_talk import ScientificTalkAdmin
from .scientist import ScientistAdmin, InstitutionAdmin
from .team_member import TeamMemberAdmin

admin.site.register(News, NewsAdmin)
admin.site.register(Collaborator, CollaboratorAdmin)
