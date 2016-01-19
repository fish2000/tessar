import importlib

JSON_MODULE_NAMES = (
    # in order of preference
    'simplejson',
    'django.utils.simplejson',
    'json',
    'ujson',
    'yajl',
)

json_module = None

for json_module_name in JSON_MODULE_NAMES:
    try:
        json_module = importlib.import_module(
            json_module_name)
    except ImportError:
        continue
    else:
        break

if json_module is None:
    raise ImportError("""
        Couldn't import a useable json module!
        JSON_MODULE_NAMES = (
            %s
        )""" % ', '.join(JSON_MODULE_NAMES))

__all__ = [json_module]