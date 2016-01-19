#!/usr/bin/env python
# encoding: utf-8

from os.path import splitext, extsep
from collections import OrderedDict
from urlstring import URL
from functools import wraps

try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO

import requests
import zipfile
import magic
import pandas

from tika.conf import settings
from tika.utils import pad_csv

class apimethod(object):
    """ Decorate a method call on a TikaBase handle subclass, specifying
        a REST api endpoint which will provide the data to be passed to
        your decorated method. An optional keyword arg `http_method`
        can be used to specify the request HTTP method type, which will
        default to `PUT` ... e.g.:
        
            class YoDogg(TikaBase):
                base_url = 'http://yodogg:8888/'
                
                @apimethod('/i-heard-you-like')
                def iheardyoulike(self, response):
                    # response is from the `requests` module
                    return out.json()['REST-requests']
    
                @apimethod('/rest-requests', http_method='POST')
                def soyoucan(self, response):
                    return out.json().get('rest-requests')
        
        ... the decorated method will retrieve data from that endpoint,
        making use of the class variables defined in `TikaBase` (below)
        to make the HTTP request. The resultant response-body wrapper
        class -- as returned by the function in the `requests` module
        that corresponds to the `http_method` -- will be passed to
        the decorated method, unmolested, as the second
        positional parameter.
    """
    def __init__(apimethod, endpoint, http_method="put", accept="*/*"):
        apimethod.endpoint = endpoint
        apimethod.http_method = http_method.lower()
        apimethod.accept = accept
    def __call__(apimethod, f):
        @wraps(f)
        def methodcall(self):
            request_method = requests.__dict__.get(
                apimethod.http_method)
            url = self.base_url.add_path(apimethod.endpoint)
            api_response = request_method(url,
                data=self.data,
                headers={
                    'accept': apimethod.accept,
                    'content-type':
                        self.mime_override or magic.from_buffer(
                            self.data, mime=True), })
            return f(self, api_response)
        methodcall.__name__ = apimethod.endpoint
        return methodcall

class APIBase(object):
    ''' A low-level base class for a RESTful API pre-request handle '''
    
    base_url = URL('http://localhost:8080/')
    
    @classmethod
    def ping(cls):
        return False
    
    def __init__(self, *args, **kwargs):
        self.base_url = kwargs.pop('base_url', self.base_url)


class TikaBase(APIBase):
    """ The base class for Tika document request handles """
    
    base_url = URL("%(protocol)s://%(address)s:%(port)s/" % dict(
        protocol=settings.TIKA_BASE_PROTOCOL,
        address=settings.TIKA_BASE_HOSTNAME,
        port=settings.TIKA_BASE_PORT))
    
    ping_path = '/tika'
    ping_token = 'tika server'
    mime_override = None
    
    @classmethod
    def ping(cls):
        """ Return True if the Tika server is up """
        try:
            return cls.ping_token in requests.get(
                cls.base_url.add_path(
                    cls.ping_path)).text.lower()
        except requests.ConnectionError:
            return False
    
    @classmethod
    def from_file(cls, path):
        """ Create a handle to a Tika server request,
            for a given file path
        """
        # overrides for MIME types (e.g. DOCX files)
        # see tika/conf.py for definitions
        suffix = splitext(path.lower())[-1].lstrip(extsep)
        mime_override = settings.TIKA_MIME_OVERRIDES.get(suffix, None)
        with open(path, 'r') as fh:
            return cls(fh.read(), path, mime_override)
    
    def __init__(self, data, path=None, mime_override=None):
        super(TikaBase, self).__init__(
            data,
            path=path,
            mime_override=mime_override)
        self.data = data
        self.path = path
        self.mime_override = mime_override


class SimpleTika(TikaBase):
    ''' Wrapper for the SimpleTika service '''
    
    base_url = TikaBase.base_url.with_port(
        settings.TIKA_SIMPLE_PORT).lower()
    ping_path = '/status'
    ping_token = 'groovy'
    
    @apimethod('/metadata')
    def metadata(self, response):
        ''' Get metadata for this document '''
        return response.json()['metadata']
    
    @apimethod('/fulldata')
    def fulldata(self, response):
        ''' Get metadata and extracted text '''
        return response.json()
    
    @apimethod('/text')
    def text(self, response):
        ''' Get extracted text '''
        return response.json()['text']
    
    def meta(self):
        return self.metadata()
    
    def all(self):
        return self.fulldata()


class Tika(TikaBase):
    ''' Wrapper for the version of Tika formerly included with Tessar,
        which included downstream modifications for an /html method '''
    
    @classmethod
    def metadata_dict(cls, md):
        ''' Convert CSV data to a Python dict '''
        import tablib
        dset = tablib.Dataset()
        tablib.formats.csv.import_set(dset, md)
        return OrderedDict(dset.sort(0)) # sort by 1st column
    
    @apimethod('/meta')
    def meta(self, response):
        ''' Get metadata for this document '''
        return self.__class__.metadata_dict(
            response.text.encode('UTF-8'))
    
    @apimethod('/tika')
    def tika(self, response):
        ''' Get output as plain (NAME CONFUSATRON) '''
        return response.content
    
    @apimethod('/tika')
    def text(self, response):
        ''' Get output as plain '''
        return response.content
    
    @apimethod('/html')
    def html(self, response):
        ''' Get output as HTML '''
        return response.content
    
    @apimethod('/unpacker')
    def unpacker(self, response):
        ''' Call the `unpacker` method and return content '''
        # I am not sure what this actually is supposed to do
        return response.content
    
    @apimethod('/all')
    def all(self, response):
        """ This Tika Server API method returns Zipfile data.
            Internally, we decompress the Zip file stream and build an output dict,
            populating our fields with relevant data from the Zip archives' "files".
        """
        output = {}
        with zipfile.ZipFile(StringIO(response.content), 'r') as zipper:
            with zipper.open('__TEXT__', 'r') as text:
                output['text'] = text.read()
            with zipper.open('__HTML__', 'r') as html:
                output['html'] = html.read()
            with zipper.open('__METADATA__', 'r') as metadata:
                output['metadata'] = self.__class__.metadata_dict(metadata.read())
        return output


class Tika15(Tika):
    ''' Wrapper for the Version 1.5 Release version of Tika --
        note the use of 'accept' HTTP request headers in selecting
        the type of output received from the server '''
    
    @apimethod('/tika', accept="text/html")
    def html(self, response):
        ''' Get output as HTML '''
        return response.content
    
    @apimethod('/tika', accept="text/xml")
    def xml(self, response):
        ''' Get output as XML/XHTML '''
        return response.content
    
    @apimethod('/tika', accept="text/plain")
    def tika(self, response):
        ''' Get output as plain (NAME CONFUSATRON) '''
        return response.content
    
    @apimethod('/tika', accept="text/plain")
    def text(self, response):
        ''' Get output as plain '''
        return response.content
    
    def unzip(self, response):
        """ The Tika Server API `/all` method returns Zipfile data.
            Internally, we decompress the Zip file stream and build an output dict,
            populating our fields with relevant data from the Zip archives' "files".
            
            Later versions remap this API endpoint; hence this standalone function.
        """
        output = {}
        with zipfile.ZipFile(StringIO(response.content), 'r') as zipper:
            with zipper.open('__TEXT__', 'r') as text:
                output['text'] = text.read()
            with zipper.open('__METADATA__', 'r') as metadata:
                output['metadata'] = self.__class__.metadata_dict(metadata.read())
        return output
    
    @apimethod('/all')
    def all(self, response):
        """ The Tika Server API `/all` method returns Zipfile data. """
        return self.unzip(response)


class TikaNext(Tika15):
    
    @classmethod
    def metadata_dict(cls, md):
        ''' Convert CSV data to a Python dict.
            
            Currently, we only takes the first two columns of CSV data into account in this method;
            Tika 1.6 and greater can return multiple columns of data per metadatum -- hence the padding,
            and the subsequent the transpose-slice-transpose dance we do, before sorting and returning. '''
        mdbuffer = StringIO(pad_csv(md))
        mdframe = pandas.read_csv(mdbuffer,
            engine='c',                                 # go faster
            index_col=False, header=None,               # don't infer column or row labels
            quotechar='"', skipinitialspace=True)       # deal with leading post-delimiter spaces,
                                                        #   e.g. "yo", "dogg"
        # This next line:
        #   1) transposes the dataset, indexing column-wise
        #   2) slices off everything after the first two columns,
        #   3) transposes the remaining dataset back, indexing row-wise,
        #   4) filters out rows containing NaNs,
        #   5) sorts the dataset using the first column,
        #   6) extracts a numpy array from the sorted dataset, and finally
        #   7) creates and returns an OrderedDict from that array.
        return OrderedDict(
            mdframe.T[:2].T.dropna(axis=0).sort(columns=0).values)
    
    @apimethod('/unpack')
    def unpacker(self, response):
        ''' Call the `unpack` method and return content '''
        return response.content
    
    @apimethod('/unpack/all')
    def all(self, response):
        """ The Tika Server API `/unpack/all` method returns Zipfile data. """
        return self.unzip(response)


if __name__ == '__main__':
    from os.path import join
    from tika.utils import prettyprint
    media_dir = join('/Users/fish/Praxa/TESSAR', 'var', 'web', 'face')
    media = lambda *p: join(media_dir, *p)
    
    #borges = SimpleTika.from_file(media('BORGES_00.doc'))
    #prettyprint(borges.fulldata())
    
    #borges = Tika.from_file(media('BORGES_00.doc'))
    #print(borges.html())
    
    print('Tika Status: %s' % (Tika.ping() and 'RUNNING' or 'UNREACHABLE'))
    #sys.exit(0)
    
    from clean_output.utils import cleanse
    mentir = TikaNext.from_file(media('MENTIR-final-april-21-type-edits.doc'))
    cleansed = cleanse(mentir.html())
    mentir_all = mentir.all()
    prettyprint(mentir_all.keys())
    prettyprint(mentir_all['metadata'])
    print('MENTIR xml length: %d' % len(mentir.xml()))
    print('MENTIR html length: %d' % len(mentir.html()))
    print('MENTIR text length: %d' % len(mentir_all['text']))
    #print(mentir_all['html'].decode('utf-8'))

