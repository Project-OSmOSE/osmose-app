"""All Django models available"""

from .bibliography import Bibliography, PublicationType, PublicationStatus, Author
from .collaborator import Collaborator
from .news import News
from .project import Project
from .scientific_talk import ScientificTalk
from .scientist import Scientist, Institution
from .team_member import TeamMember
