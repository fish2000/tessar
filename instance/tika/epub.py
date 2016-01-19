
import uuid
import zipfile

try:
    from cStringIO import StringIO
except IOError:
    from StringIO import StringIO

from django.template.defaultfilters import slugify

from tika.conf import settings
from tika.problem import Problem


class EPubError(Problem):
    ''' A freakout that transpired as an epub document was birth'd
    '''
    pass

def document_uuid(id_string):
    return uuid.uuid5(settings.TIKA_NAMESPACE_UUID, str(id_string))

def publication_uuid(name):
    return document_uuid(name).get_urn()

def publication_id(name):
    return slugify(name or settings.TIKA_DEFAULT_BOOK_ID)

def container():
    return u'''
<container version="1.0"
    xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf"
                  media-type="%s"/>
    </rootfiles>
</container>''' % settings.TIKA_MIME_OVERRIDES['opf']

def index(name, manifest, spine, language=settings.TIKA_DEFAULT_LANGUAGE):
    # 'manifest' and 'spine' can contain many concatenated instances
    # of their respective 'elem' templates, as needed
    return u'''<package xmlns="http://www.idpf.org/2007/opf"
    unique-idenifier="%(id)s" version="2.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:opf="http://www.idpf.org/2007/opf">
        <dc:title>%(name)s</dc:title>
        <dc:language>%(language)s</dc:language>
        <dc:creator opf:file-as="Global Literary Management"
            opf:role="pub">Global Literary Management</dc:creator>
        <dc:identifier id="%(id)s" opf:scheme="UUID">%(uuid)s</dc:identifier>
    </metadata>
    <manifest>
        %(manifest)s
    </manifest>
    <spine toc="ncx">
        %(spine)s
    </spine>
</package>''' % dict(
    name=name,
    uuid=publication_uuid(name),
    id=publication_id(name),
    manifest=manifest,
    spine=spine,
    language=language)

def manifest(sections):
    manifest_xml = u"""
        <item href="toc.ncx" id="ncx" media-type="%s" />
        <item href="styles.css" id="styles.css" media-type="text/css" />
    """ % settings.TIKA_MIME_OVERRIDES['ncx']
    
    for idx, manifest_item in enumerate(sections):
        manifest_xml += """
            <item id="file_%s" href="Section-%s.xhtml" media-type="application/xhtml+xml" />
        """ % (idx, idx)
    return manifest_xml

def spine(sections):
    spine_xml = ""
    for idx, vertebrae in enumerate(sections):
        spine_xml += """
            <itemref idref="file_%s" />
        """ % (idx)
    return spine_xml

def section_xhtml(content, title):
    return u"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
    "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>%(title)s</title>
<link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>

    %(content)s

</body>
</html>
    """ % dict(title=title, content=content)

def css():
    return u"""
body {}
p {}
h1 {
    width: 100%;
    text-align: center;
    font-family: "News Gothic MT", "News Gothic",
                 "Trade Gothic MT", "Trade Gothic",
                 NewsGothicMT, NewsGothic, TradeGothicMT, TradeGothic,
                 "Helvetica Neue Condensed", "Helvetica Condensed",
                 "Arial Narrow", Helvetica, Arial, sans-serif;
    font-weight: bold;
    font-size: 2.0em;
    padding-bottom: 0.5em; }
h1:after {
    display: block;
    position: relative;
    width: 100%;
    text-align: center;
    content: '\u2619';
    padding-bottom: 0.5em; }
"""

def toc_ncx(doc, name=None):
    pagecount = doc.metadatum('page-count', 0)
    navmap = u""
    for idx, section in enumerate(doc.sections):
        label = "Section-%s.xhtml" % idx
        navmap += u"""
<navPoint id="navPoint-%(idx)s" playOrder="%(idx)s">
  <navLabel>
    <text>%(label)s</text>
  </navLabel>
  <content src="%(name)s"/>
</navPoint>""" % dict(
            idx=idx,
            name=label,
            label=label)
    
    return u"""<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN"
 "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head>
   <meta name="dtb:uid" content="%(uuid)s" />
   <meta name="dtb:depth" content="%(depth)s" />
   <meta name="dtb:totalPageCount" content="%(totalpagecount)s" />
   <meta name="dtb:maxPageNumber" content="%(maxpagenumber)s" />
</head>
<docTitle>
   <text>%(name)s</text>
</docTitle>
<navMap>
%(navmap)s
</navMap>
</ncx>""" % dict(
        name=name or "Unknown",
        uuid=publication_uuid(name),
        depth=pagecount,
        navmap=navmap,
        totalpagecount=pagecount,
        maxpagenumber=pagecount)

def from_document(doc, name=None):
    """ Builds an epub file in memory from a Tika document. """
    # An epub document is a zipfile, with manifest metadata,
    # containing HTML and CSS files    
    zipcontent = StringIO()
    if name is None:
        name = doc.metadatum('title', doc.name)
    
    with zipfile.ZipFile(zipcontent, 'w') as epubfile:
        # each call to epubfile.writestr(name, stuff) creates a file
        # inside the zip archive named `name`, containing `stuff`
        epubfile.writestr(
            'mimetype',
            settings.TIKA_MIME_OVERRIDES['epub'])
        
        epubfile.writestr(
            'META-INF/container.xml',
            unicode(container()).encode('UTF-8'))
        
        epubfile.writestr(
            'OEBPS/toc.ncx',
            unicode(toc_ncx(doc, name=name)).encode('UTF-8'))
        
        epubfile.writestr(
            'OEBPS/styles.css',
            unicode(css()).encode('UTF-8'))
        
        for idx, section in enumerate(doc.sections):
            epubfile.writestr(
                'OEBPS/Section-%s.xhtml' % idx,
                unicode(section_xhtml(section,
                    title="Section %s" % idx)).encode('UTF-8'))
        
        epubfile.writestr('OEBPS/content.opf',
            unicode(index(name=name,
                manifest=manifest(doc.sections),
                spine=spine(doc.sections),
                language=doc.language)).encode('UTF-8'))
    
    zipcontent.seek(0)
    return zipcontent
    