"""Generate original botanical line-art SVGs for the Teplitsa site."""
import math, random, os

OUT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUT, exist_ok=True)


def leaf(x, y, ang, L, W):
    """Leaf outline + midrib as path strings, base at (x,y), pointing at ang (deg)."""
    a = math.radians(ang)
    ca, sa = math.cos(a), math.sin(a)
    def P(u, v):
        return (x + u * ca - v * sa, y + u * sa + v * ca)
    p0 = P(0, 0); tip = P(L, 0)
    c1 = P(L * .25, -W); c2 = P(L * .75, -W * .9)
    c3 = P(L * .75, W * .9); c4 = P(L * .25, W)
    outline = (f"M{p0[0]:.1f} {p0[1]:.1f}C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {tip[0]:.1f} {tip[1]:.1f}"
               f"C{c3[0]:.1f} {c3[1]:.1f} {c4[0]:.1f} {c4[1]:.1f} {p0[0]:.1f} {p0[1]:.1f}Z")
    m = P(L * .82, 0)
    rib = f"M{p0[0]:.1f} {p0[1]:.1f}L{m[0]:.1f} {m[1]:.1f}"
    return outline, rib


def flower(cx, cy, r, n=5, rot=0):
    parts = []
    for k in range(n):
        a = math.radians(rot + k * 360 / n)
        px, py = cx + math.cos(a) * r * .55, cy + math.sin(a) * r * .55
        parts.append(f'<ellipse cx="{px:.1f}" cy="{py:.1f}" rx="{r*.55:.1f}" ry="{r*.32:.1f}" transform="rotate({math.degrees(a):.1f} {px:.1f} {py:.1f})"/>')
    parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r*.18:.1f}"/>')
    return "".join(parts)


def sprig(x, y, length, ang, curve, leaves, rnd, bloom=True):
    """Curved stem with alternating leaves and an optional bloom at the tip."""
    a = math.radians(ang)
    ex, ey = x + math.cos(a) * length, y + math.sin(a) * length
    nx, ny = -math.sin(a), math.cos(a)
    cx, cy = (x + ex) / 2 + nx * curve, (y + ey) / 2 + ny * curve
    out = [f'<path d="M{x:.1f} {y:.1f}Q{cx:.1f} {cy:.1f} {ex:.1f} {ey:.1f}"/>']
    for i in range(leaves):
        t = .22 + .68 * i / max(1, leaves - 1)
        px = (1 - t) ** 2 * x + 2 * (1 - t) * t * cx + t * t * ex
        py = (1 - t) ** 2 * y + 2 * (1 - t) * t * cy + t * t * ey
        tx = 2 * (1 - t) * (cx - x) + 2 * t * (ex - cx)
        ty = 2 * (1 - t) * (cy - y) + 2 * t * (ey - cy)
        base = math.degrees(math.atan2(ty, tx))
        side = 1 if i % 2 == 0 else -1
        o, r = leaf(px, py, base + side * (42 + rnd.uniform(-6, 6)), length * rnd.uniform(.16, .21), length * .055)
        out.append(f'<path d="{o}"/><path d="{r}"/>')
    if bloom:
        out.append(flower(ex, ey, length * .1, 5, rnd.uniform(0, 72)))
    return "".join(out)


def tile(name, size, color, opacity, seed, sw=1.1):
    rnd = random.Random(seed)
    body = []
    spots = [(.12, .88, -72), (.52, .97, -105), (.9, .55, -148), (.3, .42, -25), (.72, .2, 165), (.05, .3, -60), (.6, .6, 40)]
    for (fx, fy, ang) in spots:
        L = size * rnd.uniform(.17, .27)
        body.append(sprig(fx * size, fy * size, L, ang + rnd.uniform(-12, 12), L * rnd.uniform(-.18, .18), rnd.choice([3, 4]), rnd, rnd.random() > .3))
    # tiny dots / buds scattered
    for _ in range(7):
        body.append(f'<circle cx="{rnd.uniform(0,size):.1f}" cy="{rnd.uniform(0,size):.1f}" r="{rnd.uniform(1.2,2.2):.1f}" fill="{color}" stroke="none"/>')
    inner = "".join(body)
    # wrap copies so the pattern tiles seamlessly
    copies = "".join(f'<g transform="translate({dx} {dy})">{inner}</g>' for dx in (-size, 0, size) for dy in (-size, 0, size))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">'
           f'<g fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" opacity="{opacity}">{copies}</g></svg>')
    open(f"{OUT}/{name}.svg", "w").write(svg)


def branch(name, w, h, color, opacity, seed, sw=1.4):
    """Large single botanical illustration: a tall arching stem with leaves and blooms."""
    rnd = random.Random(seed)
    body = []
    body.append(sprig(w * .5, h, h * .8, -94, h * .1, 6, rnd))
    body.append(sprig(w * .52, h * .74, h * .42, -50, -h * .05, 3, rnd))
    body.append(sprig(w * .49, h * .58, h * .36, -138, h * .05, 3, rnd))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
           f'<g fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" opacity="{opacity}">{"".join(body)}</g></svg>')
    open(f"{OUT}/{name}.svg", "w").write(svg)


# section patterns (tone-on-tone)
tile("pattern-cream", 380, "#2b7a45", .12, 3)
tile("pattern-blush", 340, "#b3305a", .17, 7)
tile("pattern-forest", 380, "#f5b8c8", .10, 11)
# large illustrations
branch("branch-green", 520, 640, "#2b7a45", .5, 5)
branch("branch-pink", 520, 640, "#f5b8c8", .45, 9)
print(sorted(os.listdir(OUT)), [os.path.getsize(f"{OUT}/{f}") for f in sorted(os.listdir(OUT))])
