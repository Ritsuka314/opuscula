# Web fonts

The 萬象 site self-hosts its Latin web font; no external font service is contacted
at page load.

- `source-sans-3-variable.woff2` is the upright variable TrueType webfont from
  [Source Sans 3.052](https://github.com/adobe-fonts/source-sans/releases/tag/3.052R).
  It is used for headings, navigation, metadata, action links, and body copy. See
  [`licenses/Source-Sans-3-OFL.md`](licenses/Source-Sans-3-OFL.md).
- `lxgw-wenkai-tc-title.woff2` is a title-only subset of
  [LXGW WenKai TC 1.522](https://github.com/lxgw/LxgwWenkaiTC/releases/tag/v1.522).
  It contains the characters used by the 萬象 masthead, its guiding lines,
  and the name 星川未有. It preserves the layout features needed for the
  vertical title slip and hero typography. See
  [`licenses/LXGW-WenKai-TC-OFL.txt`](licenses/LXGW-WenKai-TC-OFL.txt).

Chinese text uses local sans-serif fonts for reading and a local Kai/serif
stack after the bundled title subset. The reading fonts are intentionally not
bundled, avoiding a multi-megabyte CJK download and any per-article font
subsetting step.

The title subset was produced from `LXGWWenKaiTC-Regular.ttf` with:

```sh
pyftsubset LXGWWenKaiTC-Regular.ttf \
  --text='萬象星川未有大處觀，微見一位少女的測志。' \
  --output-file=lxgw-wenkai-tc-title.woff2 \
  --flavor=woff2 \
  --layout-features='*' \
  --name-IDs='*' \
  --name-legacy \
  --name-languages='*' \
  --notdef-glyph \
  --notdef-outline \
  --recommended-glyphs
```
