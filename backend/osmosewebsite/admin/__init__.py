"""OSmOSE Website API Administration"""
from django.contrib import admin
from backend.osmosewebsite.models import TeamMember, News
from .team_member import TeamMemberAdmin
from .news import NewsAdmin

admin.site.register(TeamMember, TeamMemberAdmin)
admin.site.register(News, NewsAdmin)
