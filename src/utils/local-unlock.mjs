export async function hashPassword(password) {
	const bytes = new TextEncoder().encode(password);
	const digest = await crypto.subtle.digest("SHA-256", bytes);

	return [...new Uint8Array(digest)]
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

export async function verifyPassword(password, expectedHash) {
	return (await hashPassword(password)) === expectedHash;
}
