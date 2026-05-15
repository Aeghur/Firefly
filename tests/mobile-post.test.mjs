import assert from "node:assert/strict";
import test from "node:test";

import { createPostFromEditorSubmission } from "../src/utils/mobile-post.mjs";

test("creates a Firefly post from a mobile editor submission", () => {
	const result = createPostFromEditorSubmission(
		{
			title: "五一之后",
			contentType: "随笔",
			description: "一篇随笔",
			tags: ["生活"],
			body: "今天想写点东西。",
			publishMode: "publish",
		},
		new Date("2026-05-15T00:00:00+08:00"),
	);

	assert.equal(result.filePath, "src/content/posts/2026-05-15-wu-yi-zhi-hou.md");
	assert.equal(
		result.markdown,
		`---
title: 五一之后
published: 2026-05-15
description: '一篇随笔'
image: ''
tags: [生活]
category: '随笔'
draft: false
lang: ''
---
今天想写点东西。
`,
	);
});

test("accepts any non-empty category from the mobile editor", () => {
	const result = createPostFromEditorSubmission(
		{
			title: "五一之后",
			contentType: "AI",
			description: "一篇随笔",
			tags: ["生活"],
			body: "今天想写点东西。",
			publishMode: "publish",
		},
		new Date("2026-05-15T00:00:00+08:00"),
	);

	assert.match(result.markdown, /category: 'AI'/);
});

test("rejects editor submissions that cannot become publishable posts", () => {
	assert.throws(
		() =>
			createPostFromEditorSubmission(
				{
					title: "",
					contentType: "随笔",
					description: "一篇随笔",
					tags: ["生活"],
					body: "今天想写点东西。",
					publishMode: "publish",
				},
				new Date("2026-05-15T00:00:00+08:00"),
			),
		/Title is required/,
	);

	assert.throws(
		() =>
			createPostFromEditorSubmission(
				{
					title: "五一之后",
					contentType: "",
					description: "一篇随笔",
					tags: ["生活"],
					body: "今天想写点东西。",
					publishMode: "publish",
				},
				new Date("2026-05-15T00:00:00+08:00"),
			),
		/Category is required/,
	);

	assert.throws(
		() =>
			createPostFromEditorSubmission(
				{
					title: "五一之后",
					contentType: "随笔",
					description: "一篇随笔",
					tags: ["生活"],
					body: "",
					publishMode: "publish",
				},
				new Date("2026-05-15T00:00:00+08:00"),
			),
		/Body is required/,
	);
});
