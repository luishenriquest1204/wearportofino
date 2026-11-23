"""Extract clean photographs and logo artwork from the reference mockups.
Text baked into the mockups is removed (OpenCV inpainting) so the site can set it as real text."""
import cv2, numpy as np, os, subprocess, sys
SRC = sys.argv[1]; OUT = sys.argv[2]; BR = sys.argv[3]; TMP = sys.argv[4]
im = lambda n: cv2.imread(os.path.join(SRC, f"{n}.jpg"))
def save(img, name, q=86):
    cv2.imwrite(os.path.join(OUT, name), img, [cv2.IMWRITE_WEBP_QUALITY, q]); print(name, img.shape[1], img.shape[0])
def inpaint_text(img, box, bright=True, thr=None, grow=4):
    x0,y0,x1,y1 = box
    roi = img[y0:y1, x0:x1]; g = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    m = (g > (thr or 185)) if bright else (g < (thr or 150))
    m = cv2.dilate(m.astype(np.uint8)*255, np.ones((grow,grow),np.uint8), iterations=2)
    mask = np.zeros(img.shape[:2], np.uint8); mask[y0:y1, x0:x1] = m
    return cv2.inpaint(img, mask, 7, cv2.INPAINT_TELEA)
def fill_rect(img, box):
    x0,y0,x1,y1 = box; mask = np.zeros(img.shape[:2], np.uint8); mask[y0:y1, x0:x1] = 255
    return cv2.inpaint(img, mask, 9, cv2.INPAINT_TELEA)

# Clean originals
save(im(6), "hero-window.webp"); save(im(3), "door-portrait.webp"); save(im(5), "bench-sunset.webp"); save(im(4), "ferry-wood.webp")
# Building (right half of 8) without baked text
b = im(8); b = inpaint_text(b, (1340, 625, 1665, 728)); save(b[:, 1000:2000], "building.webp")
# Ferry interior (9) without caption
f = im(9); f = inpaint_text(f, (35, 778, 525, 860), thr=150); save(f, "ferry-interior.webp")
# Campaign (13): man in courtyard + collar detail
c = im(13); save(c[:, 0:1000], "courtyard-portrait.webp"); save(c[211:712, 1111:1538], "collar-detail.webp")
# Products (studio renders from the references), "NEW" pills removed
p = im(12)
for x0, x1, name in [(27, 455, "product-blouse"), (533, 961, "_b"), (1040, 1467, "product-shorts"), (1546, 1973, "_t")]:
    pass
cards = {"product-blouse": (533, 961), "product-shorts": (1040, 1467)}
for name, (x0, x1) in cards.items():
    q = fill_rect(p.copy(), (x0+8, 196, x0+90, 232)); save(q[188:691, x0:x1], name + ".webp", 90)
s = im(11); save(s[114:1186, 1000:1911], "product-shirt.webp", 90)
t = im(10); t = fill_rect(t, (1515, 60, 1600, 100)); save(t[51:576, 1503:1949], "product-trouser.webp", 90)
# Newsletter sketch background (14) with the text removed
n = im(14); n = inpaint_text(n, (520, 320, 1480, 880), bright=False, thr=215, grow=5); save(n, "portofino-sketch.webp", 80)

# Logos → vector (potrace)
def trace(img, box, name, scale=6, thr=128):
    x0,y0,x1,y1 = box; g = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2GRAY)
    g = cv2.resize(g, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC); g = cv2.GaussianBlur(g, (0,0), scale*0.35)
    bw = (g < thr).astype(np.uint8)
    h, w = bw.shape; pbm = os.path.join(TMP, name + ".pbm")
    with open(pbm, "wb") as fh:
        fh.write(f"P4\n{w} {h}\n".encode()); fh.write(np.packbits(bw, axis=1).tobytes())
    out = os.path.join(BR, name + ".svg")
    subprocess.run(["potrace", pbm, "-s", "-o", out, "--turdsize", "60", "--alphamax", "1.1", "--opttolerance", "0.3"], check=True)
    svg = open(out).read()
    import re
    svg = re.sub(r'<\?xml[^>]*>\s*|<!DOCTYPE[^>]*>\s*|<metadata>[\s\S]*?</metadata>\s*', '', svg).replace('fill="#000000"', 'fill="currentColor"')
    svg = re.sub(r'width="[^"]*" height="[^"]*"\s*viewBox="([^"]*)"', r'viewBox="\1"', svg).replace('preserveAspectRatio="xMidYMid meet"', '')
    open(out, "w").write(svg); print(name, "traced", w//scale, h//scale)
L = im(15)
trace(L, (70, 225, 520, 335), "portofino-dept", 6)
trace(L, (0, 735, 2000, 1056), "portofino-lockup", 3)
trace(im(14), (930, 325, 1065, 440), "monogram", 8, thr=120)
