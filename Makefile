.PHONY: all clean

WRITINGS = euler-derangement-cloze

all:
	@for writing in $(WRITINGS); do $(MAKE) -C $$writing all || exit; done

clean:
	@for writing in $(WRITINGS); do $(MAKE) -C $$writing clean || exit; done
