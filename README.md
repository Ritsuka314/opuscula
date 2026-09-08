# 萬象 (Opuscula)

A journal of myriad phenomena by Hoshikawa Miyu, published at
[opuscula.ritsuka.moe](https://opuscula.ritsuka.moe/).

This repository contains the complete standalone 萬象 site: sources,
compiled documents, publication notes, and web pages. Each writing occupies
one directory, while the repository root supplies the collection catalogue
and shared site assets.

The catalogue and publication pages come from shared
[Eta](https://eta.js.org/) templates. A writing has one record in
[`src/data/writings.json`](src/data/writings.json); that record produces both
its catalogue entry and its publication page, so their structure stays
consistent as the collection grows.

## Building

The site generator requires Node.js 20 or later. Install its pinned dependencies
once:

```sh
npm ci
```

Then build every document and regenerate every web page:

```sh
make
```

Useful narrower commands are:

```sh
npm run build                         # regenerate web pages only
npm run check                         # fail if generated pages are stale
make -C euler-derangement-cloze       # build one writing
make -C euler-derangement-cloze clean # clean one writing
```

The root Makefile automatically discovers writing directories that contain a
Makefile. Individual documents use `latexmk -xelatex`; see each writing's
README for its exact commands and prerequisites.

## Adding a writing

1. Create a URL-safe directory for the writing. PDF documents need a Makefile;
   web essays use Markdown sources and do not need LaTeX.
2. Add one record, in numerical order, to
   [`src/data/writings.json`](src/data/writings.json). Its `slug` must match
   the directory name.
3. Run `make` for documents or `npm run build` for web essays. The generator
   checks referenced sources and documents, then regenerates the root catalogue
   and every publication page.
4. Review and commit the source, documents, and generated HTML together.

Edit [`src/data/site.json`](src/data/site.json) for collection-wide prose,
and edit the files under [`src/templates`](src/templates/) for shared
structure. The root `index.html` and each writing's `index.html` are generated
files and should not be edited directly.

GitHub Pages serves the committed output without a server-side build. The
`.nojekyll` and `CNAME` files select static publishing and the
`opuscula.ritsuka.moe` custom domain.

## Bilingual web essays

A writing with an `article.languages` array renders both Markdown sources into
one page through `src/templates/article.eta`. Each language record supplies
`lang`, `label`, and `source`; PDF-only edition and editorial fields are not
needed. See [name-phonology/README.md](name-phonology/README.md) for the section
markers that keep translations aligned.

Readers can show both languages or either language alone. Links such as
`name-phonology/?lang=en#tones` and `name-phonology/?lang=zh-Hant#tones` preserve
the reading choice and section. The page includes both languages in static
HTML, so JavaScript is optional. Layout and print styles live in
`assets/article.css`; `assets/article.js` only controls language visibility.
