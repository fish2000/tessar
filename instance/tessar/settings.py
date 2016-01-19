# Django settings for Tessar project.

import platform
BASE_HOSTNAME = platform.node().lower()
DEPLOYED = not BASE_HOSTNAME.endswith('.local')

DEBUG = not DEPLOYED
TEMPLATE_DEBUG = DEBUG
ADMINS = ()
MANAGERS = ADMINS

ALLOWED_HOSTS = ['*']

from os.path import join, isfile
PROJECT_ROOT = "/Users/fish/Praxa/TESSAR"
_root = lambda *d: join(PROJECT_ROOT, *d)

import hashlib
_hash = lambda token: hashlib.sha256(token).hexdigest()

default_database = {
    'NAME': 'tessar',
    'ENGINE': DEPLOYED and 'django_postgrespool' or 'django.db.backends.postgresql_psycopg2',
    #'ENGINE': DEPLOYED and 'django_postgrespool' or 'django_postgrespool',
    'USER': 'tessar',
    'PASSWORD': 'eatshit',
    'OPTIONS': dict(autocommit=True),
}

if DEPLOYED:
    default_database.update({
        'HOST': 'localhost',
        'PORT': 5432 })

DATABASES = { 'default': default_database }
SOUTH_DATABASE_ADAPTERS = { 'default': 'south.db.postgresql_psycopg2' }

DATABASE_POOL_ARGS = {
    'max_overflow': 10,
    'pool_size': 20,
    'recycle': 300
}

memcache = {
    'BACKEND': 'django.core.cache.backends.memcached.PyLibMCCache',
    'LOCATION': '/Users/fish/Praxa/TESSAR/var/run/memcached.sock',
    'KEY_PREFIX': 'mc' }

localmemory = {
    'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    'LOCATION': 'tessmem' }

CACHES = { 'default': memcache }

CACHE_MIDDLEWARE_SECONDS = 600
CACHE_MIDDLEWARE_KEY_PREFIX = "mw"
SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"

TIME_ZONE = 'America/New_York'
LANGUAGE_CODE = 'en-us'
SITE_ID = 1
USE_I18N = True # Flip to True outside America
USE_L10N = True # Flip to True outside America 
USE_TZ = True

MEDIA_ROOT = _root('var', 'web', 'face')
MEDIA_URL = '/media/'

STATIC_ROOT = _root('var', 'web', 'static')
STATIC_URL = '/static/'
STATICFILES_DIRS = (
    _root('instance', 'assets', 'static'),
)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    #'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

_secret = 'r_3t&amp;2vdtvm61w+flvv&amp;ae4tvfqwu%f%_9ky@*g3w%8wrxxb#a'
if isfile(_root('.password')):
    with open(_root('.password'), 'rb') as passfile:
        _secret = _hash(passfile.read())

SECRET_KEY = _secret

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = DEPLOYED and (
    # Caching is enabled.
    # N.B. The order of these matters, evidently
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
) or (
    # Caching is enabled.
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
)

ROOT_URLCONF = 'tessar.urls'
WSGI_APPLICATION = 'tessar.wsgi.application'

TEMPLATE_DIRS = (
    _root('instance', 'assets', 'templates'),
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_postgrespool',
    
    'django_admin_bootstrapped',
    'django.contrib.admin',
    
    #'south',
    'autoslug',
    'haystack',
    'tagging',
    
    'clean_output',
    'ffffound',
    'tika',
)

HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.solr_backend.SolrEngine',
        'URL': 'http://127.0.0.1:8983/solr',
    },
}


# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}
