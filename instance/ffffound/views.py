
from __future__ import print_function

import re
import requests
import hashlib

from time import sleep
from os import makedirs
from os.path import join, isdir, basename, dirname
from bs4 import BeautifulSoup
from urlparse import urljoin
from urllib import unquote

from django.conf import settings
from signalqueue.worker.backends import RedisSetQueue
from tika.views import apicall, APIError

queue = RedisSetQueue(queue_name='ffffound')
jpg_attrs = { 'href': re.compile(r'\.jpe?g$', re.IGNORECASE) }

@apicall
def html_url(request, url):
    if not queue.ping():
        raise APIError('fail', "Queue server ping failed")
    html_url = '%' in url and unquote(url) or url
    queue.push(html_url)
    return dict(url=url, queued=queue.count())

def download_directory(url):
    pth = join(
        settings.MEDIA_ROOT,
        'downloads',
        hashlib.sha1(dirname(
            url.lower())).hexdigest())
    if not isdir(pth):
        makedirs(pth)
    return pth

def download_image(url):
    pth = join(download_directory(url), basename(url))
    r = requests.get(url, stream=True)
    if r.status_code == 200:
        with open(pth, 'wb') as f:
            for chunk in r.iter_content():
                f.write(chunk)
            f.flush()

def test(url):
    html_url = '%' in url and unquote(url) or url
    soup = BeautifulSoup(requests.get(html_url).content)
    for anchor in soup.findAll('a', attrs=jpg_attrs):
        href = anchor.attrs.get('href')
        img_url = urljoin(html_url, href)
        print("Downloading: %s" % img_url)
        download_image(img_url)

def dequeue():
    while True:
        html_url = queue.pop()
        if html_url:
            sleep(1)
            print("HTML: %s" % html_url)
            soup = BeautifulSoup(requests.get(html_url).content)
            for anchor in soup.findAll('a', attrs=jpg_attrs):
                href = anchor.attrs.get('href')
                img_url = urljoin(html_url, href)
                if img_url:
                    sleep(1)
                    print("Downloading: %s" % img_url)
                    download_image(img_url)

if __name__ == '__main__':
    dequeue()


