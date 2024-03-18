""" Serializer util functions """
from rest_framework import serializers


class EnumField(serializers.ChoiceField):
    """ Serializer for enums """
    def __init__(self, enum, **kwargs):
        self.enum = enum
        self.choices = enum.choices
        kwargs["choices"] = [(e.name, e.name) for e in enum]
        super(EnumField, self).__init__(**kwargs)

    def to_representation(self, obj):
        return self.enum(obj).label

    def to_internal_value(self, data):
        index = self.enum.labels.index(data)
        value = self.enum.values[index]
        try:
            return self.enum(value)
        except KeyError:
            self.fail("invalid_choice", input=data)
