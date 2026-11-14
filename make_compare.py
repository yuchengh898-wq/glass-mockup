#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
make_compare.py —— 生成「改造前 / 改造后」对比图

用法:
    python make_compare.py                 # 使用同目录下的 before.png 与 preview.png
    python make_compare.py 原始截图.png      # 指定改造前的截图

输出:
    compare.png
"""

import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ---------------- 路径 ----------------
BASE = os.path.dirname(os.path.abspath(__file__))

SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE, "before.png")
AFTER = os.path.join(BASE, "preview.png")
OUT = os.path.join(BASE, "compare.png")

# ---------------- 参数 ----------------
TARGET_W = 700      # 每张图的目标宽度
GAP = 56            # 两图间距
MARGIN = 64         # 外边距
LABEL_H = 96        # 标题区高度
RADIUS = 46         # 圆角半径

# 改造前截图的裁切范围（原始素材是 844x1268 的手机竖向截图）
CROP_BOX = (112, 0, 732, 1268)


# ---------------- 字体 ----------------
def load_font(size, bold=False):
    """按优先级找可用中文字体，找不到就用 PIL 默认字体。"""
    candidates = []
    if os.name == "nt":
        win = os.environ.get("WINDIR", r"C:\Windows")
        candidates += [
            os.path.join(win, "Fonts", "msyhbd.ttc" if bold else "msyh.ttc"),
            os.path.join(win, "Fonts", "msyh.ttf"),
            os.path.join(win, "Fonts", "simhei.ttf"),
        ]
    else:
        candidates += [
            "/System/Library/Fonts/PingFang.ttc",
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc" if bold
            else "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
            "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
        ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


# ---------------- 绘图工具 ----------------
def rounded(im, r):
    """给图片加圆角（透明背景）。"""
    im = im.convert("RGBA")
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, im.size[0] - 1, im.size[1] - 1], radius=r, fill=255
    )
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out


def ring(im, r, color, w=3):
    """给图片描一圈边框。"""
    d = ImageDraw.Draw(im)
    d.rounded_rectangle(
        [w // 2, w // 2, im.size[0] - 1 - w // 2, im.size[1] - 1 - w // 2],
        radius=r,
        outline=color,
        width=w,
    )
    return im


def fit_width(im, target_w):
    """按目标宽度等比缩放。"""
    w, h = im.size
    return im.resize((target_w, int(round(h * target_w / w))), Image.LANCZOS)


# ---------------- 主流程 ----------------
def main():
    for path, label in ((SRC, "改造前截图"), (AFTER, "改造后截图")):
        if not os.path.exists(path):
            print(f"[错误] 找不到{label}: {path}")
            print("       请把文件放到脚本同目录，或用命令行参数指定。")
            sys.exit(1)

    # ---- 改造前 ----
    raw = Image.open(SRC).convert("RGB")
    if raw.width >= CROP_BOX[2] and raw.height >= CROP_BOX[3]:
        raw = raw.crop(CROP_BOX)
    before = fit_width(raw, TARGET_W)
    before = ring(rounded(before, RADIUS), RADIUS, (255, 255, 255, 30), 3)

    # ---- 改造后 ----
    after = fit_width(Image.open(AFTER).convert("RGB"), TARGET_W)
    after = ring(rounded(after, RADIUS), RADIUS, (167, 139, 250, 120), 3)

    bw, bh = before.size
    aw, ah = after.size

    # ---- 画布 ----
    W = MARGIN * 2 + bw + GAP + aw
    H = max(bh, ah) + MARGIN * 2 + LABEL_H
    canvas = Image.new("RGB", (W, H), (9, 8, 14))

    # 背景淡光
    glow = Image.new("RGB", (W, H), (9, 8, 14))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W // 2 - 420, -260, W // 2 + 420, 320], fill=(46, 22, 88))
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    canvas = Image.blend(canvas, glow, 0.55)

    canvas.paste(before, (MARGIN, MARGIN + LABEL_H), before)
    canvas.paste(after, (MARGIN + bw + GAP, MARGIN + LABEL_H), after)

    # ---- 文字 ----
    d = ImageDraw.Draw(canvas)
    f_lab = load_font(40, bold=True)
    f_sub = load_font(26)

    d.text((MARGIN + 6, MARGIN + 18), "改造前", font=f_lab, fill=(150, 148, 162))
    d.text((MARGIN + 138, MARGIN + 30), "平面填充 · 无景深", font=f_sub, fill=(104, 102, 116))

    d.text((MARGIN + bw + GAP + 6, MARGIN + 18), "改造后", font=f_lab, fill=(233, 213, 255))
    d.text((MARGIN + bw + GAP + 138, MARGIN + 30), "极光玻璃 · 真实透光", font=f_sub, fill=(167, 139, 250))

    canvas.save(OUT, quality=95)
    print(f"已生成: {OUT}  尺寸 {canvas.size[0]}x{canvas.size[1]}")


if __name__ == "__main__":
    main()
