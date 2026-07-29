# Opuscula

Recreational and semi-formal writings by K. Ritsuka, published at
[opuscula.ritsuka.moe](https://opuscula.ritsuka.moe/).

This directory contains the standalone Opuscula site within the
[personal-website repository](https://github.com/Ritsuka314/personal-website).
Each writing occupies one directory containing its source, compiled documents,
publication notes, and web landing page. The directory root supplies the
collection catalogue and shared site assets.

## Writings

| No. | Writing | Page | Contents |
|---:|---|---|---|
| 001 | [Fixed Points of a Random Permutation](euler-derangement-cloze/) | [Publication page](https://opuscula.ritsuka.moe/euler-derangement-cloze/) | Reproduced English, revised English, and revised Chinese editions |

## Building

If GNU Make is available, build every document in the collection with:

```sh
make
```

To build or clean one writing independently:

```sh
make -C euler-derangement-cloze
make -C euler-derangement-cloze clean
```

GNU Make is only a convenience wrapper. The three documents can also be built
by running `latexmk -xelatex` on their `.tex` files from within the writing
directory; see its [README](euler-derangement-cloze/README.md) for the exact
commands.

The website is plain HTML and CSS and requires no build step. A GitHub Actions
workflow publishes this directory as the Pages artifact for
`opuscula.ritsuka.moe`.
