import numpy as np
from PIL import Image, ImageDraw, ImageFont

SRC = r'C:\Users\39993\.dsh\attachments\v1\objects\c3\c3b1e8b4edca7d10c0b0713b1679987a8b5750506e241641004155c918f750fb'
AFTER = r'C:\Users\39993\Documents\deepseek-harness\default-workspace\glass-mockup\preview.png'
OUT = r'C:\Users\39993\Documents\deepseek-harness\default-workspace\glass-mockup\compare.png'

FONT_B = r'C:\Windows\Fonts\msyhbd.ttc'
FONT_R = r'C:\Windows\Fonts\msyh.ttc'

TARGET_W = 700
GAP = 56
MARGIN = 64
LABEL_H = 96


def rounded(im, r):
    im = im.convert('RGBA')
    m = Image.new('L', im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], radius=r, fill=255)
    out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0), m)
    return out


def ring(im, r, color, w=3):
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([w // 2, w // 2, im.size[0] - 1 - w // 2, im.size[1] - 1 - w // 2],
                        radius=r, outline=color, width=w)
    return im


# ---------- 改造前 ----------
before = Image.open(SRC).convert('RGB').crop((112, 0, 732, 1268))
bw, bh = TARGET_W, int(round(before.size[1] * TARGET_W / before.size[0]))
before = before.resize((bw, bh), Image.LANCZOS)
before = rounded(before, 46)
before = ring(before, 46, (255, 255, 255, 30), 3)

# ---------- 改造后 ----------
after = Image.open(AFTER).convert('RGB')
aw = TARGET_W
ah = int(round(after.size[1] * aw / after.size[0]))
after = after.resize((aw, ah), Image.LANCZOS)
after = rounded(after, 46)
after = ring(after, 46, (167, 139, 250, 120), 3)

# ---------- 画布 ----------
H = max(bh, ah) + MARGIN * 2 + LABEL_H
W = MARGIN * 2 + bw + GAP + aw
canvas = Image.new('RGB', (W, H), (9, 8, 14))

# 背景淡光
glow = Image.new('RGB', (W, H), (9, 8, 14))
gd = ImageDraw.Draw(glow)
gd.ellipse([W // 2 - 420, -260, W // 2 + 420, 320], fill=(46, 22, 88))
glow = glow.filter(__import__('PIL.ImageFilter', fromlist=['x']).GaussianBlur(120))
canvas = Image.blend(canvas, glow, 0.55)

canvas.paste(before, (MARGIN, MARGIN + LABEL_H), before)
canvas.paste(after, (MARGIN + bw + GAP, MARGIN + LABEL_H), after)

d = ImageDraw.Draw(canvas)
f_lab = ImageFont.truetype(FONT_B, 40)
f_sub = ImageFont.truetype(FONT_R, 26)

d.text((MARGIN + 6, MARGIN + 18), '改造前', font=f_lab, fill=(150, 148, 162))
d.text((MARGIN + 138, MARGIN + 30), '平面填充 · 无景深', font=f_sub, fill=(104, 102, 116))

d.text((MARGIN + bw + GAP + 6, MARGIN + 18), '改造后', font=f_lab, fill=(233, 213, 255))
d.text((MARGIN + bw + GAP + 138, MARGIN + 30), '极光玻璃 · 真实透光', font=f_sub, fill=(167, 139, 250))

canvas.save(OUT, quality=95)
print('saved', OUT, canvas.size)
