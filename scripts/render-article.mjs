import { readFile } from "node:fs/promises";
import path from "node:path";
import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({ html: true, typographer: true });
markdown.renderer.rules.table_open = (_tokens, _index, _options, environment) =>
  `<div class="article-table" role="region" tabindex="0" aria-label="${environment.tableLabel}"><table>\n`;
markdown.renderer.rules.table_close = () => "</table></div>\n";

function sectionsFromMarkdown(source, filename, lang) {
  const environment = { tableLabel: lang.startsWith("zh") ? "對照表" : "Comparison table" };
  // Parse the complete document first so reference links remain available in every section.
  const tokens = markdown.parse(source, environment);
  const sections = [];
  const ids = new Set();
  let current;

  for (const token of tokens) {
    const marker = token.type === "html_block"
      ? token.content.trim().match(/^<!-- section: ([a-z0-9]+(?:-[a-z0-9]+)*) -->$/)
      : null;
    if (marker) {
      if (ids.has(marker[1])) throw new Error(`${filename}: duplicate section ${marker[1]}`);
      ids.add(marker[1]);
      current = { id: marker[1], tokens: [] };
      sections.push(current);
    } else {
      if (!current) throw new Error(`${filename}: content must start with a section marker`);
      current.tokens.push(token);
    }
  }

  if (!sections.length) throw new Error(`${filename}: article must have at least one section`);
  return sections.map(({ id, tokens: sectionTokens }) => {
    if (sectionTokens[0]?.type !== "heading_open" || sectionTokens[0].tag !== "h2" ||
        sectionTokens[1]?.type !== "inline" || sectionTokens[2]?.type !== "heading_close") {
      throw new Error(`${filename}: section ${id} must start with a level-two heading`);
    }
    if (sectionTokens.slice(3).some((token) => token.type === "heading_open" && ["h1", "h2"].includes(token.tag))) {
      throw new Error(`${filename}: add a section marker before each level-two heading; use level three for subsections`);
    }
    return {
      id,
      title: sectionTokens[1].content,
      html: markdown.renderer.render(sectionTokens.slice(3), markdown.options, environment)
    };
  });
}

export async function renderArticle(directory, editions) {
  const languages = await Promise.all(editions.map(async (edition) => ({
    ...edition,
    sections: sectionsFromMarkdown(
      await readFile(path.join(directory, edition.source), "utf8"), edition.source, edition.lang
    )
  })));
  const expectedIds = languages[0].sections.map(({ id }) => id);
  for (const language of languages.slice(1)) {
    if (language.sections.map(({ id }) => id).join("|") !== expectedIds.join("|")) {
      throw new Error(`${language.source}: translated sections must have the same IDs in the same order`);
    }
  }
  return {
    languages,
    sections: expectedIds.map((id, index) => ({
      id,
      translations: languages.map(({ lang, label, sections }) => ({ lang, label, ...sections[index] }))
    }))
  };
}
