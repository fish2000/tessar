# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Document'
        '''
        db.create_table(u'tika_document', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('original_file', self.gf('tika.modelfields.TikaDocumentField')(db_index=True, max_length=100, null=True, blank=True)),
            ('extracted_text', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('extracted_html', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('metadata', self.gf('tika.modelfields.JSONField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'tika', ['Document'])
        '''
        pass


    def backwards(self, orm):
        # Deleting model 'Document'
        db.delete_table(u'tika_document')


    models = {
        u'tika.document': {
            'Meta': {'object_name': 'Document'},
            'extracted_html': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'extracted_text': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('tika.modelfields.JSONField', [], {'null': 'True', 'blank': 'True'}),
            'original_file': ('tika.modelfields.TikaDocumentField', [], {'db_index': 'True', 'max_length': '100', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['tika']