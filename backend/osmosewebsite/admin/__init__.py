from django.contrib import admin
from backend.osmosewebsite.models import TeamMember
from .team_member import TeamMemberAdmin

admin.site.register(TeamMember, TeamMemberAdmin)
