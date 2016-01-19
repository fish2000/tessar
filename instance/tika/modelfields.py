
from django.db import models
from django.utils.translation import ugettext_lazy as _

from tika import signals

class TikaDocumentField(models.FileField):
    description = _("""
        A document, to be post-processed through Tika (via signal) after upload
    """)
    
    def pre_save(self, instance, add):
        """ After the normal pre-save operations, prepare Tika docs:
            * Check the fields of the document we are about to save.
              If the file hasn't been commited yet (not docfile._committed),
              manually set the file name to the upload path, for some reason.
            * Dispatch a `tika_document_ready` signal, sent from the fields'
              model object class, containing this model instance.
        """
        # Call super (triggering normal pre-save ops)
        docfile = super(TikaDocumentField, self).pre_save(instance, add)
        
        # check fields
        if docfile and not docfile._committed:
            if callable(self.upload_to):
                docpath = self.upload_to(instance, "")
            else:
                docpath = self.upload_to
            docfile.name = docpath
        
        # dispatch tika_document_ready signal
        signals.tika_document_ready.send(
            sender=instance.__class__,
            instance=instance)
        
        return docfile
    
    def south_field_triple(self):
        from south.modelsinspector import introspector
        args, kwargs = introspector(self)
        return ('tika.modelfields.TikaDocumentField', args, kwargs)
