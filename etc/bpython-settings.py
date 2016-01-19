
from __future__ import print_function

## timer
import time
t1 = time.time()

import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'tessar.settings'
from django.conf import settings

#from django.contrib.auth.models import User
#fish = User.objects.get(username='fish')

# numpy/scipy ndimages
import numpy
from imread import imread
#from scipy import ndimage
#import skimage
#import skimage.filter
from PIL import Image

# testing images
import re
import random
from os.path import expanduser
from os import listdir

#img_name = '8411181216_b16bf74632_o.jpg'
impth = "~/Downloads/%s"
jpre = re.compile(r"\.jpe?g$", re.IGNORECASE)
TEST_IMAGES = []
IMG = None

def get_test_images():
    global jpre
    global impth
    global TEST_IMAGES
    TEST_IMAGES.extend(
        map(lambda imfile: expanduser(impth % imfile),
            filter(lambda imfile: jpre.search(imfile),
                listdir(expanduser(impth % '')))))
    
    if len(TEST_IMAGES) > 0:
        print(">>> Populated TEST_IMAGES with %d JPEGs (from %s)" % (
            len(TEST_IMAGES),
            expanduser(impth % "")))

def get_random_image():
    global IMG
    if not len(TEST_IMAGES) > 0:
        return None
    IMG = imread(random.choice(TEST_IMAGES))

get_test_images()
get_random_image()

## web scraping stuff
from bs4 import BeautifulSoup

## misc stuff
import os, sys, requests, xerox, shutil
from os.path import expanduser, basename, dirname, join


import fullcontact
try:
    fc = fullcontact.FullContact(os.environ['FULLCONTACT_API_KEY'])
except TypeError:
    print("--- ERROR: FullContact wrapper failed to initialize")

## how long... has this been... going on?
t2 = time.time()
dt = str((t2-t1)*1.00)
dtout = dt[:(dt.find(".")+4)]
print(">>> VirtualEnv TESSAR Praxon loaded in %ssec from %s" % (dtout, '/Users/fish/Praxa/TESSAR'))




