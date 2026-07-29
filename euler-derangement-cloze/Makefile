.PHONY: all clean

LATEXMK = latexmk
LATEXMK_FLAGS = -xelatex -interaction=nonstopmode -halt-on-error

all: paper-en.pdf paper-en-revised.pdf paper-zh.pdf

paper-en.pdf: paper-en.tex cover-page.tex
	$(LATEXMK) $(LATEXMK_FLAGS) paper-en.tex

paper-en-revised.pdf: paper-en-revised.tex cover-page.tex
	$(LATEXMK) $(LATEXMK_FLAGS) paper-en-revised.tex

paper-zh.pdf: paper-zh.tex cover-page-zh.tex
	$(LATEXMK) $(LATEXMK_FLAGS) paper-zh.tex

clean:
	$(LATEXMK) -c paper-en.tex
	$(LATEXMK) -c paper-en-revised.tex
	$(LATEXMK) -c paper-zh.tex
