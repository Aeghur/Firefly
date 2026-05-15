import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "公告",

	// 公告内容
	content: "欢迎来到我的博客！一片数字自留地，一个自由记录思考、分享知识和探索兴趣的地方。",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: false,
		// 链接文本
		text: "",
		// 链接 URL
		url: "",
		// 内部链接
		external: false,
	},
};
