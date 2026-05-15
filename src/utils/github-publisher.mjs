export function createGitHubFileCommitRequest({
	owner,
	repo,
	branch,
	filePath,
	markdown,
}) {
	return {
		url: `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`,
		method: "PUT",
		body: {
			message: `publish post: ${filePath}`,
			content: encodeBase64(markdown),
			branch,
		},
	};
}

export async function publishPostToGitHub({
	token,
	owner,
	repo,
	branch,
	filePath,
	markdown,
}) {
	const request = createGitHubFileCommitRequest({
		owner,
		repo,
		branch,
		filePath,
		markdown,
	});

	const response = await fetch(request.url, {
		method: request.method,
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
			"X-GitHub-Api-Version": "2022-11-28",
		},
		body: JSON.stringify(request.body),
	});

	if (!response.ok) {
		const details = await response.text();
		throw new Error(`GitHub publish failed: ${response.status} ${details}`);
	}

	return response.json();
}

function encodeBase64(value) {
	if (typeof Buffer !== "undefined") {
		return Buffer.from(value, "utf8").toString("base64");
	}

	const bytes = new TextEncoder().encode(value);
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary);
}
