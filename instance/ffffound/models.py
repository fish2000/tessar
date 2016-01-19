
import sys
import os
import httplib
import urllib2
import urlparse
import requests
import requests.exceptions
import jsonfield

from django.conf import settings
from django.db import models
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage

from PIL import Image
from datetime import datetime
from modeldict import ModelDict
from leica import modelfields as leicafields

fs = FileSystemStorage(
    location=os.path.join(settings.MEDIA_ROOT, 'ffimage'))

def echo(self, *args, **kwargs):
    """ Print in color to stdout. """
    text = " ".join([str(item) for item in args])
    color = kwargs.get("color", 32)
    sys.stdout.write("\033[0;%dm%s\033[0;m" % (color, text))

def FFContentFileForURL(url):
    
    #print "--- Saving image from %s" % url
    uastring = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/534.51.22 (KHTML, like Gecko) Version/5.1.1 Safari/534.51.22"
    #handle = None
    
    with requests.session(headers={ 'User-Agent': uastring, 'Referer': "http://%s/" % urlparse.urlparse(url).netloc, }) as client:
        try:
            r = client.get(url)
        except requests.exceptions.TooManyRedirects, err:
            print "*** REDIRECTION PROBLEM -- TooManyRedirects: %s" % err
            print ""
            return None
        except httplib.BadStatusLine, err:
            print "*** HTTP PROBLEM -- BadStatusLine: %s" % err
            print ""
            return None
    
    if not r.status_code == 200:
        try:
            r.raise_for_status()
        except urllib2.HTTPError, err:
            print "*** HTTP PROBLEM: %s" % err
            print ""
            #data = None
        except urllib2.URLError, err:
            print "*** URL PROBLEM: %s" % err
            print ""
            #data = None
        except httplib.BadStatusLine, err:
            print "*** HTTP PROBLEM -- BadStatusLine: %s" % err
            print ""
        except Exception, err:
            print "*** MISC. PROBLEM: %s" % err
            print ""
        return None
    
    if r.content is not None:
        if len(r.content) > 512:
            try:
                Image.open(ContentFile(r.content)).verify()
            except IOError, err:
                print "*** I/O PROBLEM: %s" % err
                print ""
                return None
            else:
                print ">>> saved %s" % url
                return ContentFile(r.content)
        
        print "*** D/L PROBLEM: didn't get enough image data."
        print ""
        return None
    
    return None

def FFNameForURL(url):
    return os.path.basename(urlparse.urlparse(url).path)

class FFImage(models.Model):
    
    class Meta:
        abstract = False
        verbose_name = "FFFFound Image"
        verbose_name = "FFFFound Image Assets"
    
    image_hash_key = models.CharField(verbose_name="FFFFound Image Hash Key",
        max_length=40,
        db_index=True,
        unique=True,
        blank=True,
        null=True)
    
    collection_id = models.CharField(verbose_name="FFFound Collection ID (?)",
        max_length=255,
        unique=False,
        blank=True,
        null=True)
    
    count = models.IntegerField(verbose_name="FFFFound find count",
        default=1,
        unique=False,
        blank=False,
        null=False)
    
    title = models.CharField(verbose_name="FFFFound Title",
        max_length=255,
        db_index=True,
        unique=False,
        blank=True,
        null=True)
    
    posted_by = models.CharField(verbose_name="FFFFound 'Hostname' of Orig. Poster",
        max_length=255,
        db_index=True,
        unique=False,
        blank=True,
        null=True)
    
    width = models.IntegerField(verbose_name="Width",
        default=0,
        blank=True,
        null=True)
    
    height = models.IntegerField(verbose_name="Height",
        default=0,
        blank=True,
        null=True)
    
    ff_image = models.URLField(verbose_name="FFFFound Asset URL",
        max_length=255,
        blank=True,
        null=True)
    
    ff_url = models.URLField(verbose_name="Image URL",
        max_length=255,
        blank=True,
        null=True)
    
    ff_thumb_xs = models.URLField(verbose_name="Thumbnail Image URL (xtra-small)",
        max_length=255,
        blank=True,
        null=True)
    
    ff_thumb_s = models.URLField(verbose_name="Thumbnail Image URL (small)",
        max_length=255,
        blank=True,
        null=True)
    
    ff_thumb_m = models.URLField(verbose_name="Thumbnail Image URL (medium)",
        max_length=255,
        blank=True,
        null=True)
    
    ffffound_image = models.ImageField(storage=fs, upload_to='assets')
    image = models.ImageField(storage=fs, upload_to='originals')
    thumb_xs = models.ImageField(storage=fs, upload_to='assets')
    thumb_s = models.ImageField(storage=fs, upload_to='assets')
    thumb_m = models.ImageField(storage=fs, upload_to='assets')
    
    alt = models.TextField(verbose_name="FFFFound Post Alt Text",
        blank=True,
        null=True)
    
    created_on = models.DateTimeField(verbose_name="FFFFound Create Date",
        default=None,
        blank=True,
        null=True)
    
    locally_saved_on = models.DateTimeField(verbose_name="Local Save Create Date",
        default=datetime.now,
        blank=True,
        null=True)
    
    referer = models.URLField(verbose_name="FFFFound Post Referer",
        max_length=255,
        blank=True,
        null=True)
    
    raw_image_info = jsonfield.JSONField(verbose_name="Raw FFFFound Image Info Dict",
        unique=False,
        blank=True,
        null=True)
    
    def __repr__(self):
        if self.image_hash_key:
            return "<FFImage %s>" % self.image_hash_key
        else:
            return "<FFImage (???)>"
    
    def __str__(self):
        return repr(self)
    
    def __unicode__(self):
        return unicode(str(self))


class RemoteImage(models.Model):
    
    class Meta:
        verbose_name = "Remote Image"
        verbose_name_plural = "Remote Images"
        abstract = False
    
    asset_id = models.CharField(verbose_name="FFFFound Image Asset ID",
        max_length=40,
        db_index=True,
        unique=True,
        blank=True,
        null=True)
    
    image = leicafields.NDImage(verbose_name="Remote Image Field",
        null=True,
        blank=True,
        db_index=True,
        upload_to='uploads',
        height_field='h',
        width_field='w',
        max_length=255)
    
    w = models.IntegerField(verbose_name="width",
        editable=False,
        null=True)
    
    h = models.IntegerField(verbose_name="height",
        editable=False,
        null=True)
    
    def __repr__(self):
        return "RemoteImage(%s) <asset_id:%s>" % (
            self.id or "???",
            self.asset_id or "??!?")
    
    def __str__(self):
        return repr(self)
    
    def __unicode__(self):
        return unicode(str(self))

class JSONDocument(models.Model):
    
    class Meta:
        verbose_name = "JSON Document"
        verbose_name_plural = "JSON Document Entries"
        abstract = False
    
    idx = models.CharField(verbose_name="Document Index",
        max_length=125,
        db_index=True,
        blank=False,
        null=False)
    
    doc = jsonfield.JSONField(verbose_name="Document",
        default="{}",
        blank=True,
        null=True)
    
    def __repr__(self):
        return "<JSONDocument(%s:%s)>" % (self.id, self.idx)
    
    def __str__(self):
        return repr(self)
    
    def __unicode__(self):
        return unicode(str(self))


docstash = ModelDict(JSONDocument,
    key='idx',
    value='doc',
    instances=False)
