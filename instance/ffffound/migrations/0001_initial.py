# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        pass
        # Adding model 'FFImage'
        # db.create_table(u'ffffound_ffimage', (
#             (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
#             ('image_hash_key', self.gf('django.db.models.fields.CharField')(db_index=True, max_length=40, unique=True, null=True, blank=True)),
#             ('collection_id', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
#             ('count', self.gf('django.db.models.fields.IntegerField')(default=1)),
#             ('title', self.gf('django.db.models.fields.CharField')(db_index=True, max_length=255, null=True, blank=True)),
#             ('posted_by', self.gf('django.db.models.fields.CharField')(db_index=True, max_length=255, null=True, blank=True)),
#             ('width', self.gf('django.db.models.fields.IntegerField')(default=0, null=True, blank=True)),
#             ('height', self.gf('django.db.models.fields.IntegerField')(default=0, null=True, blank=True)),
#             ('ff_image', self.gf('django.db.models.fields.URLField')(max_length=255, null=True, blank=True)),
#             ('ff_url', self.gf('django.db.models.fields.URLField')(max_length=255, null=True, blank=True)),
#             ('ff_thumb_xs', self.gf('django.db.models.fields.URLField')(max_length=255, null=True, blank=True)),
#             ('ff_thumb_s', self.gf('django.db.models.fields.URLField')(max_length=255, null=True, blank=True)),
#             ('ff_thumb_m', self.gf('django.db.models.fields.URLField')(max_length=255, null=True, blank=True)),
#             ('ffffound_image', self.gf('django.db.models.fields.files.ImageField')(max_length=100)),
#             ('image', self.gf('django.db.models.fields.files.ImageField')(max_length=100)),
#             ('thumb_xs', self.gf('django.db.models.fields.files.ImageField')(max_length=100)),
#             ('thumb_s', self.gf('django.db.models.fields.files.ImageField')(max_length=100)),
#             ('thumb_m', self.gf('django.db.models.fields.files.ImageField')(max_length=100)),
#             ('alt', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
#             ('created_on', self.gf('django.db.models.fields.DateTimeField')(default=None, null=True, blank=True)),
#             ('locally_saved_on', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime.now, null=True, blank=True)),
#             ('referer', self.gf('django.db.models.fields.URLField')(max_length=255, null=True, blank=True)),
#             ('raw_image_info', self.gf('tika.modelfields.JSONField')(null=True, blank=True)),
#         ))
#         db.send_create_signal(u'ffffound', ['FFImage'])


    def backwards(self, orm):
        # Deleting model 'FFImage'
        db.delete_table(u'ffffound_ffimage')


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
        }
    }

    complete_apps = ['ffffound']