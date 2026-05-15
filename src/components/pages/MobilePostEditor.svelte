<script>
	import { createPostFromEditorSubmission } from "@/utils/mobile-post.mjs";
	import { publishPostToGitHub } from "@/utils/github-publisher.mjs";

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
</script>

<section class="editor-shell" aria-label="手机写博客">
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
					placeholder="仅本次页面会话使用，不会保存"
				/>
			</label>

			<button type="button" disabled={isPublishing} on:click={publishCurrentPost}>
				{isPublishing ? "提交中..." : "提交到 GitHub"}
			</button>

			{#if error}
				<p class="error compact">{error}</p>
			{/if}

			{#if publishMessage}
				<p class="success">{publishMessage}</p>
			{/if}
		</form>
	</div>
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

	.editor-form {
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

	.error {
		margin: 0;
		color: #d14343;
	}

	.success {
		margin: 0;
		color: #1d8f5f;
		font-weight: 700;
	}

	@media (min-width: 920px) {
		.editor-grid {
			grid-template-columns: minmax(0, 44rem);
			justify-content: center;
		}

		.editor-form {
			min-height: 34rem;
		}
	}
</style>
