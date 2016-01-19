
# SOLR
SOLR_ROOT = local/lib/solr/example
SOLR_LIB = $(SOLR_ROOT)/solr/lib
SOLR_STOPWORDS_LANG = $(SOLR_CONF)/lang/stopwords_en.txt
SOLR_STOPWORDS_COPY_TO = $(SOLR_STOPWORDS_LANG) $(SOLR_STOPWORDS_EN)

# LIRESOLR
LIRESOLR_REPO = git@bitbucket.org:dermotte/liresolr.git
LIRESOLR_ROOT = java/lire-solr
LIRESOLR_BUILDFILE = $(LIRESOLR_ROOT)/build.xml
GITMODULES = .gitmodules
JAROUT = java/lire-solr/dist/lire-request-handler.jar
JAR = $(SOLR_LIB)/lire-request-handler.jar
XML_ARTIFACTS = $(wildcard $(INSTANCE_CACHE)/*.xml)

# PYLIRE
PYLIRE_ROOT = $(INSTANCE)/pylire

# deployment
NGINX_CONF = /etc/nginx/sites-available/$(INSTANCE_SAFE_NAME)
NGINX_CONF_BACKUP = $(INSTANCE_TMP)/$(INSTANCE_NAME).nginx.conf.BACKUP
NGINX_DEPLOY = etc/$(INSTANCE_NAME).nginx.conf
SUPERVISOR_INIT = /etc/init.d/supervisord
SUPERVISOR_INIT_DEPLOY = etc/$(INSTANCE_NAME).supervisord-init.sh


deploy: deploy-git
deploy-all: deploy-git deploy-uwsgi deploy-nginx

# PYTHONPATH=$(LOCAL_PYTHON_SITE):$(INSTANCE_MODULE):$(INSTANCE):$(INSTANCE_PYTHON_SITE):$(VIRTUAL_ENV)
# $(INSTANCE_BIN)/supervisorctl -c $(INSTANCE_ADNAUSEUM)/supervisord-deploy.conf
deploy-git:
		git pull
		bin/python manage.py collectstatic --noinput
		test -r $(NGINX_CONF) && cp $(NGINX_CONF) $(INSTANCE_TMP)/$(INSTANCE_NAME).nginx.conf.BACKUP

deploy-uwsgi:
		# NEEDS SUDOING
		sudo $(SUPERVISORCTL) restart $(INSTANCE_NAME):uwsgi $(INSTANCE_NAME):memcached

deploy-nginx:
		# NEEDS SUDOING
		sudo cp $(NGINX_DEPLOY) $(NGINX_CONF) && sudo service nginx restart

deploy-supervisor-init:
		test -r $(SUPERVISOR_INIT) && cp $(SUPERVISOR_INIT) $(INSTANCE_TMP)/$(INSTANCE_NAME).supervisor-init.sh.BACKUP
		sudo cp $(SUPERVISOR_INIT_DEPLOY) $(SUPERVISOR_INIT)


		
all: update build

# SOLR_SCHEMA gets assigned when Praxa's
# `env_preinit` script runs
schema-generate: $(SOLR_STOPWORDS_COPY_TO) $(JAR)
		bin/python manage.py build_solr_schema -f $(SOLR_SCHEMA) --verbosity=2

schema-patch: $(SOLR_STOPWORDS_COPY_TO) $(JAR)
		patch -p1 schema.xml \
			-d $(shell dirname `readlink etc/solr-schema.xml`) \
				< etc/solr-lire-schema-fields.patch

schema: schema-generate schema-patch

# There are basically two of this next rule --
# I am not at all sure which `stopwords.txt` file
# has to be where, for Solr to not freak out
# and bail when you tell it to launch.
$(SOLR_STOPWORDS_LANG): $(SOLR_STOPWORDS)
		cp $(SOLR_STOPWORDS) $(SOLR_STOPWORDS_LANG)

$(SOLR_STOPWORDS_EN): $(SOLR_STOPWORDS)
		cp $(SOLR_STOPWORDS) $(SOLR_STOPWORDS_EN)

build: $(JAR)

$(JAR): $(JAROUT) $(SOLR_LIB)
		cp $(JAROUT) $(JAR)

$(JAROUT): $(SOLR_ROOT) $(LIRESOLR_ROOT) $(LIRESOLR_BUILDFILE)
		cd $(LIRESOLR_ROOT) && \
			ant clean && ant dist && \
			cd $(VIRTUAL_ENV)

$(SOLR_LIB): $(SOLR_ROOT)
		mkdir -p $(SOLR_LIB)

update: | $(GITMODULES)
		git submodule update --merge

$(GITMODULES):
		git submodule add $(LIRESOLR_REPO) $(LIRESOLR_ROOT)
		git submodule init

clean: clean-jars clean-pyc clean-cython clean-java-hash-dumps

distclean: clean-xml clean-jars clean-schema clean-all-pyc clean-all-cython clean-java-hash-dumps

clean-schema:
		echo "" > $(SOLR_SCHEMA)

clean-jars:
		$(if $(JAR), rm -f $(JAR))
		$(if $(JAROUT), rm -f $(JAROUT))

clean-xml: $(XML_ARTIFACTS)
		$(if $(XML_ARTIFACTS), rm -f $(XML_ARTIFACTS))

clean-pyc:
		find $(INSTANCE) -name \*.pyc -print -delete

clean-all-pyc:
		find $(VIRTUAL_ENV) -name \*.pyc -print -delete

clean-java-hash-dumps:
		rm $(VIRTUAL_ENV)/*.obj

clean-cython:
		find $(PYLIRE_ROOT) -name \*.so -print -delete

clean-all-cython:
		find $(PYLIRE_ROOT) -name \*.so -print -delete
		find $(PYLIRE_ROOT) -name \*.c -print -delete

cython:
		cd $(PYLIRE_ROOT) && \
			$(INSTANCE_BIN)/python setup.py build_ext --inplace

.PHONY: update build schema all distclean clean cython deploy deploy-all
