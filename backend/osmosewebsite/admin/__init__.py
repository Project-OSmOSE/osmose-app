"""OSmOSE Website API Administration"""
from django.contrib import admin

from backend.osmosewebsite.models import (
    TeamMember,
    News,
    Collaborator,
)
from .collaborator import CollaboratorAdmin
from .news import NewsAdmin
from .project import ProjectAdmin
from .scientific_talk import ScientificTalkAdmin
from .team_member import TeamMemberAdmin

admin.site.register(TeamMember, TeamMemberAdmin)
admin.site.register(News, NewsAdmin)
admin.site.register(Collaborator, CollaboratorAdmin)
