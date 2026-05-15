const PINYIN_BY_CHAR = new Map([
	["五", "wu"],
	["一", "yi"],
	["之", "zhi"],
	["后", "hou"],
]);

export function createPostFromEditorSubmission(input, now = new Date()) {
	const title = input.title.trim();
	const category = input.contentType.trim();
	const body = input.body.trim();

	if (!title) {
		throw new Error("Title is required");
	}

	if (!category) {
		throw new Error("Category is required");
	}

	if (!body) {
		throw new Error("Body is required");
	}

	if (!["draft", "publish"].includes(input.publishMode)) {
		throw new Error(`Unsupported publish mode: ${input.publishMode}`);
	}

	const date = formatDate(now);
	const slug = createSlug(title);
	const draft = input.publishMode === "draft";

	return {
		filePath: `src/content/posts/${date}-${slug}.md`,
		markdown: `---
title: ${title}
published: ${date}
description: '${escapeYamlSingleQuoted(input.description)}'
image: ''
tags: [${input.tags.join(", ")}]
category: '${escapeYamlSingleQuoted(category)}'
draft: ${draft}
lang: ''
---
${body}
`,
	};
}

function formatDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function createSlug(title) {
	return title
		.trim()
		.split("")
		.map((character) => PINYIN_BY_CHAR.get(character) ?? character)
		.join("-")
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function escapeYamlSingleQuoted(value) {
	return value.replace(/'/g, "''");
}
