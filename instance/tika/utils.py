#!/usr/bin/env python
# encoding: utf-8
from __future__ import print_function

import types
import simplejson

class display(object):
    """ A decorator to make short work of using custom display/format methods
        in Django ModelAdmin subclasses -- they'd have you do shit like this:
            
            class DoggAdmin(ModelAdmin):
                list_display = ['id', 'with_name']
                
                def with_name(self, obj):
                    return "Yo dogg: <b>{0}</b>".format(
                        obj.name.capitalize())
                with_name.short_description = "The guy's fucking name"
                with_name.allow_tags = True
                
        ... which, what the fuck? Nobody ever does that sort of thing ever.
        Instead of assigning post-hoc values to an unbound method definition,
        use @display() -- do it like this instead:
        
            class DoggAdmin(ModelAdmin):
                list_display = ['id', 'with_name']
                
                @display(desc="The guy's fucking name")
                def with_name(self, obj):
                    return "Yo dogg: <b>{0}</b>".format(
                        obj.name.capitalize())
        
        ... because doing it like that second example is clearly:
            a) shorter,
            b) less retarded-looking,
            c) generally more legible now,
            d) generally more legible in six months, which is probably
               the next time you'll edit a Django ModelAdmin def,
            e) decorator-based (which is like Python's syntactic equivalent
               of Tweeting your method definitions),
            f) default-able -- I nearly always do a ModelAdmin display
               method in order to spice up the admin list view HTML, so
               with the time I saved by not having to manually and awkwardly
               type out `display_thingy.allow_tags = True`, I have that much
               more time to enjoy my passtimes such as e.g. writing gratuitously
               circumlocutious docstrings (like for example this one)... and
            g) pythonic -- or at least more pythonic than the idiotic syntax
               the off-the-shelf mechanism foists on you.
    """
    
    # The params we set on the decorat-ee are based on these defaults:
    
    _kw = {
        'desc':                 ('short_description', ""),
        'tags':                 ('allow_tags', True),
        'boolean':              ('boolean', False),
        'admin_order_field':    None,
    }
    
    def __init__(self, *args, **kwargs):
        # an instance-local dict for the values in question:
        self._values = {}
        
        # This enumerate nonsense deals with positional args,
        # however unlikely their use-case may be here.
        # We fudge it by assuming their keyword based on our
        # _kw struct and then jam them into the kwargs dict
        # with the fudged keyword.
        for idx, value in enumerate(args):
            try:
                update_key = self._kw.keys()[idx-1]
            except (KeyError, ValueError, IndexError):
                continue
            else:
                if value is not None:
                    kwargs.update({ update_key: value, })
        
        # This next slightly less assumptive bit scans the kwargs
        # with which the decorator was invoked, according to the
        # _kw struct, and fills the _values dict with either the
        # _kw structs' default or (if present) the passed value.
        for call_key, default in self._kw.items():
            if type(default) == types.TupleType:
                real_key, default_value = (default[0], default[1])
            else:
                real_key, default_value = (call_key, default)
            self._values[real_key] = kwargs.get(
                call_key, default_value)
    
    def __call__(self, f):
        """ Set attributes on the decorated function, per kwargs """
        # This _values dict has been, at this point,  filled with either
        # kwargs from the @display() invocation, or (failing that) whatever
        # internal defaults we found in _kw during the __init__() stuff.
        for real_key, value in self._values.items():
            if value is not None:
                setattr(f, real_key, value)
        return f


def prettyprint(json):
    """ I like my women like I like my JSON:
        legibly indented and written to a standard output stream. """
    print(simplejson.dumps(json, indent=4))

# CSV padding
segments = lambda line: len(line.split(','))

max_segments = lambda csv_data: reduce(
    lambda line_segments, next_line: max(segments(next_line), line_segments),
    csv_data.splitlines(), 0)

pad_line = lambda line, padding: line + ',' + ','.join('''""''' for idx in xrange(padding))

pad_segments = lambda csv_data, padding: map(
    lambda line: segments(line) < padding and pad_line(line, padding - segments(line)) or line,
    csv_data.splitlines())

pad_csv = lambda csv_data: '\n'.join(pad_segments(csv_data, max_segments(csv_data)))
