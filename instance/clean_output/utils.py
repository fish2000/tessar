#!/usr/bin/env python
# encoding: utf-8
from __future__ import print_function

import re
from bs4 import BeautifulSoup, UnicodeDammit

match_classes = re.compile(
    r"<([A-Za-z]+) class\=\".+\"(/?)>",
    re.IGNORECASE | re.MULTILINE)
match_multilines = re.compile(
    r"\n\n+", re.MULTILINE)
match_artifacts = re.compile(
    ur"<p>(<i>)?[�]+(</i>)?</p>",
    re.IGNORECASE | re.UNICODE)
p_corrector = re.compile(r'<p\s*/>', re.IGNORECASE)
match_section_breaks = re.compile(
    ur"(<p>[���\s]*</p>\s*)+",
    re.MULTILINE | re.IGNORECASE | re.UNICODE)

def cleanse(html_source, pretty_print=False, formatter='html'):
    if html_source is None:
        return ''
    
    # convert to unicode
    html_unicode = UnicodeDammit(html_source).unicode_markup
    
    # strip classes
    html_sans_classes = match_classes.subn(r"<\1\2>", html_unicode)[0]
    
    # strip artifacts
    html_sans_artifacts = match_artifacts.subn(r"", html_sans_classes)[0]
    
    # insert <hr> tags at section breaks
    html_with_section_breaks = match_section_breaks.subn(
        r'<hr class="section-break" />\n',
        p_corrector.subn(r'<p></p>', html_sans_artifacts)[0])[0]
    
    # strip metatags from header
    soup_sans_metatags = BeautifulSoup(html_with_section_breaks)
    ex_ = [meta.replace_with(u'') for meta in soup_sans_metatags.findAll(name='meta')]
    del ex_
    
    # decode most html entities
    html_sans_most_entities = soup_sans_metatags.decode(
        pretty_print=pretty_print,
        formatter=formatter)
    
    # consolidate multiple empty lines
    html_clean = match_multilines.subn(r"\n\n", html_sans_most_entities)[0]
    
    # return unicode
    return html_clean

def entity_wax(html_source, pretty_print=False):
    ''' The BS4 HTML formatter gives you high codepoints
        encoded as HTML entities '''
    return cleanse(html_source,
        pretty_print=pretty_print,
        formatter='html')

def codepoint_shine(html_source, pretty_print=False):
    ''' The BS4 HTML formatter *seems* to preserve unencoded
        Unicode multibyte character numbers '''
    return cleanse(html_source,
        pretty_print=pretty_print,
        formatter='xml')

def break_into_sections(html_source):
    body = BeautifulSoup(cleanse(html_source,
        pretty_print=False,
        formatter='html')).find(name='body')
    section = u''
    sections = []
    supersize = True
    for idx, bodypart in enumerate(body.children):
        if bodypart.name:
            if bodypart.name.lower() == "hr":
                supersize = True
                sections.append(section)
                section = u''
                continue
            if supersize:
                bodypart.name = 'h1'
                supersize = False
        section += unicode(bodypart)
    sections.append(section)
    return sections


if __name__ == "__main__":
    from os.path import dirname, join
    test_data_file = join(
        dirname(dirname(__file__)),
        'assets', 'test_data',
        'sample-output-short.html')
    
    with open(test_data_file, "r") as sample:
        sample_unclean = sample.read()
    
    
    print(u"ENTITY WAX(tm)")
    print('-' * 90)
    print(entity_wax(sample_unclean, pretty_print=True)[150:1250])
    #print(entity_wax(sample_unclean, pretty_print=True))
    print('')
    print('')
    
    print(u"CODEPOINT SHINE(tm)")
    print('-' * 90)
    print(codepoint_shine(sample_unclean, pretty_print=True)[150:1250])
    print('')
    print('')
    
    print('-' * 90)
    print('')
    
    print("UGLY-PRINTED:")
    print(cleanse(sample_unclean)[150:850])
    print('')
    print('')
    
    print("PRETTY-PRINTED:")
    print(cleanse(sample_unclean, pretty_print=True)[250:500])
    print('')
    print('')
    
    print("UGLY-PRINTED, XML-STYLE:")
    print(cleanse(sample_unclean, pretty_print=False, formatter='xml')[150:850])
    print('')
    print('')
    
    print("PRETTY-PRINTED, XML-STYLE (oxymoron?):")
    print(cleanse(sample_unclean, pretty_print=True, formatter='xml')[250:500])
    print('')
    print('')
