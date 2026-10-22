import type { CardSeed } from "@shared/cards";

export type Language = "zh" | "en";
export type GalleryCard = CardSeed & {
  artist: string;
  imageUrl: string | null;
  driveUrl: string | null;
};
export type ExhibitionSettings = {
  titleZh: string;
  titleEn: string;
  statementZh: string;
  statementEn: string;
};
export type GuestEntry = {
  id: number;
  name: string;
  message: string;
  photoUrl: string | null;
  createdAt: Date;
  hidden: boolean;
};

export const COPY = {
  zh: {
    exhibition: "展覽",
    gallery: "作品圖鑑",
    draw: "抽牌",
    guestbook: "留言",
    curator: "策展管理",
    school: "地利亞修女紀念學校（協和二中）",
    department: "視覺藝術科",
    edition: "LENORMAND · STUDENT EXHIBITION",
    subtitle: "雷諾曼・學生藝術創作展",
    view: "看作品",
    drawAction: "抽兩張牌",
    galleryTitle: "三十六個意象",
    galleryIntro: "從一個符號，看見不同的想像。",
    search: "搜尋卡牌、意涵或創作者",
    all: "全部卡牌",
    artworks: "學生作品",
    noWorks: "學生作品尚未上載。",
    noResults: "未有符合的作品。",
    symbolIndex: "符號索引",
    artist: "創作者",
    meaning: "象徵意涵",
    close: "關閉",
    previous: "上一張",
    next: "下一張",
    drawTitle: "讓兩個符號相遇",
    drawIntro: "選一個主題，憑直覺抽兩張牌。",
    study: "學業與前途",
    love: "人際與感情",
    daily: "日常靈感",
    shuffle: "洗牌",
    shuffling: "正在洗牌…",
    shuffled: "已完成洗牌。",
    selected: "已選",
    reveal: "揭牌與解讀",
    reset: "重新抽牌",
    first: "第一張",
    second: "第二張",
    selectTwo: "選兩張背面卡牌",
    interpreting: "解讀中…",
    reading: "你的符號解讀",
    readingNote: "作為創作靈感，不是命運預測。",
    readingFallback: "以下為卡牌索引解讀。",
    retry: "再試一次",
    guestTitle: "留下你的觀展感想",
    guestIntro: "一句話，一張照片，記下這次相遇。",
    name: "名字／班別",
    message: "你的感想",
    photo: "加入照片",
    optional: "選填",
    submit: "送出留言",
    submitting: "正在保存…",
    posted: "留言已保存。",
    emptyGuest: "還沒有留言。留下一句，成為第一位。",
    removePhoto: "移除照片",
    consent: "留言及照片會公開展示。請只上載已獲同意的照片。",
    loading: "載入中…",
    loadError: "暫時未能載入資料。",
    saveError: "未能保存，請稍後再試。",
    saved: "已保存",
    save: "保存更改",
    saving: "正在保存…",
    manageTitle: "策展工作室",
    login: "登入策展帳戶",
    loginNote: "以網站擁有者帳戶登入，管理作品及留言。",
    denied: "此帳戶沒有策展權限。",
    logout: "登出",
    editWorks: "卡牌與作品",
    editExhibition: "展覽文字",
    editGuest: "留言管理",
    chooseCard: "選擇卡牌",
    nameZh: "中文名稱",
    nameEn: "英文名稱",
    keywordsZh: "中文意涵",
    keywordsEn: "英文意涵",
    descriptionZh: "中文解讀",
    descriptionEn: "英文解讀",
    upload: "上載圖片",
    drive: "Google Drive 圖片連結",
    import: "匯入圖片",
    importing: "正在匯入…",
    driveHint:
      "原檔須設定「知道連結的任何人可查看」。匯入後會保存圖片副本，網站更新或原連結變更不影響已匯入圖片。",
    imageLimit: "JPG、PNG 或 WebP，最多 8 MB。",
    photoLimit: "JPG、PNG 或 WebP，最多 5 MB。",
    titleZh: "中文展覽名稱",
    titleEn: "英文展覽名稱",
    statementZh: "中文展覽說明",
    statementEn: "英文展覽說明",
    hidden: "已隱藏",
    visible: "公開",
    hide: "隱藏",
    restore: "還原",
    back: "返回展覽",
    fullScreen: "全螢幕",
    exitFullScreen: "離開全螢幕",
    imageSaved: "圖片已匯入並保存。",
    reference: "關於這個展覽",
    noRecords: "沒有留言紀錄。",
  },
  en: {
    exhibition: "Exhibition",
    gallery: "Gallery",
    draw: "Draw cards",
    guestbook: "Guestbook",
    curator: "Curator",
    school: "Delia Memorial School (Hip Wo No.2 College)",
    department: "Visual Arts",
    edition: "LENORMAND · STUDENT EXHIBITION",
    subtitle: "Lenormand · A student art exhibition",
    view: "View works",
    drawAction: "Draw two cards",
    galleryTitle: "Thirty-six symbols",
    galleryIntro: "One symbol. Many ways of seeing.",
    search: "Search cards, meanings or artists",
    all: "All cards",
    artworks: "Student works",
    noWorks: "Student artwork has not been uploaded yet.",
    noResults: "No matching works.",
    symbolIndex: "Symbol index",
    artist: "Artist",
    meaning: "Symbolic meanings",
    close: "Close",
    previous: "Previous",
    next: "Next",
    drawTitle: "Two symbols, one encounter",
    drawIntro: "Choose a theme. Follow your intuition. Pick two cards.",
    study: "Study & future",
    love: "Relationships",
    daily: "Everyday inspiration",
    shuffle: "Shuffle the deck",
    shuffling: "Shuffling…",
    shuffled: "Deck shuffled. Make a new selection.",
    selected: "Selected",
    reveal: "Reveal & interpret",
    reset: "Draw again",
    first: "First card",
    second: "Second card",
    selectTwo: "Choose two face-down cards",
    interpreting: "Interpreting…",
    reading: "Your symbol reading",
    readingNote: "Creative inspiration, not a prediction.",
    readingFallback: "A reading based on the symbol index.",
    retry: "Try again",
    guestTitle: "Leave an impression",
    guestIntro: "A few words. A photograph. A moment to keep.",
    name: "Name / class",
    message: "Your reflection",
    photo: "Add a photograph",
    optional: "Optional",
    submit: "Post reflection",
    submitting: "Saving…",
    posted: "Your reflection has been saved.",
    emptyGuest: "No reflections yet. Leave the first one.",
    removePhoto: "Remove photograph",
    consent:
      "Messages and photos are public. Only upload photographs with permission from those pictured.",
    loading: "Loading…",
    loadError: "Unable to load the latest data.",
    saveError: "Unable to save. Please try again.",
    saved: "Saved",
    save: "Save changes",
    saving: "Saving…",
    manageTitle: "Curator studio",
    login: "Sign in as curator",
    loginNote:
      "Sign in with the site owner's account to manage works and reflections.",
    denied: "This account does not have curator access.",
    logout: "Sign out",
    editWorks: "Cards & artwork",
    editExhibition: "Exhibition text",
    editGuest: "Reflections",
    chooseCard: "Select a card",
    nameZh: "Chinese name",
    nameEn: "English name",
    keywordsZh: "Chinese keywords",
    keywordsEn: "English keywords",
    descriptionZh: "Chinese interpretation",
    descriptionEn: "English interpretation",
    upload: "Upload artwork",
    drive: "Google Drive image link",
    import: "Import image",
    importing: "Importing…",
    driveHint:
      "Set the original file to “Anyone with the link can view”. An image copy is saved on import, so site updates or source-link changes do not affect the imported image.",
    imageLimit: "JPG, PNG or WebP. Up to 8 MB.",
    photoLimit: "JPG, PNG or WebP. Up to 5 MB.",
    titleZh: "Chinese exhibition title",
    titleEn: "English exhibition title",
    statementZh: "Chinese statement",
    statementEn: "English statement",
    hidden: "Hidden",
    visible: "Public",
    hide: "Hide",
    restore: "Restore",
    back: "Back to exhibition",
    fullScreen: "Full screen",
    exitFullScreen: "Exit full screen",
    imageSaved: "Image imported and saved.",
    reference: "About this exhibition",
    noRecords: "No reflections to manage.",
  },
};

export async function readImage(
  file: File,
  maxMB: number
): Promise<{
  data: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("請使用 JPG、PNG 或 WebP / Please use JPG, PNG or WebP.");
  if (file.size > maxMB * 1024 * 1024)
    throw new Error(`圖片最多 ${maxMB} MB / Image limit: ${maxMB} MB.`);
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () =>
      reject(new Error("未能讀取圖片 / Unable to read image."));
    reader.readAsDataURL(file);
  });
  return {
    data,
    mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
  };
}

export function formatDate(date: Date | string, lang: Language) {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-HK" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
