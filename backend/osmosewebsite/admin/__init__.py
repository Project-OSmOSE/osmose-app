"""OSmOSE Website API Administration"""
from django.contrib import admin
from backend.osmosewebsite.models import TeamMember, News, Collaborator, Project, Trap
from .team_member import TeamMemberAdmin
from .collaborator import CollaboratorAdmin
from .news import NewsAdmin
from .project import ProjectAdmin
from .trap import TrapAdmin

admin.site.register(TeamMember, TeamMemberAdmin)
admin.site.register(News, NewsAdmin)
admin.site.register(Trap, TrapAdmin)
admin.site.register(Collaborator, CollaboratorAdmin)
admin.site.register(Project, ProjectAdmin)
