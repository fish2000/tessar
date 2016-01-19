# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Document.slug'
        db.add_column(u'tika_document', 'slug',
                      self.gf('autoslug.fields.AutoSlugField')(default='', unique_with=(), max_length=50, populate_from=None, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Document.slug'
        db.delete_column(u'tika_document', 'slug')


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

    complete_apps = ['tika']