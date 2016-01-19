#!/usr/bin/env python
# encoding: utf-8
from __future__ import print_function

import re
import requests
import urllib
from urlstring import URL
from os.path import basename
from functools import wraps

from ffffound.user_agent import user_agent

class restmethod(object):
    def __init__(apimethod, endpoint, http_method="post"):
        apimethod.endpoint = endpoint
        apimethod.http_method = http_method.lower()
    def __call__(apimethod, f):
        @wraps(f)
        def methodcall(self, **kwargs):
            if not hasattr(self, 'session'):
                self.session = requests.Session()
            session = getattr(self, 'session')
            request_method = getattr(session,
                apimethod.http_method.lower())
            url = self.base_url.add_path(apimethod.endpoint)
            api_response = request_method(
                url, data=kwargs, headers=self.headers)
            return f(self, api_response)
        methodcall.__name__ = apimethod.endpoint
        return methodcall

class APIBase(object):
    ''' A low-level base class for API request handles '''
    
    base_url = URL('http://localhost:8080/')
    
    @classmethod
    def ping(cls):
        return False
    
    def __init__(self, *args, **kwargs):
        ''' Pass another APIBase to reclaim its session:
                api = APIBaseSubclass(some_api_instance)
            Pass a session object via 'session' kwarg to use that specific
            session instance:
                my_sesh = requests.Session()
                api = APIBaseSubclass(session=my_sesh)
        '''
        session = None
        super(APIBase, self).__init__(*args, **kwargs)
        for arg in args:
            if hasattr(arg, 'session'):
                session = arg.session
                break
                
        self.user_agent = kwargs.pop('user_agent',
            user_agent())
        self.session = kwargs.pop('session',
            session or requests.Session())
        self.headers = kwargs.pop('headers',
            dict())
        self.headers.update({ 'User-Agent': self.user_agent, })

class FFAPI(APIBase):
    
    base_url = URL('http://ffffound.com/gateway/in/api')
    post_url = URL('http://ffffound.com/add_asset')
    bookmarklet = URL('http://ffffound.com/bookmarklet.js')
    post_token_regex = re.compile("token\s?\=\s?\'(\S+\=)\';")
    ping_url = URL('http://ffffound.com/about')
    
    @classmethod
    def ping(cls):
        return requests.get(cls.ping_url).status_code == 200
    
    def __init__(self, *args, **kwargs):
        from ffffound.models import docstash
        
        username = kwargs.pop('username', None)
        password = kwargs.pop('password', None)
        
        self.logged_in = False
        self.asset_response_cache = docstash
        
        super(FFAPI, self).__init__(*args, **kwargs)
        
        if self.ping() and username and password:
            self.login(username, password)
    
    @restmethod('login')
    def _login(self, response):
        """ Usage: api._login(hostname=<username>, password=<password>) """
        print("response content: %s" % response.content)
        print("response url: %s" % response.url)
        print("request url: %s" % response.request.url)
        self.login_response = response.json()
        if response.status_code != 200:
            return False
        if 'success' not in self.login_response:
            return False
        return self.login_response['success']
    
    def login(self, username=None, password=None):
        if username is None:
            raise TypeError("login(): Username required")
        if password is None:
            raise TypeError("login(): Password required")
        self.logged_in = self._login(
            hostname=username,
            password=password)
        return self.logged_in
    
    @restmethod('logout')
    def logout(self, response):
        """ Usage: api.logout() """
        self.logout_response = response.json()
        return response.status_code == 200
    
    @restmethod('get_image_info')
    def get_image_info(self, response):
        """ Usage: api.get_image_info(hash_key=<hash>, collection_id=<cID>) """
        # This may be depreciated
        return (response.status_code == 200) and response.json() or dict()
    
    @restmethod('get_assets')
    def _get_assets(self, response):
        """ Usage: api.get_image_info(hostname=<username>, offset=<INT>) """
        if not response.status_code == 200:
            return dict()
        response_json = response.json()
        if response_json['success']:
            self._asset_count = response_json['assets_count']
        return response_json
    
    @staticmethod
    def _asset_cache_key(username, offset):
        return "%s:%d" % (username, offset)
    
    def _asset_cache_STO(self, username, offset, asset_response):
        self.asset_response_cache[
            self._asset_cache_key(username, offset)] = asset_response
        return asset_response
    
    def _asset_cache_RCL(self, username, offset):
        from ffffound.json_importer import json_module
        return json_module.loads(
            self.asset_response_cache.get(
                self._asset_cache_key(username, offset),
                "null"))
    
    def get_assets(self, username=None, offset=0):
        if username is None and not self.logged_in:
            raise TypeError("get_assets(): Username required (not logged in)")
        
        return \
            self._asset_cache_RCL(username, offset) or \
            self._asset_cache_STO(username, offset,
                self._get_assets(
                    hostname=username or self.login_response['hostname'],
                    offset=offset))
    
    @property
    def asset_count(self):
        if not hasattr(self, '_asset_count'):
            if not self.logged_in:
                raise ValueError("asset_count: Not logged in")
            self._asset_count = self.get_assets()['assets_count']
        return self._asset_count
    
    def get_all_asset_ids(self, username=None, maximum=0):
        _ffffinds = dict()
        
        if username is None and not self.logged_in:
            raise TypeError("get_all_asset_ids(): Username required (not logged in)")
        if username is None:
            username = self.login_response['hostname']
        
        asset_histogram = dict()
        if not int(maximum):
            maximum = self.asset_count
        else:
            maximum = int(min(maximum, self.asset_count))
        
        for idx in xrange(0, maximum, 25):
            print(">>>>> GETTING ASSET IDS: %d" % idx)
            asset_dict = self.get_assets(username=username, offset=idx)
            for asset in asset_dict['assets']:
                asset_id = asset['image_hash_key']
                print(">>> ASSET ID: %s" % asset_id)
                
                if asset_id:
                    asset_histogram[asset_id] = asset.get('count', 1)
                    if asset_id not in _ffffinds:
                        asset_url = asset.get('url', asset.get('image'))
                        if asset_url:
                            _ffffinds[asset_id] = asset_url
        
        print(">>>>> SAVING ASSETS: %d total" % len(_ffffinds))
        from ffffound.models import RemoteImage
        for asset_id, asset_url in _ffffinds.items():
            try:
                RemoteImage.objects.get(asset_id__iexact=asset_id)
            except RemoteImage.DoesNotExist:
                ffffind = RemoteImage.objects.create()
                try:
                    ffffind.asset_id = asset_id
                    ffffind.image = asset_url
                except IOError, err:
                    print("=== BAD ASSET URL: %s" % asset_url)
                    print("--- Assignment raised: %s" % err)
                    if ffffind.pk:
                        ffffind.delete()
                else:
                    print(">>> SAVING: %s" % ffffind.image.name)
                    ffffind.save()
        
        return asset_histogram
    
    @restmethod('add_recommender')
    def add_recommender(self, response):
        """ Usage: api.add_recommender(hostname=<username>) [EXPERIMENTAL] """
        return (response.status_code == 200) and response.json() or dict()
    
    @restmethod('remove_recommender')
    def remove_recommender(self, response):
        """ Usage: api.remove_recommender(hostname=<username>) [EXPERIMENTAL] """
        return (response.status_code == 200) and response.json() or dict()
    
    @restmethod('get_recommender_suggestion')
    def get_recommender_suggestion(self, response):
        """ Usage: api.get_recommender_suggestion() [EXPERIMENTAL] """
        return (response.status_code == 200) and response.json() or dict()
    
    def get_post_token(self):
        if not self.logged_in:
            raise ValueError("get_post_token(): Not logged in")
        if not self.session:
            raise ValueError("get_post_token(): Session not initialized")
        bookmarklet_js = self.session.get(self.bookmarklet, headers=self.headers)
        return self.post_token_regex.search(bookmarklet_js).groups()[0]
    
    def post_image(self, url, referer=None, title=None, alt=None):
        if referer is None:
            referer = url
        if title is None:
            title = basename(URL(url).path)
        if alt is None:
            alt = title
        
        image_post_url = "%s?%s" % (
            self.post_url,
            urllib.urlencode({
                "token": self.get_post_token(),
                "url": url,
                "referer": referer,
                "title": title,
                "alt": alt,
            }))
        post_response = self.session.post(image_post_url)
        if post_response.status_code == 200:
            del self._asset_count
            return True

if __name__ == '__main__':
    from pprint import pprint
    import os, sys
    
    try:
        api = FFAPI(
            username=os.environ['FF_USER'],
            password=os.environ['FF_PASS'])
    except KeyError, err:
        print("""
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            
            ERROR: tests require ffffound.com credentials!
            
            To run the API tests, define the environment variables:
                FF_USER
            and 
                FF_PASS
            
            ... with valid corresponding Ffffound.com credentials.
            
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            KeyError raised for: %s
        """ % err, file=sys.stderr)
        sys.exit(1)
    else:
        print("""
    oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo            
            
            Ffffound.com API wrapper initialized
                FF_USER: %s
                FF_PASS: xxxxxxxx (not shown)
    
    oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    
        """ % os.environ['FF_USER'])
    
    # print(">>> LOGIN RESPONSE:")
    # pprint(api.login_response,
    #     indent=4)
    # print('')
    
    print(">>> ASSET COUNT: %s" % api.asset_count)
    print(">>> ASSETS (first page)")
    pprint(api.get_assets(),
        indent=4)
    print('')
    
    # print(">>> ALL THE ASSET IDS!!!")
    # pprint(
    #     api.get_all_asset_ids(maximum=400),
    #     indent=4)
    # print('')
    
    print(">>> GET_RECOMMENDER_SUGGESTION:")
    pprint(api.get_recommender_suggestion(),
        indent=4)
    print('')
