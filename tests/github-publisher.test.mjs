import assert from "node:assert/strict";
import test from "node:test";

import { createGitHubFileCommitRequest } from "../src/utils/github-publisher.mjs";

test("creates a GitHub file commit request for a generated post", () => {
	const request = createGitHubFileCommitRequest({
		owner: "Aeghur",
		repo: "Firefly",
		branch: "master",
		filePath: "src/content/posts/2026-05-15-ai.md",
		markdown: "---\ntitle: AI\n---\n今天想写点东西。\n",
	});

	assert.equal(
		request.url,
		"https://api.github.com/repos/Aeghur/Firefly/contents/src%2Fcontent%2Fposts%2F2026-05-15-ai.md",
	);
	assert.equal(request.method, "PUT");
	assert.equal(request.body.branch, "master");
	assert.equal(
		request.body.message,
		"publish post: src/content/posts/2026-05-15-ai.md",
	);
	assert.equal(
		Buffer.from(request.body.content, "base64").toString("utf8"),
		"---\ntitle: AI\n---\n今天想写点东西。\n",
	);
});
