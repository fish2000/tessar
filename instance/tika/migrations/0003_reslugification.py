# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import DataMigration
from django.db import models

class Migration(DataMigration):

    def forwards(self, orm):
        "Write your forwards methods here."
        # Note: Don't use "from appname.models import ModelName". 
        # Use orm.ModelName to refer to models in this application,
        # and orm['appname.ModelName'] for models in other applications.
        from os.path import basename
        from django.template.defaultfilters import slugify
        for document in orm.Document.objects.all():
            name = document.original_file and basename(document.original_file.name) or ''
            document.slug = slugify(name)
            document.save()

    def backwards(self, orm):
        "Write your backwards methods here."
        for document in orm.Document.objects.all():
            document.slug = ""
            document.save()

    models = {
        u'tika.document': {
            'Meta': {'object_name': 'Document'},
            'extracted_html': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'extracted_text': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('tika.modelfields.JSONField', [], {'null': 'True', 'blank': 'True'}),
            'original_file': ('tika.modelfields.TikaDocumentField', [], {'db_index': 'True', 'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'slug': ('autoslug.fields.AutoSlugField', [], {'unique_with': '()', 'max_length': '50', 'populate_from': 'None', 'blank': 'True'})
        }
    }

    complete_apps = ['tika', 'tika']
    symmetrical = True
