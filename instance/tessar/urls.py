
from django.conf.urls.static import static
from django.core.urlresolvers import reverse_lazy
from django.conf.urls import patterns, include, url
from django.views.generic import RedirectView

from django.contrib import admin
admin.autodiscover()

from tika.urls import app_patterns as tika_urlpatterns
from ffffound.urls import app_patterns as ffffound_urlpatterns

urlpatterns = patterns('',
    
    url(r'^tika/',
        include(tika_urlpatterns,
            namespace='tika', app_name='tika')),
    
    url(r'^ffffound/',
        include(ffffound_urlpatterns,
            namespace='ffffound', app_name='ffffound')),
    
    url(r'^admin/',
        include(admin.site.urls)),
    
    url(r'^/?$',
        RedirectView.as_view(
            url=reverse_lazy(
                'admin:tika_document_changelist',
                current_app='tika'),
            permanent=False)),
)

from django.conf import settings
if not settings.DEPLOYED:
    
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT)
    
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT)
