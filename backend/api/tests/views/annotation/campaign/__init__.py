"""Annotation campaigns tests"""
from .archive import (
    ArchiveUnauthenticatedTestCase,
    ArchiveOwnerAuthenticatedTestCase,
    ArchiveAnnotatorAuthenticatedTestCase,
    ArchiveBaseUserAuthenticatedTestCase,
    ArchiveAdminAuthenticatedTestCase,
)
from .create import (
    CreateBaseUserAuthenticatedTestCase,
    CreateUnauthenticatedTestCase,
    CreateAdminAuthenticatedTestCase,
)
from .list import (
    ListUnauthenticatedTestCase,
    ListEmpyAdminAuthenticatedTestCase,
    ListFilledAdminAuthenticatedTestCase,
    ListFilledCampaignOwnerAuthenticatedTestCase,
    ListFilledBaseUserAuthenticatedTestCase,
    ListFilledBaseUserNoCampaignAuthenticatedTestCase,
)
from .patch import (
    PatchUnauthenticatedTestCase,
    PatchAdminAuthenticatedTestCase,
)
from .retrieve import (
    RetrieveUnauthenticatedTestCase,
    RetrieveEmpyAdminAuthenticatedTestCase,
    RetrieveFilledAdminAuthenticatedTestCase,
    RetrieveFilledCampaignOwnerAuthenticatedTestCase,
    RetrieveFilledBaseUserAuthenticatedTestCase,
    RetrieveFilledBaseUserNoCampaignAuthenticatedTestCase,
)
