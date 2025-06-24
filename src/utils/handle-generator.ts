import pinyin from "pinyin"

/**
 * 将字符串转换为 URL 友好的 handle
 * 1. 转换为小写
 * 2. 将重音字符转换为基本拉丁字符
 * 3. 将中文转换为拼音
 * 4. 移除特殊字符
 * 5. 将空格转换为连字符
 * 6. 如果结果为空，生成随机字符串
 */
export const generateHandle = async (title: string): Promise<string> => {
  // 如果标题为空，生成随机字符串
  if (!title) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let handle = ""
    for (let i = 0; i < 8; i++) {
      handle += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return handle
  }

  // 将标题转换为小写
  let handle = title.toLowerCase()

  // 将重音字符转换为基本拉丁字符
  handle = handle.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  // 将中文转换为拼音
  handle = pinyin(handle, {
    style: pinyin.STYLE_NORMAL,
    segment: true,
    group: false,
  }).join("")

  // 将日文和韩文字符移除
  handle = handle.replace(/[\u3040-\u30ff\u3130-\u318f\uac00-\ud7af]/g, "")

  // 将特殊字符和空格转换为连字符
  handle = handle.replace(/[^a-z0-9]+/g, "-")

  // 移除开头和结尾的连字符
  handle = handle.replace(/^-+|-+$/g, "")

  // 如果处理后的 handle 为空，生成随机字符串
  if (!handle) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    for (let i = 0; i < 8; i++) {
      handle += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }

  return handle
}
