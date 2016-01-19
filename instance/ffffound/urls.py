
from django.conf.urls.defaults import patterns, url, include

app_patterns = patterns('',
    
    url(r'url/(?P<url>.+)/?$',
        'ffffound.views.html_url',
        name='html_url'),
)

urlpatterns = patterns('',

    url(r'', include(app_patterns,
        namespace='ffffound', app_name='ffffound')),

)

