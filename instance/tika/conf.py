
from django.conf import settings
from appconf import AppConf

from os import listdir
from os.path import join

HTML_THEMES = filter(lambda f: f.endswith('css'), listdir(join(
    settings.PROJECT_ROOT,
        'var', 'web', 'static', 'css', 'prism-themes')))


class TikaAppConf(AppConf):
    
    # What the Tika app specifies as the character set
    # whenever we need to -- usually, this is necessary
    # for HTTP responses, either incoming or outgoing
    CHARSET = 'UTF-8'
    
    # Defaults for connecting to the local Tika service
    # ... BASE_HOSTNAME is inferred at runtime below
    BASE_HOSTNAME = 'localhost'
    BASE_PROTOCOL = 'http'
    BASE_PORT = 9998
    SIMPLE_PORT = 8080
    
    # MIME override map -- for supplementing python-magic,
    # and for custom internal use (e.g. epub generation)
    MIME_OVERRIDES = {
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'epub': 'application/epub+zip',
        'opf': 'application/oebps-package+xml',
        'ncx': 'application/x-dtbncx+xml',
    }
    
    # Default theme for HTML syntax highligter
    HTML_THEME = 'coy.css'
    
    # Namespace UUID for Epub creation
    NAMESPACE_UUID = '18e3e2ca-04bd-46c4-845d-cc3a3f5ac364'
    DEFAULT_BOOK_ID = 'BookId'
    
    # Default document language code
    DEFAULT_LANGUAGE = 'fr'
    
    # Dispatch UID for document-ready signal
    # (as sent by TikaDocumentFields)
    DOCUMENT_READY_DISPATCH_UID = 'tika-document-ready'
    
    class Meta:
        prefix = 'tika'
    
    def configure_base_hostname(self, value):
        """ Infer the local hostname """
        if value is not None:
            return value
        import platform
        local_hostname = platform.node().lower()
        return local_hostname.endswith('local') and 'localhost' \
            or local_hostname
    
    def configure_html_theme(self, value):
        """ Pick an HTML theme from those installed """
        import random
        return value in HTML_THEMES and value \
            or random.choice(HTML_THEMES)
    
    def configure_namespace_uuid(self, value):
        import uuid
        return uuid.UUID(value)


