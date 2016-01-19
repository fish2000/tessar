
from os.path import join, splitext
from collections import defaultdict

from django.contrib import admin
from django.utils.safestring import mark_safe
from django.core.urlresolvers import reverse

from tika.conf import settings
from tika.utils import display
from tika.epub import document_uuid as uu
from tika.models import Document


reverse_kw = lambda name, **kw: reverse(name, kwargs=kw)
reverse_id = lambda name, *ids, **kw: u"%s?id=%s" % (reverse(name, kwargs=kw), uu("".join(ids)))

static_js = lambda js_file: join('/', 'static', 'js', js_file)
static_css = lambda *css_file: join('/', 'static', 'css', *css_file)

language_mapper = defaultdict(lambda: "important")
language_mapper.update(dict(
    french='default',   # gray (the actual default)
    german='inverse',   # 90% K
    spanish='warning',  # goldenrod
    dutch='success',    # kelley green
    english='info',     # slate blue
))

cdn_js_urls = (
    "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js",
    "http://d3js.org/d3.v3.min.js")

static_js_files = (
    'prism-HTML+CSS.min.js',
    'handlebars-v1.3.0.js',
    'duckpunch.js',
    'hashes.js',
    'jquery.apropos.js',
    'loader.js',
    'tika-frontend.js')

basic_css = (
    "http://fonts.googleapis.com/css?family=" + \
        "Ubuntu+Mono:400,700,400italic,700italic" + \
        "|Oxygen+Mono" + \
        "|PT+Mono" + \
        "|Droid+Sans+Mono",
    static_css('prism-themes', settings.TIKA_HTML_THEME),
    static_css('tika-frontend.css'))

class Nimda(admin.ModelAdmin):
    save_as = True
    save_on_top = False
    actions_on_top = False
    actions_on_bottom = True
    class Media:
        js = cdn_js_urls + tuple(static_js(js_file) for js_file in static_js_files)
        css = { 'all': basic_css, }

class DocumentAdmin(Nimda):
    list_display = (
        'with_download_menu',
        'with_original_file',
        'with_document_type',
        'with_extracted_text', 'with_cleansed_html',
        'with_metadata')
    list_display_links = ('with_document_type', 'with_original_file')
    search_fields = ['pk', 'original_file', 'slug',
        'extracted_text', 'metadata']
    fields = ('original_file', 'with_extracted_text',
        'with_cleansed_html', 'with_metadata')
    readonly_fields = ('with_extracted_text',
        'with_cleansed_html', 'with_metadata')
    
    @display('')
    def with_download_menu(self, obj):
        ids = [str(obj.original_file.size)]
        return u"""
            <div class="btn-group">
                <button class="btn dropdown-toggle"
                    data-toggle="dropdown">
                        Download
                        <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                    <li>
                        <a href="%(cleansed_html_link)s">Cleansed, Extracted HTML</a>
                    </li>
                    <li>
                        <a href="%(html_link)s">Extracted HTML</a>
                    </li>
                    <li>
                        <a href="%(text_link)s">Extracted Text</a>
                    </li>
                    <li>
                        <a href="%(orig_link)s">Original Document</a>
                    </li>
                    <li>
                        <a href="%(epub_link)s">Epub Document</a>
                    </li>
                </ul>
            </div>
        """ % dict(
                cleansed_html_link=reverse_id(
                    'tika:download-cleansed-html', *ids,
                    document_id=obj.slug),
                
                html_link=reverse_id(
                    'tika:download-html', *ids,
                    document_id=obj.slug),
                
                text_link=reverse_id(
                    'tika:download-text', *ids,
                    document_id=obj.slug),
                
                orig_link=reverse_id(
                    'tika:download-orig', *ids,
                    document_id=obj.slug),
                    
                epub_link=reverse_id(
                    'tika:download-epub', *ids,
                    document_id=obj.slug))
    
    @display('Format')
    def with_document_type(self, obj):
        doc_type = splitext(obj.original_file.path)[-1]
        orelse = doc_type and 'default' or 'important'
        warn = doc_type and doc_type.endswith('docx') or False
        return mark_safe(u"""
            <span class="label label-%(status)s">%(doc_type)s</span>
        """ % dict(
                status=(warn and 'warning' or orelse),
                doc_type=doc_type and doc_type[1:] or '<UNKNOWN>'))
    
    @display('Language')
    def with_language(self, obj):
        langcode = obj.language
        langname = obj.get_language_override_display()
        return mark_safe(u"""
            <span class="badge badge-%(color)s">%(language_name)s</span>
            <!--<span class="label label-info">%(language_code)s</span>-->
        """ % dict(
                color=language_mapper[langname.lower()],
                language_code=langcode,
                language_name=langname))
    
    @display('Original Document')
    def with_original_file(self, obj):
        return mark_safe(u"""
            <span class="filename">%(filename)s</span>
        """ % dict(
                filename=obj.name))
    
    @display('')
    def with_extracted_text(self, obj):
        return u"""
        <a href="#modal-extracted-text-%(id)d"
            role="button"
            id="extracted-text-%(id)s-btn"
            class="extracted btn btn-small"
            data-toggle="modal">
                <nobr>Extracted Text</nobr>
        </a>
        
        <div id="modal-extracted-text-%(id)d"
            class="modal hide fade modal-extracted-text"
            tabindex="-1" role="dialog"
            aria-labelledby="modal-label-extracted-text-%(id)d"
            aria-hidden="true">
            <div class="modal-header">
                <h2 id="modal-label-extracted-text-%(id)d">
                    Extracted Text
                    <small>%(docname)s</small>
                </h2>
            </div>
            
            <div class="modal-body">
                <div class="placeholder extracted-text-placeholder"
                    id="extracted-text-placeholder-%(id)s"
                    data-endpoint="%(url)s"></div>
            </div>
            
            <div class="modal-footer">
                <h3>
                    <button type="button"
                        class="btn btn-inverse pull-right"
                        data-dismiss="modal"
                        aria-hidden="true">
                            <i class="icon-remove-sign icon-white"></i>
                            Close
                    </button>
                </h3>

          </div>
        </div>
        """ % dict(id=obj.pk,
                url=reverse_kw(
                    'tika:text',
                    document_id=obj.slug),
                docslug=obj.slug, docname=obj.name)
    
    @display('')
    def with_cleansed_html(self, obj):
        return u"""
            <a href="#cleansed-%(docslug)s-modal"
                role="button"
                id="cleansed-%(id)s-btn"
                class="cleansed btn btn-small"
                data-toggle="modal">
                    <nobr>
                        <small><i class="icon-chevron-left"></i>
                        <i class="icon-chevron-right"></i></small>
                        Cleansed HTML
                    </nobr>
            </a>
            
            <div id="cleansed-%(docslug)s-modal" class="modal hide fade modal-cleansed-html"
                tabindex="-1" role="dialog"
                aria-labelledby="cleansed-%(docslug)s-modal"
                aria-hidden="true">
                
                <div class="modal-header">
                    <h2 id="cleansed-%(docslug)s-title">
                        Cleansed HTML
                        <small>%(docname)s</small>
                    </h2>
                </div>
                
                <div class="modal-body">
                    <div class="placeholder cleansed-html-placeholder"
                        id="cleansed-html-placeholder-%(id)s"
                        data-endpoint="%(url)s"></div>
                </div>
                
                <div class="modal-footer">
                    <h3 id="cleansed-%(docslug)s-button">
                        <button type="button"
                            class="btn btn-danger pull-right"
                            data-dismiss="modal"
                            aria-hidden="true">
                                <i class="icon-remove-sign icon-white"></i>
                                Close
                        </button>
                    </h3>
                </div>
            </div>
        </div>
        """ % dict(id=obj.pk,
                docname=obj.name,
                docslug=obj.slug, url=reverse_kw(
                    'tika:cleansed-html-viewer',
                    document_id=obj.slug))
    
    @display('')
    def with_metadata(self, obj):
        from collections import OrderedDict
        if not getattr(obj, 'metadata', OrderedDict()):
            return ''
        
        return u"""
            <a href="#modal-metadata-%(id)d"
                role="button"
                class="btn btn-small"
                data-toggle="modal">
                    <nobr>Metadata</nobr>
                </a>
            
            <div id="modal-metadata-%(id)d"
                class="modal hide fade modal-metadata"
                tabindex="-1" role="dialog"
                aria-labelledby="modal-label-metadata-%(id)d"
                aria-hidden="true">
                <div class="modal-header">
                    <h2 id="modal-label-metadata-%(id)d">
                        Document Metadata
                        <small>%(docname)s</small>
                    </h2>
                </div>
            <div class="modal-body">
                <div class="placeholder table-placeholder"
                    id="table-placeholder-%(id)s"
                    data-endpoint="%(url)s"></div>
            </div>
              <div class="modal-footer">
                <h3>
                    <button type="button"
                        class="btn btn-danger pull-right"
                        data-dismiss="modal"
                        aria-hidden="true">
                            <i class="icon-remove-sign icon-white"></i>
                            Close
                    </button>
                </h3>
              </div>
            </div>
        """ % dict(
                id=obj.pk,
                docname=obj.name,
                url=reverse_kw(
                    'tika:metadata',
                    document_id=obj.slug))

admin.site.register(Document, DocumentAdmin)
