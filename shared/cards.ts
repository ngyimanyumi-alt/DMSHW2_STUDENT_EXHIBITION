export type CardSeed = {
  id: number;
  num: string;
  nameZh: string;
  nameEn: string;
  keywordsZh: string;
  keywordsEn: string;
  descriptionZh: string;
  descriptionEn: string;
};

/** The common 36-card Lenormand catalogue used by client and backend. */
export const CARD_CATALOG: CardSeed[] = [
  {
    id: 1,
    num: "01",
    nameZh: "騎士",
    nameEn: "Rider",
    keywordsZh: "消息、進展、活力、速達",
    keywordsEn: "News, progress, vitality, swift arrival",
    descriptionZh: "奔馳的騎士以向前的線條象徵抵達與流動的訊息。",
    descriptionEn:
      "A rider in forward-moving lines symbolizes arrival and the flow of news.",
  },
  {
    id: 2,
    num: "02",
    nameZh: "三葉草",
    nameEn: "Clover",
    keywordsZh: "幸運、小確幸、希望、轉機",
    keywordsEn: "Luck, small joys, hope, a turning point",
    descriptionZh: "三葉草般的簡約形態留住偶然相遇的微小光亮。",
    descriptionEn:
      "A simple clover form holds the small brightness of a chance encounter.",
  },
  {
    id: 3,
    num: "03",
    nameZh: "船",
    nameEn: "Ship",
    keywordsZh: "旅程、冒險、視野、遠方",
    keywordsEn: "Journeys, adventure, perspective, distant places",
    descriptionZh: "船的弧形輪廓把視線帶往未知而開闊的遠方。",
    descriptionEn:
      "The ship's curved silhouette draws the eye toward an open, unknown distance.",
  },
  {
    id: 4,
    num: "04",
    nameZh: "房子",
    nameEn: "House",
    keywordsZh: "安全、家庭、根基、溫馨",
    keywordsEn: "Security, family, foundations, warmth",
    descriptionZh: "穩定的屋簷與方正結構描繪可以安放身心的居所。",
    descriptionEn:
      "A steady roofline and balanced structure portray a place in which to settle.",
  },
  {
    id: 5,
    num: "05",
    nameZh: "樹",
    nameEn: "Tree",
    keywordsZh: "健康、成長、耐力、生命力",
    keywordsEn: "Health, growth, resilience, life force",
    descriptionZh: "向上伸展的樹冠把時間、根系與生命力連在一起。",
    descriptionEn:
      "An upward-reaching crown connects time, roots, and life force.",
  },
  {
    id: 6,
    num: "06",
    nameZh: "雲",
    nameEn: "Clouds",
    keywordsZh: "迷惘、過渡、思考、轉化",
    keywordsEn: "Uncertainty, transition, reflection, transformation",
    descriptionZh: "層疊雲影以柔化的邊界呈現思緒變動的過程。",
    descriptionEn:
      "Layered clouds use softened edges to show thoughts in transition.",
  },
  {
    id: 7,
    num: "07",
    nameZh: "蛇",
    nameEn: "Snake",
    keywordsZh: "智慧、曲折、警覺、蜕變",
    keywordsEn: "Wisdom, twists and turns, vigilance, transformation",
    descriptionZh: "蜿蜒曲線讓蛇成為觀察、機智與蛻變的視覺隱喻。",
    descriptionEn:
      "A winding line makes the snake a visual metaphor for observation, wit, and transformation.",
  },
  {
    id: 8,
    num: "08",
    nameZh: "棺材",
    nameEn: "Coffin",
    keywordsZh: "結束、重塑、沉澱、新開始",
    keywordsEn: "Endings, reshaping, stillness, new beginnings",
    descriptionZh: "收束的形體以安靜留白表現結束後的沉澱與重組。",
    descriptionEn:
      "A contained form and quiet negative space suggest stillness and reshaping after an ending.",
  },
  {
    id: 9,
    num: "09",
    nameZh: "花束",
    nameEn: "Bouquet",
    keywordsZh: "美感、禮物、喜悅、讚賞",
    keywordsEn: "Beauty, gifts, joy, appreciation",
    descriptionZh: "綻放的花束把欣賞、贈與與日常喜悅聚成一束。",
    descriptionEn:
      "A blooming bouquet gathers appreciation, giving, and everyday delight into one gesture.",
  },
  {
    id: 10,
    num: "10",
    nameZh: "鐮刀",
    nameEn: "Scythe",
    keywordsZh: "果斷、切斷、突破、決策",
    keywordsEn: "Decisiveness, cutting away, breakthrough, decision",
    descriptionZh: "斜向的鐮刀輪廓強調俐落切分與瞬間決斷。",
    descriptionEn:
      "The scythe's diagonal silhouette emphasizes a clean division and an instant decision.",
  },
  {
    id: 11,
    num: "11",
    nameZh: "鞭子",
    nameEn: "Whip",
    keywordsZh: "練習、反覆、激情、自律",
    keywordsEn: "Practice, repetition, passion, self-discipline",
    descriptionZh: "重複的鞭梢節奏將練習與自律轉成有張力的線條。",
    descriptionEn:
      "The whip's repeating rhythm turns practice and self-discipline into a taut line.",
  },
  {
    id: 12,
    num: "12",
    nameZh: "鳥",
    nameEn: "Birds",
    keywordsZh: "交流、對話、靈感、分享",
    keywordsEn: "Communication, conversation, inspiration, sharing",
    descriptionZh: "相向的鳥影以輕快節點描繪交談與靈感的往返。",
    descriptionEn:
      "Birds facing one another use light beats to depict the exchange of conversation and inspiration.",
  },
  {
    id: 13,
    num: "13",
    nameZh: "小孩",
    nameEn: "Child",
    keywordsZh: "純真、好奇、新起點、潛能",
    keywordsEn: "Innocence, curiosity, new beginnings, potential",
    descriptionZh: "小巧身形與開放姿態保留好奇探索的起點。",
    descriptionEn:
      "A small figure and open pose preserve the curiosity of a beginning.",
  },
  {
    id: 14,
    num: "14",
    nameZh: "狐狸",
    nameEn: "Fox",
    keywordsZh: "聰慧、技巧、敏銳、策略",
    keywordsEn: "Cleverness, skill, alertness, strategy",
    descriptionZh: "靈巧的狐狸側影以銳利目光提示觀察與策略。",
    descriptionEn:
      "A nimble fox in profile uses a keen gaze to suggest observation and strategy.",
  },
  {
    id: 15,
    num: "15",
    nameZh: "熊",
    nameEn: "Bear",
    keywordsZh: "力量、保護、領導、支持",
    keywordsEn: "Strength, protection, leadership, support",
    descriptionZh: "厚實的熊形以穩重重心傳達守護與支持。",
    descriptionEn:
      "A solid bear form carries protection and support through its grounded weight.",
  },
  {
    id: 16,
    num: "16",
    nameZh: "星星",
    nameEn: "Stars",
    keywordsZh: "夢想、方向、指引、創作",
    keywordsEn: "Dreams, direction, guidance, creation",
    descriptionZh: "星群在留白中排列成連結夢想與創作的方向感。",
    descriptionEn:
      "Stars arranged in open space create a sense of direction between dreams and making.",
  },
  {
    id: 17,
    num: "17",
    nameZh: "鸛鳥",
    nameEn: "Stork",
    keywordsZh: "改變、提升、遷徙、突破",
    keywordsEn: "Change, advancement, migration, breakthrough",
    descriptionZh: "振翅的鸛鳥將遷移的動勢轉成成長與改變的象徵。",
    descriptionEn:
      "A stork in flight turns the motion of migration into a symbol of growth and change.",
  },
  {
    id: 18,
    num: "18",
    nameZh: "狗",
    nameEn: "Dog",
    keywordsZh: "忠誠、陪伴、友誼、信任",
    keywordsEn: "Loyalty, companionship, friendship, trust",
    descriptionZh: "平靜的狗的姿態以相伴的距離表達信任與友誼。",
    descriptionEn:
      "A calm dog's posture expresses trust and friendship through companionable closeness.",
  },
  {
    id: 19,
    num: "19",
    nameZh: "塔",
    nameEn: "Tower",
    keywordsZh: "高度、架構、專注、獨立",
    keywordsEn: "Height, structure, focus, independence",
    descriptionZh: "垂直塔身以清晰階層探索專注、架構與獨立。",
    descriptionEn:
      "A vertical tower explores focus, structure, and independence through clear tiers.",
  },
  {
    id: 20,
    num: "20",
    nameZh: "花園",
    nameEn: "Garden",
    keywordsZh: "社交、展覽、社群、分享",
    keywordsEn: "Social connection, exhibitions, community, sharing",
    descriptionZh: "交錯枝葉與開放空間勾勒人群相聚、展示與分享的花園。",
    descriptionEn:
      "Interlacing foliage and open space sketch a garden for gathering, display, and sharing.",
  },
  {
    id: 21,
    num: "21",
    nameZh: "山",
    nameEn: "Mountain",
    keywordsZh: "挑戰、毅力、堅定、跨越",
    keywordsEn: "Challenge, perseverance, resolve, crossing over",
    descriptionZh: "山稜的層次以沉靜重量呈現跨越挑戰的耐心。",
    descriptionEn:
      "Layered ridges give quiet weight to the patience of crossing a challenge.",
  },
  {
    id: 22,
    num: "22",
    nameZh: "岔路",
    nameEn: "Crossroads",
    keywordsZh: "選擇、可能性、路向、探索",
    keywordsEn: "Choices, possibilities, directions, exploration",
    descriptionZh: "分岔的道路在同一畫面開啟多種方向與選擇。",
    descriptionEn:
      "Diverging paths open several directions and choices within one frame.",
  },
  {
    id: 23,
    num: "23",
    nameZh: "老鼠",
    nameEn: "Mice",
    keywordsZh: "細節、微小、磨練、專注",
    keywordsEn: "Details, smallness, refinement, focus",
    descriptionZh: "細小的老鼠形影提醒觀者凝視微小細節與耐心打磨。",
    descriptionEn:
      "Small mouse forms invite attention to fine details and patient refinement.",
  },
  {
    id: 24,
    num: "24",
    nameZh: "心",
    nameEn: "Heart",
    keywordsZh: "熱情、愛意、真誠、感應",
    keywordsEn: "Passion, affection, sincerity, resonance",
    descriptionZh: "圓潤的心形以溫暖色調收納熱情與真誠的感受。",
    descriptionEn:
      "A rounded heart in warm tones holds feelings of passion and sincerity.",
  },
  {
    id: 25,
    num: "25",
    nameZh: "戒指",
    nameEn: "Ring",
    keywordsZh: "承諾、連結、合作、圓滿",
    keywordsEn: "Commitment, connection, collaboration, wholeness",
    descriptionZh: "閉合的圓環讓兩端相接，表現承諾、連結與合作。",
    descriptionEn:
      "A closed circle joins its ends to express commitment, connection, and collaboration.",
  },
  {
    id: 26,
    num: "26",
    nameZh: "書",
    nameEn: "Book",
    keywordsZh: "知識、探索、深層、研究",
    keywordsEn: "Knowledge, exploration, depth, research",
    descriptionZh: "翻開的書頁以層疊留白邀請對未知進行細緻探索。",
    descriptionEn:
      "Layered blank space in open pages invites careful exploration of the unknown.",
  },
  {
    id: 27,
    num: "27",
    nameZh: "信",
    nameEn: "Letter",
    keywordsZh: "訊息、表達、紀錄、溝通",
    keywordsEn: "Messages, expression, record, communication",
    descriptionZh: "信封的摺線把私密心意、記錄與交流化為清晰符號。",
    descriptionEn:
      "An envelope's folded lines make private thoughts, records, and exchange into a clear symbol.",
  },
  {
    id: 28,
    num: "28",
    nameZh: "男人",
    nameEn: "Man",
    keywordsZh: "理性、行動、力量、實踐",
    keywordsEn: "Reason, action, strength, practice",
    descriptionZh: "挺立人物以簡潔輪廓表現理性、行動與實踐的力量。",
    descriptionEn:
      "An upright figure uses a simple outline to express the strength of reason, action, and practice.",
  },
  {
    id: 29,
    num: "29",
    nameZh: "女人",
    nameEn: "Woman",
    keywordsZh: "直覺、感受、包容、滋養",
    keywordsEn: "Intuition, feeling, acceptance, nourishment",
    descriptionZh: "柔和人物側影以包容的姿態呈現直覺與滋養。",
    descriptionEn:
      "A gentle figure in profile presents intuition and nourishment through an embracing pose.",
  },
  {
    id: 30,
    num: "30",
    nameZh: "百合",
    nameEn: "Lily",
    keywordsZh: "和諧、平靜、修養、優雅",
    keywordsEn: "Harmony, calm, cultivation, elegance",
    descriptionZh: "舒展的百合以克制曲線傳達平靜、修養與優雅。",
    descriptionEn:
      "An unfolding lily uses restrained curves to convey calm, cultivation, and elegance.",
  },
  {
    id: 31,
    num: "31",
    nameZh: "太陽",
    nameEn: "Sun",
    keywordsZh: "光明、能量、成功、自信",
    keywordsEn: "Brightness, energy, success, confidence",
    descriptionZh: "放射的日光以明亮圓心凝聚能量與自信。",
    descriptionEn:
      "Radiating sunlight gathers energy and confidence around a bright center.",
  },
  {
    id: 32,
    num: "32",
    nameZh: "月亮",
    nameEn: "Moon",
    keywordsZh: "想像、靈感、情感、潛意識",
    keywordsEn: "Imagination, inspiration, emotion, subconscious",
    descriptionZh: "月牙與微光的對照為想像、情感與潛意識留下空間。",
    descriptionEn:
      "A crescent and its faint glow leave space for imagination, emotion, and the subconscious.",
  },
  {
    id: 33,
    num: "33",
    nameZh: "鑰匙",
    nameEn: "Key",
    keywordsZh: "解法、解答、要點、重要性",
    keywordsEn: "Solutions, answers, essentials, importance",
    descriptionZh: "精簡鑰匙輪廓指向理解問題的關鍵與入口。",
    descriptionEn:
      "A spare key outline points to the crucial entry into understanding a question.",
  },
  {
    id: 34,
    num: "34",
    nameZh: "魚",
    nameEn: "Fish",
    keywordsZh: "流動、豐富、創意、交流",
    keywordsEn: "Flow, abundance, creativity, exchange",
    descriptionZh: "游動的魚形以流線節奏描繪交流、創意與豐盛。",
    descriptionEn:
      "A swimming fish uses flowing rhythm to depict exchange, creativity, and abundance.",
  },
  {
    id: 35,
    num: "35",
    nameZh: "錨",
    nameEn: "Anchor",
    keywordsZh: "穩定、安全、定力、歸宿",
    keywordsEn: "Stability, security, steadiness, belonging",
    descriptionZh: "錨的下沉姿態在流動之中建立穩定與歸屬。",
    descriptionEn:
      "An anchor's downward stance establishes stability and belonging amid movement.",
  },
  {
    id: 36,
    num: "36",
    nameZh: "十字架",
    nameEn: "Cross",
    keywordsZh: "信念、考驗、使命、精神",
    keywordsEn: "Faith, trials, purpose, spirit",
    descriptionZh: "交叉軸線以樸素平衡承載信念、考驗與精神。",
    descriptionEn:
      "Crossing axes hold faith, trials, and spirit in a plain equilibrium.",
  },
];
