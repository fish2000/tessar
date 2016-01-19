
import mimetypes
import simplejson

# try:
#     from cStringIO import StringIO
# except IOError:
#     from StringIO import StringIO

from os.path import basename, extsep
from functools import wraps

from django.http import HttpResponse, HttpResponseNotFound
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
from django.views.decorators.cache import cache_page
from django.utils.safestring import mark_for_escaping

from tika.conf import settings
from tika.models import Document
from tika.problem import Problem
from tika import epub

class APIError(Problem):
    ''' A problem with an HTTP call to our JSON API
    '''
    pass

class DownloadError(Problem):
    ''' A problem with a file requested for download
    '''
    pass
    
# Cache TTL: (sec) * (min) * number of hours
cache_wrap = settings.DEPLOYED and cache_page(60 * 60 * 12) or never_cache

def apicall(f):
    ''' View decorator for API response view functions:
        
            @apicall
            def yodogg(request, you_like):
                """ Handle a 'Yo Dogg' API request """
                what_i_heard = 'I Heard You Like %s' % you_like
                what_we_put = 'We Put %s In Your %s' % (
                    i_heard_you_like, i_heard_you_like)
                
                # Return a dict, to be JSON-ulated in the response
                return dict(
                    yodogg=what_we_heard,
                    we_put_some=what_we_put)
    
        The @apicall decorator deals with API output boilerplate:
        Preparation of the HTTPResponse object parameters,
        JSON serialization, default values, error handling,
        and other stuff one would rather not waste their time
        repeating ad-nauseum in every Tessar view function.
        
        While functions decorated thusly receive dispatched
        arguments with the same arity as normal Django views --
        but instead of returning an HTTPResponse-like instance,
        they return a dict, which is summarily ensconced in a
        response envelope dict under the 'data' label, which is
        then JSON-ified and returned as the HTTP response body
        to the calling client.
    '''
    @csrf_exempt
    @wraps(f)
    def wrapper(*args, **kwargs):
        status = "ok"
        data = {}
        
        try:
            data = f(*args, **kwargs)
        
        except Problem, err:
            status = err.value
            data = {
                'msg': err.msg,
                'etc': err.etc,
            }
        
        except ObjectDoesNotExist, err:
            status = "fail"
            data = {
                'msg': err.message,
            }
        
        return HttpResponse(
            simplejson.dumps({
                'status': status,
                'data': data,
            }, separators=(',',':')),
            content_type="application/json")
    
    # further decorate function before returning
    return cache_wrap(wrapper)

def download(f):
    ''' View decorator for returning opaque document stream responses
        (e.g. files requested for download by the client):
        
            @download
            def download_pimp_my_ride_episode_avi(request, episode_id=""):
                dogg = PimpMyRideAVI.objects.for_slug(episode_id)
                if not dogg:
                    raise DownloadError('YO DOGG',
                        "Episode Not Found: '%s'" % episode_id)
                
                # Note: key names in dicts returned from @download functions
                # are specific (vs. @apicall funcs, whose returned dicts 
                # may name arbitrary keys as per the implementor's whim)
                return dict(
                    content=dogg.binary_data),
                    file="MTVPresents.PimpMyRide.s01e%s.HDTV.aXXo.avi" % episode_id,
                    type='text/plain', charset=settings.TIKA_CHARSET)
    
        Like @apicall, a function wrapped by @download accepts
        arguments with the same arity as normal Django views;
        instead of returning objects from the HTTPResponse family,
        the function passes back a parameter dict, which is
        massaged into the particular output format, behind
        the scenes.
        
        HOWEVER: unlike @apicall, a @download functions' output dict
        parameters are not arbitrarily crammed into the response,
        irrespective of their names. The @download post-processing logic
        looks specifically for keys in the return value:
        
            - 'content':    This must be a file-like object --
                            something implementing a read() method --
                            rewound and ready to go (or anything else that
                            Django's HTTPResponse API likes). This parameter
                            is the only one that must be specified; it has
                            no default value.
            
            - 'file':       The file name, as suggested to the HTTP client
                            in the 'Content-Disposition' response header.
                            If omitted, a name will be fudged on-the-fly,
                            using the output data's mimetype and the URL path
                            of the client HTTP request.
            
            - 'type':       The client will be told that this is the mimetype
                            of the file it is getting. Defaults to 'text/plain'
                            if omitted (since Tika and Tessar traffic in text,
                            for the most part).
            
            - 'charset':    The client will be told that this is the character
                            set of the data in the file it is getting... literally.
                            If this is specified, the charset string you pass will
                            be tacked on to the mimetype string -- nobody is going
                            to open up the whole UnicodeEncodeError can of worms to
                            try to transcode your data.* The default is UTF-8.
                            FUCK WITH THIS VALUE AT YOUR OWN RISK
                            
        ... Other keys will be silently ignored, and except for 'content', omissions
        will be defaulted accordingly as described above.
        
        * (dogg that is what function defs are about I am merely pointing out that
           this is your game son that's all I mean no disrespect)
    '''
    @csrf_exempt
    @wraps(f)
    def wrapper(request, *args, **kwargs):
        try:
            data = f(request, *args, **kwargs)
        except Problem, err:
            return HttpResponseNotFound(
                "%s: %s %s" % (
                    err.status.upper(), err.msg,
                    err.etc and "(%s)" % err.etc))
        except ObjectDoesNotExist, err:
            return HttpResponseNotFound(
                "NOT FOUND (ObjectDoesNotExist): %s" % err.message)
        
        content_type = data.get('type', 'text/plain')
        file_name = data.get('file',
            "%s%s" % (
                basename(request.path),
                mimetypes.guess_extension(content_type)))
        
        if 'charset' in data:
            content_type = '%s, charset=%s' % (
                content_type,
                data.get('charset',
                    settings.TIKA_CHARSET))
        
        content = data.get('content')
        content_data = hasattr(content, 'read') and content.read() or content
        response = HttpResponse(content_data, content_type=content_type)
        response['Content-Length'] = '%d' % len(content_data)
        response['Content-Disposition'] = 'attachment; filename=%s' % file_name
        return response
    
    # further decorate function before returning
    return cache_wrap(wrapper)

@apicall
def get_text(request, document_id=""):
    ''' Return a document via API as plain text
    '''
    doc = Document.objects.for_slug(document_id)
    if not doc:
        raise APIError('fail', "Document not found: %s" % document_id)
    return dict(
        text=mark_for_escaping(
            doc.extracted_text),
        docslug=unicode(doc.slug))

@apicall
def get_html(request, document_id=""):
    ''' Return a document via API as HTML,
        verbatim per Tika's HTML conversion output
    '''
    doc = Document.objects.for_slug(document_id)
    if not doc:
        raise APIError('fail', "Document not found: %s" % document_id)
    return dict(
        html=mark_for_escaping(
            doc.extracted_html).encode(
                'ascii', 'xmlcharrefreplace'))

@apicall
def get_cleansed_html(request, document_id=""):
    ''' Return a document via API as HTML,
        applying a post-process cleaning function
        to Tika's HTML output to remove anything
        unrelated to the basic formatting directives
    '''
    doc = Document.objects.for_slug(document_id)
    if not doc:
        raise APIError('fail', "Document not found: %s" % document_id)
    return dict(
        cleansed_html=mark_for_escaping(
            doc.cleansed_html).encode(
                'ascii', 'xmlcharrefreplace'))

@apicall
def get_metadata(request, document_id=""):
    ''' Return a document's metadata via API as key-value JSON
    '''
    doc = Document.objects.for_slug(document_id)
    if not doc:
        raise APIError('fail', "Document not found: %s" % document_id)
    return dict(metadata=doc.metadata)

@apicall
def get_cleansed_html_viewer(request, document_id=""):
    ''' Return a document via API as HTML,
        applying a post-process cleaning function
        to Tika's HTML output to remove anything
        unrelated to the basic formatting directives
    '''
    doc = Document.objects.for_slug(document_id)
    if not doc:
        raise APIError('fail', "Document not found: %s" % document_id)
    return dict(
        rendered=unicode(doc.cleansed_html),
        docslug=unicode(doc.slug))

@apicall
def get_rtf(request, document_id=""):
    ''' TODO!
        Return a document via API as rich text (RTF) data
    '''
    pass

@apicall
def get_epub(request, document_id=""):
    ''' TODO!
        Return a document via API as ebook (epub) data
    '''
    pass


@download
def download_orig(request, document_id=""):
    ''' Return a document for download via HTTP,
        in whatever form it was originally uploaded
    '''
    doc = Document.objects.for_slug(document_id)
    if not doc:
        raise DownloadError('ERROR', "Document Not Found: '%s'" % document_id)
    return dict(
        content=doc.original_file.file,
        file="%s-original%s%s" % (document_id, extsep, doc.ext),
        type=doc.mimetype)

@download
def download_text(request, document_id=""):
    ''' Return a document for download via HTTP,
        as a plain text file
    '''
    doc = Document.objects.for_slug(document_id)
    if not doc:
        raise DownloadError('ERROR', "Document Not Found: '%s'" % document_id)
    return dict(
        content=doc.extracted_text.encode(
            settings.TIKA_CHARSET),
        file="%s-extracted.txt" % document_id,
        type='text/plain',
        charset=settings.TIKA_CHARSET)

@download
def download_html(request, document_id=""):
    ''' Return a document for download via HTTP,
        as an HTML file (with entities properly encoded**),
        verbatim per Tika's HTML conversion output
        
        ** Python 3 doesn't let you use string encoding
           like this, right?
    '''
    doc = Document.objects.for_slug(document_id)
    if not doc:
        raise DownloadError('ERROR', "Document Not Found: '%s'" % document_id)
    return dict(
        content=doc.extracted_html.encode(
            'ascii', 'xmlcharrefreplace'),
        file="%s-extracted.txt" % document_id,
        type='text/html',
        charset=settings.TIKA_CHARSET)

@download
def download_cleansed_html(request, document_id=""):
    ''' Return a document for download via HTTP,
        as an HTML file (with entities properly encoded**),
        after applying a post-process cleaning function
        to Tika's HTML output to remove anything
        unrelated to the basic formatting directives
        
        ** QV. note `download_html.__doc__.split('\n')[5:]` sub.
           (tika/views.py lines 279-280)
    '''
    doc = Document.objects.for_slug(document_id)
    if not doc:
        raise DownloadError('ERROR', "Document Not Found: '%s'" % document_id)
    return dict(
        content=doc.cleansed_html.encode(
            'ascii', 'xmlcharrefreplace'),
        file="%s-cleansed.txt" % document_id,
        type='text/html',
        charset=settings.TIKA_CHARSET)

def download_rtf(request, document_id):
    ''' TODO!
        Return a document for download via HTTP,
        as a rich text (RTF) file
    '''
    pass


@download
def download_epub(request, document_id):
    ''' Return a document for download via HTTP,
        as an Ebook in the .epub format, derived
        from the cleansed HTML source. See also:
        
        ** http://www.manuel-strehl.de/dev/simple_epub_ebooks_with_python.en.html
    '''
    doc = Document.objects.for_slug(document_id)
    if not doc:
        raise DownloadError('ERROR', "Document Not Found: '%s'" % document_id)
    
    return dict(
        content=epub.from_document(doc),
        file="%s.epub" % document_id,
        type=settings.TIKA_MIME_OVERRIDES['epub'])
