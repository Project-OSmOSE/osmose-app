"""OSmOSE Website API Serializers"""
from .bibliography import BibliographySerializer, AuthorSerializer
from .collaborator import CollaboratorSerializer
from .news import NewsSerializer
from .project import ProjectSerializer, DeploymentSerializer
from .scientific_talk import ScientificTalkSerializer
from .scientist import ScientistSerializer, InstitutionSerializer
from .team_member import TeamMemberSerializer
