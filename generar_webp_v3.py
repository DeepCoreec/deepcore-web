"""
DeepCore — Generador WebP v3
Fondo oliva uniforme → chroma key limpio
"""
import cv2
import numpy as np
from PIL import Image
import os

VIDEO   = r'C:\Users\adaria\Downloads\lux.mp4'
OUT_DIR = r'C:\Users\adaria\Desktop\DeepCore'
CANVAS  = (180, 220)
CHAR_H  = 200

# Color de fondo del video (BGR)
BG_COLOR  = np.array([7, 109, 122], dtype=np.float32)
BG_THRESH = 38   # pixeles a menos de 38 unidades del fondo = transparente

PHASES = {
    'lux_walk':    (3,  11, 50),    # 8 frames
    'lux_work':    (5,  85, 42),    # 80 frames
    'lux_ulti':    (85, 121, 38),   # 36 frames
}

def remove_bg(frame_bgr):
    """Chroma key: distancia euclidea al color de fondo oliva."""
    diff = np.linalg.norm(
        frame_bgr.astype(np.float32) - BG_COLOR, axis=2
    )
    mask = (diff > BG_THRESH).astype(np.uint8) * 255

    # Limpiar ruido pequeño
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, k)

    # Cerrar huecos internos
    k2 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (8, 8))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k2)

    # Solo componente mas grande
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    if num_labels > 1:
        largest = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        mask = ((labels == largest).astype(np.uint8) * 255)

    # Suavizado suave en el borde (anti-aliasing)
    mask_blur = cv2.GaussianBlur(mask, (5, 5), 0)
    _, mask_hard = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
    mask_final = (mask_hard.astype(float) * 0.85 +
                  mask_blur.astype(float) * 0.15).astype(np.uint8)

    rgba = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGBA)
    rgba[:, :, 3] = mask_final
    return rgba

def normalize(rgba_np, canvas_wh=(180, 220), char_h=200):
    alpha = rgba_np[:, :, 3]
    ys, xs = np.where(alpha > 30)
    if len(ys) == 0:
        return Image.new('RGBA', canvas_wh, (0, 0, 0, 0))

    y1, y2 = ys.min(), ys.max()
    x1, x2 = xs.min(), xs.max()
    crop = rgba_np[y1:y2+1, x1:x2+1]

    h_char = y2 - y1 + 1
    w_char = x2 - x1 + 1
    scale  = char_h / h_char
    new_h  = char_h
    new_w  = max(1, int(w_char * scale))

    pil = Image.fromarray(crop, 'RGBA')
    pil = pil.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new('RGBA', canvas_wh, (0, 0, 0, 0))
    cx = (canvas_wh[0] - new_w) // 2
    cy = canvas_wh[1] - new_h - 5
    canvas.paste(pil, (cx, cy), pil)
    return canvas

def extract_frames(cap, start, end):
    frames = []
    for i in range(start, end):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if ret:
            frames.append(frame)
    return frames

def make_webp(name, frames_bgr, delay_ms):
    print(f'  {name} ({len(frames_bgr)} frames)...')
    pil_frames = []
    for i, f in enumerate(frames_bgr):
        rgba = remove_bg(f)
        norm = normalize(rgba, CANVAS, CHAR_H)
        pil_frames.append(norm)
        if (i + 1) % 20 == 0:
            print(f'    {i+1}/{len(frames_bgr)}')

    out = os.path.join(OUT_DIR, name + '.webp')
    pil_frames[0].save(
        out, format='WEBP', save_all=True,
        append_images=pil_frames[1:],
        duration=delay_ms, loop=0, quality=90,
    )
    print(f'  Guardado: {out}')

# ── MAIN ──
cap = cv2.VideoCapture(VIDEO)
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps   = cap.get(cv2.CAP_PROP_FPS)
print(f'Video: {total} frames @ {fps:.1f}fps')

# Probar un frame primero
cap.set(cv2.CAP_PROP_POS_FRAMES, 40)
ret, test_frame = cap.read()
rgba_test = remove_bg(test_frame)
norm_test = normalize(rgba_test, CANVAS, CHAR_H)
bg_test = Image.new('RGBA', CANVAS, (255, 0, 0, 255))
result = Image.alpha_composite(bg_test, norm_test)
result.save(os.path.join(OUT_DIR, 'test_chromakey.png'))
print('Test guardado: test_chromakey.png — verificar antes de continuar')
input('Presiona ENTER para continuar con todos los WebPs...')

for name, (start, end, delay) in PHASES.items():
    print(f'\n[{name}]')
    frames = extract_frames(cap, start, end)
    make_webp(name, frames, delay)

print('\n[lux_walkout]')
walk_frames = extract_frames(cap, 3, 11)
make_webp('lux_walkout', list(reversed(walk_frames)), 50)

cap.release()
print('\nTodos los WebPs generados.')
