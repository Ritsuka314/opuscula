.PHONY: all check clean papers site

WRITINGS := $(patsubst %/Makefile,%,$(wildcard */Makefile))

all: papers site

papers:
	@for writing in $(WRITINGS); do $(MAKE) -C $$writing all || exit; done

site:
	npm run build

check:
	npm run check

clean:
	@for writing in $(WRITINGS); do $(MAKE) -C $$writing clean || exit; done
