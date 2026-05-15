<script>
	import { onMount } from "svelte";
	import { createPostFromEditorSubmission } from "@/utils/mobile-post.mjs";
	import { publishPostToGitHub } from "@/utils/github-publisher.mjs";
	import { hashPassword, verifyPassword } from "@/utils/local-unlock.mjs";

	let title = "";
	let contentType = "";
	let description = "";
	let tagsText = "";
	let body = "";
	let publishMode = "draft";
	let error = "";
	let token = "";
	let isPublishing = false;
	let publishMessage = "";
	let isUnlocked = false;
	let hasUnlockPassword = false;
	let unlockPassword = "";
	let unlockError = "";
	let isUnlocking = false;

	onMount(() => {
		token = localStorage.getItem("firefly.githubToken") ?? "";
		hasUnlockPassword = Boolean(localStorage.getItem("firefly.unlockHash"));
	});

	$: tags = tagsText
		.split(/[,，\n]/)
		.map((tag) => tag.trim())
		.filter(Boolean);

	$: result = createPreview();

	function createPreview() {
		error = "";

		try {
			return createPostFromEditorSubmission(
				{
					title,
					contentType,
					description,
					tags,
					body,
					publishMode,
				},
				new Date(),
			);
		} catch (previewError) {
			error = previewError instanceof Error ? previewError.message : "无法生成预览";
			return null;
		}
	}

	async function publishCurrentPost() {
		publishMessage = "";

		if (!result) {
			error = "请先补全标题、分类和正文";
			return;
		}

		if (!token.trim()) {
			error = "请先填写 GitHub Token";
			return;
		}

		isPublishing = true;
		error = "";

		try {
			localStorage.setItem("firefly.githubToken", token.trim());
			await publishPostToGitHub({
				token: token.trim(),
				owner: "Aeghur",
				repo: "Firefly",
				branch: "master",
				filePath: result.filePath,
				markdown: result.markdown,
			});
			publishMessage = "已提交到 GitHub，Actions 会开始构建并发布。";
		} catch (publishError) {
			error =
				publishError instanceof Error ? publishError.message : "发布失败，请稍后重试";
		} finally {
			isPublishing = false;
		}
	}

	async function handleUnlock() {
		const password = unlockPassword.trim();
		unlockError = "";

		if (!password) {
			unlockError = "请输入密码";
			return;
		}

		isUnlocking = true;

		try {
			const savedHash = localStorage.getItem("firefly.unlockHash");

			if (!savedHash) {
				localStorage.setItem("firefly.unlockHash", await hashPassword(password));
				hasUnlockPassword = true;
				isUnlocked = true;
				unlockPassword = "";
				return;
			}

			if (!(await verifyPassword(password, savedHash))) {
				unlockError = "密码不正确";
				return;
			}

			isUnlocked = true;
			unlockPassword = "";
		} finally {
			isUnlocking = false;
		}
	}
</script>

<section class="editor-shell" aria-label="手机写博客">
	{#if !isUnlocked}
		<div class="unlock-panel">
			<p class="eyebrow">Writer access</p>
			<h1>{hasUnlockPassword ? "解锁写作后台" : "设置写作密码"}</h1>
			<p>
				{hasUnlockPassword
					? "输入这台设备保存的写作密码。"
					: "第一次使用时设置一个本机密码，之后打开写作页需要先解锁。"}
			</p>
			<input
				bind:value={unlockPassword}
				type="password"
				autocomplete="current-password"
				placeholder="写作密码"
				on:keydown={(event) => event.key === "Enter" && handleUnlock()}
			/>
			<button type="button" disabled={isUnlocking} on:click={handleUnlock}>
				{isUnlocking ? "处理中..." : hasUnlockPassword ? "解锁" : "设置并进入"}
			</button>
			{#if unlockError}
				<p class="error compact">{unlockError}</p>
			{/if}
		</div>
	{:else}
	<header class="editor-header">
		<div>
			<p class="eyebrow">Mobile writer</p>
			<h1>写博客</h1>
		</div>
		<select bind:value={publishMode} aria-label="发布模式">
			<option value="draft">保存草稿</option>
			<option value="publish">发布</option>
		</select>
	</header>

	<div class="editor-grid">
		<form class="editor-form">
			<label>
				<span>标题</span>
				<input bind:value={title} placeholder="今天想写点什么" />
			</label>

			<label>
				<span>分类</span>
				<input
					bind:value={contentType}
					list="category-suggestions"
					placeholder="随笔 / AI / 项目日志 / 想写什么都可以"
				/>
				<datalist id="category-suggestions">
					<option value="随笔"></option>
					<option value="思辨札记"></option>
					<option value="技术笔记"></option>
					<option value="项目日志"></option>
					<option value="阅读/观影笔记"></option>
					<option value="AI"></option>
				</datalist>
			</label>

			<label>
				<span>描述</span>
				<input bind:value={description} placeholder="一句话摘要" />
			</label>

			<label>
				<span>标签</span>
				<input bind:value={tagsText} placeholder="生活, AI, Codex" />
			</label>

			<label class="body-field">
				<span>正文</span>
				<textarea bind:value={body} placeholder="直接写正文，支持 Markdown 语法。"></textarea>
			</label>

			<label>
				<span>GitHub Token</span>
				<input
					bind:value={token}
					type="password"
					autocomplete="off"
					placeholder="只保存在这台设备的浏览器里"
				/>
			</label>

			<button type="button" disabled={isPublishing || !result} on:click={publishCurrentPost}>
				{isPublishing ? "提交中..." : "提交到 GitHub"}
			</button>

			{#if publishMessage}
				<p class="success">{publishMessage}</p>
			{/if}
		</form>

		<aside class="preview-panel" aria-label="生成预览">
			<div class="preview-meta">
				<span>生成预览</span>
				{#if result}
					<code>{result.filePath}</code>
				{/if}
			</div>

			{#if error}
				<p class="error">{error}</p>
			{:else if result}
				<pre>{result.markdown}</pre>
			{/if}
		</aside>
	</div>
	{/if}
</section>

<style>
	.editor-shell {
		width: min(100%, 1120px);
		margin: 0 auto;
		color: var(--primary);
	}

	.editor-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.unlock-panel {
		display: grid;
		gap: 0.85rem;
		width: min(100%, 28rem);
		margin: 10vh auto 0;
		padding: 1.25rem;
		border: 1px solid var(--line-divider);
		border-radius: 8px;
		background: var(--card-bg);
		box-shadow: var(--shadow);
	}

	.unlock-panel p {
		margin: 0;
		color: var(--secondary);
		line-height: 1.7;
	}

	.eyebrow {
		margin: 0 0 0.25rem;
		color: var(--meta);
		font-size: 0.78rem;
		text-transform: uppercase;
	}

	h1 {
		margin: 0;
		font-size: 1.8rem;
		line-height: 1.15;
	}

	select,
	input,
	textarea,
	button {
		width: 100%;
		border: 1px solid var(--line-divider);
		border-radius: 8px;
		padding: 0.75rem 0.85rem;
		background: var(--card-bg);
		color: var(--primary);
		font: inherit;
		outline: none;
	}

	button {
		border-color: transparent;
		background: var(--primary);
		color: var(--page-bg);
		font-weight: 800;
		cursor: pointer;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.editor-header select {
		width: auto;
		min-width: 7rem;
	}

	.editor-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
	}

	.editor-form,
	.preview-panel {
		border: 1px solid var(--line-divider);
		border-radius: 8px;
		background: var(--card-bg);
		box-shadow: var(--shadow);
	}

	.editor-form {
		display: grid;
		gap: 0.9rem;
		padding: 1rem;
	}

	label {
		display: grid;
		gap: 0.4rem;
		color: var(--secondary);
		font-size: 0.9rem;
	}

	label span {
		font-weight: 700;
	}

	.body-field textarea {
		min-height: 18rem;
		resize: vertical;
		line-height: 1.7;
	}

	.preview-panel {
		min-height: 18rem;
		overflow: hidden;
	}

	.preview-meta {
		display: grid;
		gap: 0.35rem;
		padding: 0.85rem 1rem;
		border-bottom: 1px solid var(--line-divider);
		color: var(--secondary);
		font-weight: 700;
	}

	.preview-meta code {
		display: block;
		overflow-wrap: anywhere;
		color: var(--meta);
		font-weight: 400;
	}

	pre {
		margin: 0;
		padding: 1rem;
		overflow: auto;
		white-space: pre-wrap;
		line-height: 1.65;
	}

	.error {
		margin: 0;
		padding: 1rem;
		color: #d14343;
	}

	.error.compact {
		padding: 0;
	}

	.success {
		margin: 0;
		color: #1d8f5f;
		font-weight: 700;
	}

	@media (min-width: 920px) {
		.editor-grid {
			grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		}

		.editor-form,
		.preview-panel {
			min-height: 34rem;
		}
	}
</style>
