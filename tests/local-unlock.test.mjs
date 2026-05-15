import assert from "node:assert/strict";
import test from "node:test";

import { hashPassword, verifyPassword } from "../src/utils/local-unlock.mjs";

test("verifies a local unlock password without storing the plain text", async () => {
	const hash = await hashPassword("correct horse battery staple");

	assert.notEqual(hash, "correct horse battery staple");
	assert.equal(await verifyPassword("correct horse battery staple", hash), true);
	assert.equal(await verifyPassword("wrong password", hash), false);
});
