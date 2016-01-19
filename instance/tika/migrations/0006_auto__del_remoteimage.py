# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting model 'RemoteImage'
        db.delete_table(u'tika_remoteimage')


    def backwards(self, orm):
        # Adding model 'RemoteImage'
        db.create_table(u'tika_remoteimage', (
            ('h', self.gf('django.db.models.fields.IntegerField')(null=True)),
            ('image', self.gf('ffffound.modelfields.RemoteImageField')(blank=True, max_length=255, null=True, db_index=True)),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('w', self.gf('django.db.models.fields.IntegerField')(null=True)),
        ))
        db.send_create_signal(u'tika', ['RemoteImage'])


    models = {
        u'tika.document': {
            'Meta': {'object_name': 'Document'},
            'createdate': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'auto_now_add': 'True', 'blank': 'True'}),
            'extracted_html': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'extracted_text': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('tika.modelfields.JSONField', [], {'null': 'True', 'blank': 'True'}),
            'modifydate': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'auto_now': 'True', 'blank': 'True'}),
            'original_file': ('tika.modelfields.TikaDocumentField', [], {'db_index': 'True', 'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'slug': ('autoslug.fields.AutoSlugField', [], {'unique_with': '()', 'max_length': '50', 'populate_from': 'None', 'blank': 'True'})
        }
    }

    complete_apps = ['tika']