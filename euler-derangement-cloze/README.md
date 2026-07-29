# Fixed points of a random permutation

This directory contains three LaTeX editions of the mathematical note shown
in the Bilibili video
[【日常研究】摆烂小能手掀起的数学问题](https://www.bilibili.com/video/BV1Fh411N71S)
(`BV1Fh411N71S`). The work is an unofficial reproduction prepared solely for
entertainment and educational purposes.

Publication page:
[opuscula.ritsuka.moe/euler-derangement-cloze](https://opuscula.ritsuka.moe/euler-derangement-cloze/)

Sources in the Opuscula repository:
[github.com/Ritsuka314/opuscula/tree/main/euler-derangement-cloze](https://github.com/Ritsuka314/opuscula/tree/main/euler-derangement-cloze)

## Editions

| Edition | Source | Compiled PDF | Description |
|---|---|---|---|
| Reproduced English | [`paper-en.tex`](paper-en.tex) | [`paper-en.pdf`](paper-en.pdf) | Close reproduction of the four visible pages; preserves the original wording, omissions, notation, and induction calculation. |
| Revised English | [`paper-en-revised.tex`](paper-en-revised.tex) | [`paper-en-revised.pdf`](paper-en-revised.pdf) | Corrected, self-contained report with a complete inclusion--exclusion argument and a direct indicator-variable proof of the expectation. |
| Revised Chinese | [`paper-zh.tex`](paper-zh.tex) | [`paper-zh.pdf`](paper-zh.pdf) | Polished Chinese counterpart to the revised English report, with the same definitions, results, and proofs. |

[`cover-page.tex`](cover-page.tex) supplies the English provenance and edition
notice; [`cover-page-zh.tex`](cover-page-zh.tex) supplies its localized Chinese
counterpart. One of these covers is prepended to every PDF. The local MP4 was
used as the transcription source but is intentionally excluded from version
control.

## Building

All editions require XeLaTeX, `latexmk`, and the Noto CJK fonts:

```sh
latexmk -xelatex -interaction=nonstopmode -halt-on-error paper-en.tex
latexmk -xelatex -interaction=nonstopmode -halt-on-error paper-en-revised.tex
latexmk -xelatex -interaction=nonstopmode -halt-on-error paper-zh.tex
```

If GNU Make is installed, build all three with:

```sh
make
```

Remove auxiliary files while retaining the PDFs with:

```sh
latexmk -c paper-en.tex
latexmk -c paper-en-revised.tex
latexmk -c paper-zh.tex
```
