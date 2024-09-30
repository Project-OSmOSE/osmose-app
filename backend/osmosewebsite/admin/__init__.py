"""OSmOSE Website API Administration"""
from django.contrib import admin
from backend.osmosewebsite.models import (
    TeamMember,
    News,
    Collaborator,
    Project,
)
from .team_member import TeamMemberAdmin
from .collaborator import CollaboratorAdmin
from .news import NewsAdmin
from .project import ProjectAdmin
from .scientific_talk import ScientificTalkAdmin

admin.site.register(TeamMember, TeamMemberAdmin)
admin.site.register(News, NewsAdmin)
admin.site.register(Collaborator, CollaboratorAdmin)
admin.site.register(Project, ProjectAdmin)
