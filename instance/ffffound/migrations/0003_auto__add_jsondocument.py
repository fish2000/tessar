# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'JSONDocument'
        db.create_table(u'ffffound_jsondocument', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('idx', self.gf('django.db.models.fields.CharField')(max_length=125, db_index=True)),
            ('doc', self.gf('tika.modelfields.JSONField')(default='{}', null=True, blank=True)),
        ))
        db.send_create_signal(u'ffffound', ['JSONDocument'])


    def backwards(self, orm):
        # Deleting model 'JSONDocument'
        db.delete_table(u'ffffound_jsondocument')


    models = {
        u'ffffound.ffimage': {
            'Meta': {'object_name': 'FFImage'},
            'alt': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'collection_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'count': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'created_on': ('django.db.models.fields.DateTimeField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            'ff_image': ('django.db.models.fields.URLField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'ff_thumb_m': ('django.db.models.fields.URLField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'ff_thumb_s': ('django.db.models.fields.URLField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'ff_thumb_xs': ('django.db.models.fields.URLField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'ff_url': ('django.db.models.fields.URLField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'ffffound_image': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'height': ('django.db.models.fields.IntegerField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'image_hash_key': ('django.db.models.fields.CharField', [], {'db_index': 'True', 'max_length': '40', 'unique': 'True', 'null': 'True', 'blank': 'True'}),
            'locally_saved_on': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'null': 'True', 'blank': 'True'}),
            'posted_by': ('django.db.models.fields.CharField', [], {'db_index': 'True', 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'raw_image_info': ('tika.modelfields.JSONField', [], {'null': 'True', 'blank': 'True'}),
            'referer': ('django.db.models.fields.URLField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'thumb_m': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'thumb_s': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'thumb_xs': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'title': ('django.db.models.fields.CharField', [], {'db_index': 'True', 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'width': ('django.db.models.fields.IntegerField', [], {'default': '0', 'null': 'True', 'blank': 'True'})
        },
        u'ffffound.jsondocument': {
            'Meta': {'object_name': 'JSONDocument'},
            'doc': ('tika.modelfields.JSONField', [], {'default': "'{}'", 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'idx': ('django.db.models.fields.CharField', [], {'max_length': '125', 'db_index': 'True'})
        },
        u'ffffound.remoteimage': {
            'Meta': {'object_name': 'RemoteImage'},
            'h': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('ffffound.modelfields.RemoteImageField', [], {'db_index': 'True', 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'w': ('django.db.models.fields.IntegerField', [], {'null': 'True'})
        }
    }

    complete_apps = ['ffffound']