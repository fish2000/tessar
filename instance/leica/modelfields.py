
from __future__ import print_function

import requests
import humanize
from urlstring import URL

from django.utils import six
from django.core.files.base import ContentFile
from django.core.files.images import ImageFile
from django.utils.translation import ugettext_lazy as _
from django.db.models.fields.files import ImageField, ImageFileDescriptor, ImageFieldFile

from leica import signals
from leica.features import OpponentHistogram, OpponentHistogramBitHash, OpponentHistogramBase64
from leica.features import EdgeHistogram, EdgeHistogramBitHash, EdgeHistogramBase64

MAKE_NOISE = False


class Clusterfuck(Exception):
    pass

class RemoteContentFile(ContentFile, ImageFile):
    
    def __init__(self, url_string, **kwargs):
        url = URL(url_string)
        name = kwargs.pop('name', url.hashname)
        
        #print("[RemoteContentFile.__init__] Loading URL: %s" % url)
        response = requests.get(url)
        print("[RemoteContentFile.__init__] Response: %s (%d): %s" % (
            response.ok and "OK" or "!UGH",
            response.status_code,
            'content-length' in response.headers \
                and humanize.naturalsize(
                    response.headers.get('content-length')) \
                or 'NIL'))
        
        if not response.content:
            raise Clusterfuck("No content retrieved: %s" % url)
        
        if response.status_code != 200:
            raise Clusterfuck("Response code not OK: %s" % url)
        
        if response.headers.get('content-type', "").startswith('text'):
            raise Clusterfuck("Text data received (type %s) in reply to: %s" % (
                response.headers.get('content-type'), url))
        
        super(RemoteContentFile, self).__init__(response.content, name=name)
        self.url = url
        self.content_type = url.mime_type
        self.status = response.status_code
        self.response_headers = dict(response.headers)


class RemoteImageFileDescriptor(ImageFileDescriptor):
    value_class = ImageFieldFile
    
    def __set__(self, instance, value):
        if isinstance(value, six.string_types):
            if (value.lower().startswith('http://') or value.lower().startswith('https://')):
                try:
                    url = URL(value)
                    if self.field.storage.exists(url.hashname):
                        value = self.value_class(
                            instance, self.field, url.hashname)
                    else:
                        value = RemoteContentFile(
                            url, # it's a URL.
                            instance=instance,
                            field=self.field)
                except Clusterfuck, err:
                    raise IOError(str(err)) # it's a URL.
                except requests.ConnectionError, err:
                    raise IOError(str(err)) # it's an unreachable URL.
                super(RemoteImageFileDescriptor, self).__set__(instance, value)
                return
        super(RemoteImageFileDescriptor, self).__set__(instance, value)


class RemoteImageField(ImageField):
    descriptor_class = RemoteImageFileDescriptor
    description = _("""
        An image field, whose value can be set with the URL of an image to be downloaded
    """)
    
    def south_field_triple(self):
        from south.modelsinspector import introspector
        args, kwargs = introspector(self)
        return ('leica.modelfields.RemoteImageField', args, kwargs)


class NDImageFile(ImageFieldFile):
    
    opp_histo = OpponentHistogram()
    opp_histo_bithash = OpponentHistogramBitHash()
    opp_histo_base64 = OpponentHistogramBase64()
    
    edge_histo = EdgeHistogram()
    edge_histo_bithash = EdgeHistogramBitHash()
    edge_histo_base64 = EdgeHistogramBase64()
    
    def as_array(self):
        if self.path:
            try:
                MAKE_NOISE and print("Loading image with PIL.Image.open()")
                import numpy
                return numpy.array(self.as_pil())
            except IOError, err:
                MAKE_NOISE and print("ERROR: %s" % err)
                try:
                    MAKE_NOISE and print("Loading image with scipy.ndimage.imread()")
                    from scipy import ndimage
                    return ndimage.imread(self.path)
                except IOError, err:
                    MAKE_NOISE and print("ERROR: %s" % err)
                    MAKE_NOISE and print("Loading image with imread.imread()")
                    from imread import imread
                    return imread(str(self.path))    
        return None
    
    def as_pil(self):
        from PIL import Image
        pos = None
        try:
            return Image.open(self.path)
        except IOError, err:
            MAKE_NOISE and print("ERROR: %s" % err)
            MAKE_NOISE and print("Loading image with PIL.ImageFile.Parser().feed()")
            if hasattr(self, 'read'):
                from PIL import ImageFile as PILImageFile
                p = PILImageFile.Parser()
                pos = self.tell()
                self.seek(0)
                p.feed(self.read())
                if p.image:
                    return p.image
        finally:
            if pos is not None:
                self.seek(pos)
        return None

class NDImageFileDescriptor(RemoteImageFileDescriptor):
    value_class = NDImageFile

class NDImage(ImageField):
    attr_class = NDImageFile
    descriptor_class = NDImageFileDescriptor
    description = _(""" N-Dimensional NumPy-based image data array """)
    
    def pre_save(self, instance, add):
        """ After the normal pre-save operations, prepare Leica images:
            * Check the fields of the image file we are about to save.
              If the file hasn't been commited yet (not imagefile._committed),
              manually set the file name to the upload path, for some reason.
            * Dispatch a `leica_image_ready` signal, sent from the fields'
              model object class, containing this model instance.
        """
        # Call super (triggering normal pre-save ops)
        imagefile = super(NDImage, self).pre_save(instance, add)
        
        # check fields
        if imagefile and not imagefile._committed:
            if callable(self.upload_to):
                imagepath = self.upload_to(instance, "")
            else:
                imagepath = self.upload_to
            imagefile.name = imagepath
        
        # dispatch leica_image_ready signal
        signals.leica_image_ready.send(
            sender=self.__class__,
            instance=instance)
        
        return imagefile
    
    def south_field_triple(self):
        from south.modelsinspector import introspector
        args, kwargs = introspector(self)
        return ('leica.modelfields.NDImage', args, kwargs)
