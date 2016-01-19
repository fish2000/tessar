IPython 0.10.2 -- An enhanced Interactive Python.
?         -> Introduction and overview of IPython's features.
%quickref -> Quick reference.
help      -> Python's own help system.
object?   -> Details about 'object'. ?object also works, ?? prints more.
In [1]: from net.semanticmetadata.lire.indexing.hashing import BitSampling
In [2]: from net.semanticmetadata.lire.imageanalysis import OpponentHistogram
In [3]: ImageIO
---------------------------------------------------------------------------
NameError                                 Traceback (most recent call last)

/Users/fish/Praxa/TESSAR/<ipython console> in <module>()

NameError: name 'ImageIO' is not defined
In [4]: from javax.imageio import ImageIO
In [5]: from java.io import File
In [6]: from os.path import expanduser
In [7]: img_name = '8411181216_b16bf74632_o.jpg'
In [8]: img_pth = "~/Downloads/%s"
In [9]: img = ImageIO.read(File(expanduser(img_pth % img_name)))
In [10]: img
Out[10]: BufferedImage@3122b117: type = 5 ColorModel: #pixelBits = 24 numComponents = 3 color space = java.awt.color.ICC_ColorSpace@534ca02b transparency = 1 has alpha = false isAlphaPre = false ByteInterleavedRaster: width = 612 height = 612 #numDataElements 3 dataOff[0] = 2
In [11]: opphist = OpponentHistogram()
In [12]: opphist.

