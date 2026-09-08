import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { Eta } from "eta";
import { renderArticle } from "./render-article.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDirectory, "..");
const dataDirectory = path.join(siteRoot, "src", "data");
const templateDirectory = path.join(siteRoot, "src", "templates");
const checkOnly = process.argv.includes("--check");
const unsupportedArguments = process.argv.slice(2).filter((argument) => argument !== "--check");

if (unsupportedArguments.length > 0) {
  throw new Error(`Unsupported argument${unsupportedArguments.length === 1 ? "" : "s"}: ${unsupportedArguments.join(", ")}`);
}

const eta = new Eta({
  views: templateDirectory,
  autoEscape: true,
  autoTrim: false,
  cache: false,
  debug: true
});

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertString(value, field) {
  assert(typeof value === "string" && value.length > 0, `${field} must be a non-empty string`);
}

function assertObject(value, field) {
  assert(
    value !== null && typeof value === "object" && !Array.isArray(value),
    `${field} must be an object`
  );
}

async function readJson(filename) {
  const source = await readFile(path.join(dataDirectory, filename), "utf8");
  return JSON.parse(source);
}

async function pathExists(filename) {
  try {
    await stat(filename);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function assertLocalFilename(filename, field) {
  assertString(filename, field);
  assert(!path.isAbsolute(filename), `${field} must be relative`);
  assert(!filename.split(/[\\/]/).includes(".."), `${field} must not leave its writing directory`);
}

async function validateData(site, writings) {
  assertObject(site, "site");
  for (const field of ["name", "nameCjk", "owner", "ownerCjk", "description", "baseUrl", "repositoryUrl", "repositoryBranch", "themeColor", "footerLabel"]) {
    assertString(site[field], `site.${field}`);
  }
  assertObject(site.hero, "site.hero");
  for (const field of ["eyebrow", "titleLead", "titleEmphasis", "introduction", "browseLabel"]) {
    assertString(site.hero[field], `site.hero.${field}`);
  }
  assertObject(site.catalogue, "site.catalogue");
  for (const field of ["eyebrow", "title", "description"]) {
    assertString(site.catalogue[field], `site.catalogue.${field}`);
  }
  assertObject(site.about, "site.about");
  for (const field of ["eyebrow", "title"]) {
    assertString(site.about[field], `site.about.${field}`);
  }
  assert(Array.isArray(site.about.paragraphs) && site.about.paragraphs.length > 0, "site.about.paragraphs must not be empty");
  for (const [index, paragraph] of site.about.paragraphs.entries()) {
    assertString(paragraph, `site.about.paragraphs[${index}]`);
  }

  assert(Array.isArray(writings) && writings.length > 0, "writings.json must contain at least one writing");

  const numbers = new Set();
  const slugs = new Set();

  for (const writing of writings) {
    assertObject(writing, "writing");
    for (const field of ["number", "slug", "category", "kind", "lang", "title", "summary", "metaDescription", "deck"]) {
      assertString(writing[field], `${writing.slug ?? "writing"}.${field}`);
    }

    assert(/^\d{3}$/.test(writing.number), `${writing.slug}.number must contain three digits`);
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(writing.slug), `${writing.slug}.slug is not URL-safe`);
    assert(!numbers.has(writing.number), `duplicate writing number: ${writing.number}`);
    assert(!slugs.has(writing.slug), `duplicate writing slug: ${writing.slug}`);
    numbers.add(writing.number);
    slugs.add(writing.slug);

    if (writing.subtitle !== undefined) {
      assertObject(writing.subtitle, `${writing.slug}.subtitle`);
      assertString(writing.subtitle.text, `${writing.slug}.subtitle.text`);
      if (writing.subtitle.lang !== undefined) {
        assertString(writing.subtitle.lang, `${writing.slug}.subtitle.lang`);
      }
    }

    if (writing.motif !== undefined) {
      assertObject(writing.motif, `${writing.slug}.motif`);
      for (const field of ["left", "arrow", "right"]) {
        assertString(writing.motif[field], `${writing.slug}.motif.${field}`);
      }
    }

    const writingDirectory = path.join(siteRoot, writing.slug);
    assert(await pathExists(writingDirectory), `missing writing directory: ${writing.slug}`);

    assert(Array.isArray(writing.cardActions) && writing.cardActions.length > 0, `${writing.slug}.cardActions must not be empty`);
    for (const [index, action] of writing.cardActions.entries()) {
      assertString(action.label, `${writing.slug}.cardActions[${index}].label`);
      assert(["primary", "secondary"].includes(action.kind), `${writing.slug}.cardActions[${index}].kind is invalid`);
      assert(typeof action.href === "string", `${writing.slug}.cardActions[${index}].href must be a string`);
      if (action.lang !== undefined) {
        assertString(action.lang, `${writing.slug}.cardActions[${index}].lang`);
      }
      if (action.href !== "") {
        assertLocalFilename(action.href, `${writing.slug}.cardActions[${index}].href`);
        assert(await pathExists(path.join(writingDirectory, action.href)), `missing catalogue action target: ${writing.slug}/${action.href}`);
      }
    }

    assert(Array.isArray(writing.publicationActions) && writing.publicationActions.length > 0, `${writing.slug}.publicationActions must not be empty`);
    for (const [index, action] of writing.publicationActions.entries()) {
      assertString(action.label, `${writing.slug}.publicationActions[${index}].label`);
      assert(["primary", "secondary"].includes(action.kind), `${writing.slug}.publicationActions[${index}].kind is invalid`);
      assertLocalFilename(action.href, `${writing.slug}.publicationActions[${index}].href`);
      if (action.lang !== undefined) {
        assertString(action.lang, `${writing.slug}.publicationActions[${index}].lang`);
      }
      assert(await pathExists(path.join(writingDirectory, action.href)), `missing publication action target: ${writing.slug}/${action.href}`);
    }

    assert(Array.isArray(writing.facts) && writing.facts.length > 0, `${writing.slug}.facts must not be empty`);
    for (const [index, fact] of writing.facts.entries()) {
      assertString(fact.label, `${writing.slug}.facts[${index}].label`);
      assertString(fact.value, `${writing.slug}.facts[${index}].value`);
    }

    if (writing.article !== undefined) {
      assertObject(writing.article, `${writing.slug}.article`);
      const languages = writing.article.languages;
      assert(Array.isArray(languages) && languages.length === 2, `${writing.slug}.article.languages must contain two languages`);
      const languageCodes = new Set();
      for (const [index, language] of languages.entries()) {
        for (const field of ["lang", "label", "source"]) {
          assertString(language[field], `${writing.slug}.article.languages[${index}].${field}`);
        }
        assert(/^[a-z]{2}(?:-[A-Za-z]{2,8})*$/.test(language.lang), `${writing.slug}: invalid article language`);
        assert(!languageCodes.has(language.lang), `${writing.slug}: duplicate article language`);
        languageCodes.add(language.lang);
        assertLocalFilename(language.source, `${writing.slug}.article.languages[${index}].source`);
        assert(language.source.endsWith(".md"), `${writing.slug}: article sources must be Markdown`);
        assert(await pathExists(path.join(writingDirectory, language.source)), `missing article source: ${writing.slug}/${language.source}`);
      }
      assert(languageCodes.has(writing.lang), `${writing.slug}: page language must have an article source`);
      continue;
    }

    for (const field of ["editionsTitle", "editionsIntroduction"]) {
      assertString(writing[field], `${writing.slug}.${field}`);
    }
    assert(Array.isArray(writing.editions) && writing.editions.length > 0, `${writing.slug}.editions must not be empty`);
    for (const [index, edition] of writing.editions.entries()) {
      for (const field of ["number", "language", "title", "description", "pdf", "source"]) {
        assertString(edition[field], `${writing.slug}.editions[${index}].${field}`);
      }
      assertLocalFilename(edition.pdf, `${writing.slug}.editions[${index}].pdf`);
      assertLocalFilename(edition.source, `${writing.slug}.editions[${index}].source`);
      if (edition.lang !== undefined) {
        assertString(edition.lang, `${writing.slug}.editions[${index}].lang`);
      }
      assert(await pathExists(path.join(writingDirectory, edition.pdf)), `missing edition PDF: ${writing.slug}/${edition.pdf}`);
      assert(await pathExists(path.join(writingDirectory, edition.source)), `missing edition source: ${writing.slug}/${edition.source}`);
    }

    assertObject(writing.editorial, `${writing.slug}.editorial`);
    for (const field of ["eyebrow", "title", "introduction"]) {
      assertString(writing.editorial[field], `${writing.slug}.editorial.${field}`);
    }
    assertObject(writing.editorial.purpose, `${writing.slug}.editorial.purpose`);
    for (const field of ["before", "emphasis", "after"]) {
      assertString(writing.editorial.purpose[field], `${writing.slug}.editorial.purpose.${field}`);
    }
    assertObject(writing.editorial.source, `${writing.slug}.editorial.source`);
    for (const field of ["title", "url", "linkLabel"]) {
      assertString(writing.editorial.source[field], `${writing.slug}.editorial.source.${field}`);
    }
    if (writing.editorial.source.lang !== undefined) {
      assertString(writing.editorial.source.lang, `${writing.slug}.editorial.source.lang`);
    }
  }

  const writingNumbers = writings.map((writing) => writing.number);
  const sortedWritingNumbers = [...writingNumbers].sort();
  assert(
    writingNumbers.every((number, index) => number === sortedWritingNumbers[index]),
    "writings.json records must be ordered by number"
  );

  const rootEntries = await readdir(siteRoot, { withFileTypes: true });
  const buildableDirectories = [];
  for (const entry of rootEntries) {
    if (entry.isDirectory() && await pathExists(path.join(siteRoot, entry.name, "Makefile"))) {
      buildableDirectories.push(entry.name);
    }
  }

  for (const directory of buildableDirectories) {
    assert(slugs.has(directory), `writing directory ${directory} has a Makefile but no data record`);
  }
}

function pageForCatalogue(site) {
  return {
    lang: "en",
    title: `${site.name} — ${site.owner}`,
    description: site.description,
    canonical: `${site.baseUrl}/`,
    stylesheet: "assets/site.css",
    homeHref: "/",
    navigation: [
      { href: "#writings", label: "Writings" },
      { href: "#about", label: "About" },
      { href: site.repositoryUrl, label: "Source" }
    ],
    footer: {
      left: { href: null, label: site.footerLabel, lang: "zh-Hant" },
      right: { href: site.repositoryUrl, label: "View the sources" }
    }
  };
}

function pageForWriting(site, writing) {
  const sourceUrl = `${site.repositoryUrl}/tree/${site.repositoryBranch}/${writing.slug}`;
  return {
    lang: writing.lang,
    title: `${writing.title} — ${site.name}`,
    description: writing.metaDescription,
    canonical: `${site.baseUrl}/${writing.slug}/`,
    stylesheet: "../assets/site.css",
    extraStylesheets: writing.article ? ["../assets/article.css"] : [],
    scripts: writing.article ? ["../assets/article.js"] : [],
    homeHref: "../",
    navigation: [
      { href: "../#writings", label: "Writings" },
      { href: writing.article ? "#contents" : "#editions", label: writing.article ? "Contents" : "Editions" },
      { href: sourceUrl, label: "Source" }
    ],
    footer: {
      left: { href: "../", label: "← All writings" },
      right: { href: sourceUrl, label: "Sources on GitHub" }
    }
  };
}

async function renderOutput(template, destination, context) {
  const rendered = eta.render(`./${template}`, context);
  assert(typeof rendered === "string", `template ${template} did not return text`);

  const normalized = `${rendered.replace(/\r\n/g, "\n").trimEnd()}\n`;
  assert(normalized.startsWith("<!doctype html>"), `${template} did not render a complete HTML document`);
  assert(!normalized.includes("<%"), `${template} left an unrendered Eta tag`);

  let existing = null;
  try {
    existing = await readFile(destination, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const relativeDestination = path.relative(siteRoot, destination);
  if (existing === normalized) {
    console.log(`unchanged ${relativeDestination}`);
    return true;
  }

  if (checkOnly) {
    console.error(`stale ${relativeDestination}`);
    return false;
  }

  await writeFile(destination, normalized, "utf8");
  console.log(`generated ${relativeDestination}`);
  return true;
}

async function validateLocalLinks(htmlFiles) {
  let checkedLinks = 0;

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    const references = html.matchAll(/\b(?:href|src)="([^"]+)"/g);

    for (const match of references) {
      const reference = match[1];
      if (
        reference.startsWith("#") ||
        reference.startsWith("//") ||
        /^[a-z][a-z\d+.-]*:/i.test(reference)
      ) {
        continue;
      }

      const encodedPath = reference.split(/[?#]/, 1)[0];
      if (encodedPath === "") {
        continue;
      }

      let decodedPath;
      try {
        decodedPath = decodeURIComponent(encodedPath);
      } catch {
        throw new Error(`${path.relative(siteRoot, htmlFile)} contains an invalid URL path: ${reference}`);
      }

      let target = decodedPath.startsWith("/")
        ? path.resolve(siteRoot, `.${decodedPath}`)
        : path.resolve(path.dirname(htmlFile), decodedPath);
      const relativeTarget = path.relative(siteRoot, target);
      assert(
        relativeTarget === "" || (!relativeTarget.startsWith("..") && !path.isAbsolute(relativeTarget)),
        `${path.relative(siteRoot, htmlFile)} links outside the site: ${reference}`
      );

      try {
        const targetStat = await stat(target);
        if (targetStat.isDirectory()) {
          target = path.join(target, "index.html");
        }
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }

      assert(
        await pathExists(target),
        `${path.relative(siteRoot, htmlFile)} has a broken local link: ${reference}`
      );
      checkedLinks += 1;
    }
  }

  console.log(`validated ${checkedLinks} local links across ${htmlFiles.length} pages`);
}

const site = await readJson("site.json");
const writings = await readJson("writings.json");
await validateData(site, writings);

const outputFiles = [
  path.join(siteRoot, "index.html"),
  ...writings.map((writing) => path.join(siteRoot, writing.slug, "index.html"))
];
const results = [];
results.push(await renderOutput(
  "catalogue",
  outputFiles[0],
  { site, writings, page: pageForCatalogue(site) }
));

for (const [index, writing] of writings.entries()) {
  const article = writing.article
    ? await renderArticle(path.join(siteRoot, writing.slug), writing.article.languages)
    : null;
  results.push(await renderOutput(
    article ? "article" : "writing",
    outputFiles[index + 1],
    { site, writing, article, page: pageForWriting(site, writing) }
  ));
}

await validateLocalLinks(outputFiles);

if (checkOnly && results.some((result) => !result)) {
  process.exitCode = 1;
}
