# Hero Images

Homepage hero images live here. They're used in the homepage hero's image collage (`.home-hero-visual` in `index.html` / `css/storefront/pages/home.css`) — one tall image plus two stacked smaller ones. Each gets a brightness/saturation filter and a dark overlay in CSS so mismatched source photos (different lighting, one with a white background) read as one consistent, dark-toned set instead of three unrelated stock photos.

Current images: `gaming-pc.jpg`, `phone-repair.jpg`, `afri.jpg`. These are decorative in the hero (`alt=""`, the wrapper is `aria-hidden`) since they don't convey information beyond the text already in the hero — keep that pattern for replacements. Use meaningful alt text only if an image is ever used somewhere it isn't purely decorative.
