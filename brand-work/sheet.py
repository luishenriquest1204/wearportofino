import cv2, numpy as np, subprocess, sys
def load(p, h):
    im = cv2.imread(p); s = h/im.shape[0]; return cv2.resize(im, (int(im.shape[1]*s), h))
row1 = [load('public/img/'+n, 400) for n in ['building.webp','ferry-interior.webp','portofino-sketch.webp']]
row2 = [load('public/img/'+n, 300) for n in ['product-shirt.webp','product-blouse.webp','product-shorts.webp','product-trouser.webp','collar-detail.webp']]
def hcat(row):
    return np.hstack([np.pad(r, ((0,0),(0,10),(0,0)), constant_values=255) for r in row])
a, b = hcat(row1), hcat(row2); W = max(a.shape[1], b.shape[1])
pad = lambda x: np.pad(x, ((0,10),(0, W-x.shape[1]),(0,0)), constant_values=255)
cv2.imwrite(sys.argv[1], np.vstack([pad(a), pad(b)]))
