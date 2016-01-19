import cv2
import numpy as np
import sys

def make_mask(img):
  sob_x = cv2.cvtColor(cv2.Sobel(img, -1, 1, 0), cv2.COLOR_BGR2GRAY)
  sob_y = cv2.cvtColor(cv2.Sobel(img, -1, 0, 1), cv2.COLOR_BGR2GRAY)
  result = np.maximum(sob_x, sob_y)
  result = cv2.blur(result, (31, 31)) + 1
  return result

def merge(imgs):
  imgs = [(img.astype(float), make_mask(img).astype(float)**2) for img in imgs]
  mask_sum = reduce(lambda x, y: x + y, [mask for (_, mask) in imgs])
  res = np.zeros(imgs[0][0].shape)
  for (img, mask) in imgs:
    for c in range(3):
      img[:,:,c] *= (mask / mask_sum)
    res += img
  return res.astype(np.uint8)

def main():
  imgs = [cv2.imread(fname) for fname in sys.argv[1:-1]]
  img = merge(imgs)
  cv2.imwrite(sys.argv[-1], img)

if __name__ == '__main__':
  main()