""" Utils functions for admin part """


def get_many_to_many(obj, field_name, related_field_name="name"):
    """List all related field

    Args:
        obj (object): _description_
        field_name (string): _description_
        related_field_name (str, optional): _description_. Defaults to "name".

    Returns:
        string: _description_
    """
    field_name_attr = getattr(obj, field_name)
    many_to_many_attributs = ""
    for one_name_attr in field_name_attr.all().distinct():
        name_field = getattr(one_name_attr, related_field_name)
        many_to_many_attributs += f"{name_field}, "

    return many_to_many_attributs[:-2]
