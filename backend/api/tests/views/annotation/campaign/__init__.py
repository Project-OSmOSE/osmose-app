"""Annotation campaigns tests"""
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
from .report import (
    ReportFilledBaseUserAuthenticatedTestCase,
    ReportFilledCampaignOwnerAuthenticatedTestCase,
    ReportUnauthenticatedTestCase,
    ReportFilledBaseUserNoCampaignAuthenticatedTestCase,
    ReportFilledAdminAuthenticatedTestCase,
    ReportEmpyAdminAuthenticatedTestCase,
)
from .retrieve import (
    RetrieveUnauthenticatedTestCase,
    RetrieveEmpyAdminAuthenticatedTestCase,
    RetrieveFilledAdminAuthenticatedTestCase,
    RetrieveFilledCampaignOwnerAuthenticatedTestCase,
    RetrieveFilledBaseUserAuthenticatedTestCase,
    RetrieveFilledBaseUserNoCampaignAuthenticatedTestCase,
)
