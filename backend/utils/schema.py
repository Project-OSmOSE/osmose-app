"""GraphQL Schema util"""
from graphene import ID
from graphene_django import DjangoObjectType


class ModelNode(DjangoObjectType):
    id = ID(required=True)

    class Meta:
        abstract = True
