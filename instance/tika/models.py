
import magic
import random
from collections import OrderedDict
from os.path import basename, splitext, extsep
from delegate import DelegateManager, delegate
from datetime import datetime
from django.db import models
from django.dispatch import receiver
from django.template.defaultfilters import slugify
from django.core.files.storage import FileSystemStorage

from django.conf.global_settings import LANGUAGES
from guess_language import guessLanguage as guesslang

import autoslug
import jsonfield
from clean_output.utils import entity_wax, codepoint_shine, break_into_sections

from tika.conf import settings
from tika.api import TikaNext as Tika
from tika import modelfields, signals

mediafs = FileSystemStorage(
    location=settings.MEDIA_ROOT,
    base_url=settings.MEDIA_URL)

METADATA_KEY_PREFIXES = (
    '', 'meta:', 'dc:', 'extended-properties:')

class DocumentQuerySet(models.query.QuerySet):
    
    def __init__(self, *args, **kwargs):
        super(DocumentQuerySet, self).__init__(*args, **kwargs)
        random.seed()
    
    @delegate
    def rnd(self):
        """ Get a random model instance (useful in tests). """
        return random.choice(self.all())
    
    @delegate
    def for_slug(self, slug):
        ''' Filter by slug string -- this is a hangover from
            my initial model defs, which did the slugification
            with @property methods (vs. a proper slug field).
        '''
        try:
            # newer, better queryset method
            return self.get(slug__iexact=slug)
        except Document.DoesNotExist:
            pass
        
        try:
            # old and coarse method
            return [d for d in self.all() \
                if d._slug == slug][0]
        except IndexError:
            pass
        
        return None


class DocumentManager(DelegateManager):
    __queryset__ = DocumentQuerySet

class Document(models.Model):
    
    objects = DocumentManager()
    
    class Meta:
        verbose_name = 'Publication Document'
        verbose_name_plural = 'Publication Documents'
        abstract = False
    
    createdate = models.DateTimeField('Created on',
        default=datetime.now,
        auto_now_add=True,
        blank=True,
        editable=False)
    
    modifydate = models.DateTimeField('Last modified on',
        default=datetime.now,
        auto_now=True,
        blank=True,
        editable=False)
    
    slug = autoslug.AutoSlugField(
        populate_from=lambda instance: instance.name,
        slugify=slugify,
        db_index=True,
        blank=True,
        editable=True)
    
    original_file = modelfields.TikaDocumentField(
        verbose_name='Original Document File',
        upload_to='./',
        storage=mediafs,
        db_index=True,
        null=True,
        blank=True)
    
    extracted_text = models.TextField(
        verbose_name='Extracted Text',
        db_index=False,
        null=True,
        blank=True)
    
    extracted_html = models.TextField(
        verbose_name='Extracted HTML',
        db_index=False,
        null=True,
        blank=True)
    
    language_override = models.CharField(
        verbose_name="Language Override",
        max_length=7,
        db_index=False,
        null=True,
        blank=True,
        choices=LANGUAGES)
    
    metadata = jsonfield.JSONField(
        verbose_name='Metadata',
        db_index=False,
        null=True,
        blank=True,
        load_kwargs=dict(
            object_pairs_hook=OrderedDict))
    
    @property
    def cleansed_html(self):
        return codepoint_shine(self.extracted_html)
    
    @property
    def cleansed_html_source(self):
        ''' cleansed_html value encoded with "xmlcharrefreplace" '''
        return entity_wax(self.extracted_html)
    
    @property
    def sections(self):
        ''' Extracted HTML, cleansed and split on <hr> tags '''
        return break_into_sections(self.extracted_html)
    
    @property
    def name(self):
        ''' The name of the originally uploaded file ''' 
        return self.original_file \
            and basename(self.original_file.name) \
            or None
    
    @property
    def path(self):
        ''' The name of the originally uploaded file ''' 
        return self.original_file \
            and self.original_file.path \
            or None
    
    @property
    def mimetype(self):
        if not self.ext:
            return None
        mime_override = settings.TIKA_MIME_OVERRIDES.get(self.ext, None)
        return mime_override or magic.from_file(
            self.original_file.path,
            mime=True)
    
    @property
    def ext(self):
        ''' The file extension, from the original upload filename ''' 
        return self.name and splitext(self.name)[-1].lstrip(extsep) or ''
    
    @property
    def _slug(self):
        ''' The Document._slug property has been depreciated,
            in favor of the document.slug database field '''
        warnings.warn(Document._slug.__doc__, FutureWarning)
        return self.name and slugify(self.name) or ''
    
    @property
    def language(self):
        if not self.language_override:
            return guesslang(self.extracted_text)
        return self.language_override
    
    @property
    def tika_handle(self):
        return (Tika.ping() and self.path) \
            and Tika.from_file(self.path) \
            or None
    
    def metadatum(self, key, default=None):
        if not key:
            raise KeyError("Empty metadata key")
        keys = (prefix+str(key) for prefix in METADATA_KEY_PREFIXES)
        for prefixed_key in keys:
            try:
                return self.metadata.get(prefixed_key, default)
            except KeyError:
                continue
        raise KeyError("%s (Tried %s)" % (key, ", ".join(keys)))
    
    def __repr__(self):
        if not self.pk:
            return "<Document[%s] SANS ID+NAME>" % hash(self)
        if not self.name:
            return "<Document(%d) SANS NAME>" % self.pk
        return "<Document(%d): %s>" % (
            self.pk,
            self.original_file.name)
    
    def __str__(self):
        return repr(self)
    
    def __unicode__(self):
        return unicode(repr(self))

import warnings
warnings.simplefilter("ignore")
from bs4 import UnicodeDammit

@receiver(signals.tika_document_ready,
    sender=Document,
    dispatch_uid=settings.TIKA_DOCUMENT_READY_DISPATCH_UID)
def extract_from_file(sender, instance, **kwargs):
    if Tika.ping():
        tika_handle = Tika.from_file(instance.original_file.path)
        doc_text = UnicodeDammit(tika_handle.text()).unicode_markup
        instance.extracted_text = doc_text
        instance.extracted_html = tika_handle.html()
        instance.metadata = tika_handle.meta()
