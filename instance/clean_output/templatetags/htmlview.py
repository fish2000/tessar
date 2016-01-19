
from django import template

register = template.Library()
render = register.inclusion_tag

@render('clean-output/htmlview-bootstrap.html')
def bootstrap(document):
    return dict(
        raw=unicode(document.cleansed_html_source),
        rendered=unicode(document.cleansed_html),
        docslug=unicode(document.slug))
