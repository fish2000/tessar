
from django.conf.urls.defaults import patterns, url, include

app_patterns = patterns('',
    
    url(r'download/(?P<document_id>[\w\-\_]+)/text/?$',
        'tika.views.download_text',
        name='download-text'),
    
    url(r'download/(?P<document_id>[\w\-\_]+)/html/?$',
        'tika.views.download_html',
        name='download-html'),
    
    url(r'download/(?P<document_id>[\w\-\_]+)/cleansed-html/?$',
        'tika.views.download_cleansed_html',
        name='download-cleansed-html'),
    
    url(r'download/(?P<document_id>[\w\-\_]+)/epub/?$',
        'tika.views.download_epub',
        name='download-epub'),
    
    url(r'download/(?P<document_id>[\w\-\_]+)/?$',
        'tika.views.download_orig',
        name='download-orig'),
    
    url(r'(?P<document_id>[\w\-\_]+)/text/?$',
        'tika.views.get_text',
        name='text'),
    
    url(r'(?P<document_id>[\w\-\_]+)/html/?$',
        'tika.views.get_html',
        name='html'),
    
    url(r'(?P<document_id>[\w\-\_]+)/cleansed-html/?$',
        'tika.views.get_cleansed_html',
        name='cleansed-html'),
    
    url(r'(?P<document_id>[\w\-\_]+)/metadata/?$',
        'tika.views.get_metadata',
        name='metadata'),
    
    url(r'(?P<document_id>[\w\-\_]+)/cleansed-html-viewer/?$',
        'tika.views.get_cleansed_html_viewer',
        name='cleansed-html-viewer'),
)

urlpatterns = patterns('',

    url(r'', include(app_patterns,
        namespace='tika', app_name='tika')),

)

