import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { renderArticle } from "./render-article.mjs";

const languages = [
  { lang: "en", label: "English", source: "en.md" },
  { lang: "zh-Hant", label: "中文", source: "zh.md" }
];

async function fixture(t, en, zh) {
  const directory = await mkdtemp(path.join(tmpdir(), "opuscula-article-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await Promise.all([
    writeFile(path.join(directory, "en.md"), en),
    writeFile(path.join(directory, "zh.md"), zh)
  ]);
  return directory;
}

test("pairs section IDs while retaining document-wide references and ruby markup", async (t) => {
  const en = `<!-- section: sound -->
## Sound
<ruby lang="ja">琴<rt>こと</rt></ruby> [Source][ref].

<!-- section: rhythm -->
## Rhythm
| Reading | Count |
| --- | --- |
| Rin | 2 |

[Source again][ref].

[ref]: https://example.org/phonology
`;
  const zh = en.replace("## Sound", "## 聲音").replace("## Rhythm", "## 節奏");
  const article = await renderArticle(await fixture(t, en, zh), languages);
  assert.deepEqual(article.sections.map(({ id }) => id), ["sound", "rhythm"]);
  assert.equal(article.sections[0].translations[1].title, "聲音");
  assert.match(article.sections[0].translations[0].html, /<ruby lang="ja">/);
  for (const section of article.sections) {
    for (const translation of section.translations) {
      assert.match(translation.html, /href="https:\/\/example.org\/phonology"/);
    }
  }
  assert.match(article.sections[1].translations[1].html, /tabindex="0" aria-label="對照表"/);
});

test("rejects missing or reordered translated sections", async (t) => {
  const en = "<!-- section: sound -->\n## Sound\nText.\n<!-- section: rhythm -->\n## Rhythm\nText.";
  for (const zh of [
    "<!-- section: sound -->\n## 聲音\n文字。",
    "<!-- section: rhythm -->\n## 節奏\n文字。\n<!-- section: sound -->\n## 聲音\n文字。"
  ]) {
    await assert.rejects(renderArticle(await fixture(t, en, zh), languages), /same IDs in the same order/);
  }
});

test("rejects duplicated IDs and headings outside the section structure", async (t) => {
  const valid = "<!-- section: sound -->\n## Sound\nText.";
  for (const [invalid, error] of [
    [`${valid}\n${valid}`, /duplicate section/],
    ["## Sound\nText.", /start with a section marker/],
    ["<!-- section: sound -->\nText.", /level-two heading/],
    [`${valid}\n## Another section\nText.`, /add a section marker/]
  ]) {
    await assert.rejects(renderArticle(await fixture(t, invalid, valid), languages), error);
  }
});
