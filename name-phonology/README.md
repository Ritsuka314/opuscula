# One Name, Two Sound Systems

A standalone essay on the phonology of personal names in Standard Mandarin and Japanese, illustrated
with characters from A Certain Scientific Railgun, Touhou Project, and Piapro.

The English and Traditional Chinese texts are kept in `article-en.md` and
`article-zh.md`. Both render into one publication page, `index.html`, with
parallel sections and optional English-only or Chinese-only reading. On narrow
screens, each English section is followed by its Chinese counterpart. All text
remains readable without JavaScript. Browser printing uses a dedicated print
stylesheet and respects the selected reading language.

From the Opuscula root:

```sh
npm run build
npm run check
```

Each second-level Markdown heading starts a section. Precede it with a stable
marker such as `<!-- section: readings -->`. The two sources must have the same
section IDs in the same order; the build rejects missing, duplicated, or
misaligned sections. Third-level headings belong within a section. Ordinary
Markdown links and tables work, and inline HTML supplies ruby readings and
language tags.

Wrap pinyin in `<span lang="zh-Latn-pinyin">Yùbǎn Měiqín</span>`, including
isolated syllables and initials/finals. The article stylesheet gives it upright
Source Sans 3, whose bundled font covers all tone-marked vowels, so Latin letters
and tone marks stay consistent inside both English and Chinese prose.

The character pages establish Japanese readings and relevant Chinese written
forms. The essay supplies the Mandarin pinyin, mora counts, ending patterns,
and comparisons. Linked phonological sources support the framework; subjective
listening impressions are identified in the text.
