"""Annotation result tests"""
from .list import (
    ListUnauthenticatedTestCase,
    ListEmpyAdminAuthenticatedTestCase,
    ListFilledAdminAuthenticatedTestCase,
    ListFilledCampaignOwnerAuthenticatedTestCase,
    ListFilledBaseUserAuthenticatedTestCase,
)
from .post import (
    PostUnauthenticatedTestCase,
    PostBaseUserAuthenticatedTestCase,
    PostAnnotatorAuthenticatedTestCase,
    PostCampaignOwnerAuthenticatedTestCase,
    PostAdminAuthenticatedTestCase,
)
from .import_results import (
    ImportUnauthenticatedTestCase,
    ImportBaseUserAuthenticatedTestCase,
    ImportAnnotatorAuthenticatedTestCase,
    ImportCampaignOwnerAuthenticatedTestCase,
    ImportAdminAuthenticatedTestCase,
)
