
from __future__ import print_function

from pylire.process.channels import RGB

class NDImageFeature(object):
    """ Python descriptor for image features """
    def __init__(self, extractor=None):
        self.extractor = extractor and staticmethod(extractor) or self.extractor
    
    def __get__(self, ndimagefile=None, owner=None):
        if ndimagefile is None:
            raise AttributeError(
                "This attribute can only be accessed from %s instances."
                % owner.__name__)
        return self.extractor(
            *RGB(ndimagefile.as_array()))
        
    def __set__(self, ndimagefile, value):
        """ Image features are R/O """
        raise AttributeError("Image features are read only")
    
    def extractor(self, ndimage):
        """ Identity function (override this) """
        return ndimage

