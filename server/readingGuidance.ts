import type { ReadingTopic } from "./galleryReading";

type BilingualAction = { zh: string; en: string };

/** Small, topic-specific actions grounded in each catalogue symbol. */
export const READING_ACTIONS: Record<
  number,
  Record<ReadingTopic, BilingualAction>
> = {
  1: {
    study: {
      zh: "向老師問清楚一項作業要求",
      en: "ask a teacher to clarify one assignment requirement",
    },
    love: {
      zh: "傳一句真誠的問候，讓對方按自己的步調回覆",
      en: "send a sincere hello and give the other person time to reply",
    },
    daily: {
      zh: "回覆一則擱置的訊息，讓事情往前一步",
      en: "reply to one waiting message to move a task forward",
    },
  },
  2: {
    study: {
      zh: "用十分鐘試一個有興趣的小題目",
      en: "spend ten minutes trying a small topic that interests you",
    },
    love: {
      zh: "分享今天一件小開心，邀請對方也說一件",
      en: "share one small joy from today and invite the other person to share theirs",
    },
    daily: {
      zh: "安排一件花費不多的小樂事，讓自己稍作休息",
      en: "make time for a small, low-cost pleasure and a short rest",
    },
  },
  3: {
    study: {
      zh: "找一個平常少看的資料來源，拓闊解題方向",
      en: "look at one unfamiliar source for a fresh way to approach your assignment",
    },
    love: {
      zh: "問對方一個關於興趣的開放問題，了解不同的生活經驗",
      en: "ask an open question about an interest to learn about the other person's experience",
    },
    daily: {
      zh: "在安全熟悉的範圍換一條散步路線，留意一個新發現",
      en: "take a different walk within a safe, familiar area and notice one new detail",
    },
  },
  4: {
    study: {
      zh: "整理一小塊書桌，放好下一次溫習需要的材料",
      en: "clear a small study space and set out materials for your next session",
    },
    love: {
      zh: "說出一件讓你相處時感到安心的小事",
      en: "name one small thing that helps you feel comfortable together",
    },
    daily: {
      zh: "整理一個常用角落，讓回家後更容易放鬆",
      en: "tidy one well-used corner to make relaxing at home easier",
    },
  },
  5: {
    study: {
      zh: "安排一段短時間溫習，明天再回顧同一重點",
      en: "plan a short study session and revisit the same point tomorrow",
    },
    love: {
      zh: "約定一個彼此都舒服的聯絡頻率，慢慢建立信任",
      en: "agree on a comfortable pace of contact to build trust gradually",
    },
    daily: {
      zh: "在忙碌中安排一段休息，照顧自己的精神與體力",
      en: "plan a break in a busy day to care for your energy",
    },
  },
  6: {
    study: {
      zh: "寫下一個還不明白的地方，帶著它向老師提問",
      en: "write down one confusing point to ask your teacher about",
    },
    love: {
      zh: "把不確定的事改成一句溫和的提問，先聽對方的想法",
      en: "turn an uncertainty into a gentle question and listen to the answer",
    },
    daily: {
      zh: "分開寫下已知事實和仍需確認的事，先處理能確認的一項",
      en: "separate known facts from open questions and check one item",
    },
  },
  7: {
    study: {
      zh: "遇到卡住的題目時換一種解法，記下哪一步有幫助",
      en: "try another method on a stuck problem and note which step helps",
    },
    love: {
      zh: "留意一次談話中自己的感受，想清楚一條需要的界線",
      en: "notice how you feel in a conversation and identify one boundary you need",
    },
    daily: {
      zh: "替一個不順手的安排準備簡單的替代方案",
      en: "prepare a simple alternative for one awkward part of your day",
    },
  },
  8: {
    study: {
      zh: "停用一個沒有效的溫習方法，試一次較短的練習",
      en: "set aside an unhelpful study method and try a shorter practice session",
    },
    love: {
      zh: "暫停一次反覆爭論，約好雙方平靜時再談",
      en: "pause a recurring argument and agree to talk when both people feel calmer",
    },
    daily: {
      zh: "放下一件不再需要完成的小事，留出休息空間",
      en: "let go of one unnecessary task to make room for rest",
    },
  },
  9: {
    study: {
      zh: "圈出作業中一個做得好的地方，下一次保留這個做法",
      en: "mark one part of your work that went well and reuse that approach",
    },
    love: {
      zh: "具體說出你欣賞對方的一個舉動，不要求回報",
      en: "thank someone for a specific kind action without expecting anything back",
    },
    daily: {
      zh: "拍下或畫下今天讓你欣賞的一個細節",
      en: "photograph or sketch one detail you enjoyed seeing today",
    },
  },
  10: {
    study: {
      zh: "關掉一個容易分心的通知，專心完成一道題目",
      en: "turn off one distracting notification and focus on one question",
    },
    love: {
      zh: "溫和說明一件你不舒服的事，提出可接受的相處方式",
      en: "gently name something uncomfortable and suggest a way of interacting that works for you",
    },
    daily: {
      zh: "從待辦清單刪去一項非必要的事，保留精力",
      en: "remove one nonessential task from your list to protect your energy",
    },
  },
  11: {
    study: {
      zh: "把容易出錯的一步練習三次，每次檢查一個改進",
      en: "practise a tricky step three times, checking one improvement each time",
    },
    love: {
      zh: "練習用「我感到」表達需要，取代一次責備",
      en: "practise stating a need with an 'I feel' sentence instead of blame",
    },
    daily: {
      zh: "用五分鐘重做一項想熟習的小技能，做到就休息",
      en: "practise a small skill for five minutes, then take a break",
    },
  },
  12: {
    study: {
      zh: "和同學輪流解釋一個概念，找出彼此漏掉的重點",
      en: "take turns explaining a concept with a classmate to spot missing points",
    },
    love: {
      zh: "留出幾分鐘專心聽對方說話，再確認你是否理解",
      en: "listen without distractions for a few minutes, then check your understanding",
    },
    daily: {
      zh: "找一位信任的人分享近況，也留時間聽對方說",
      en: "share an update with someone you trust and make time to listen too",
    },
  },
  13: {
    study: {
      zh: "從最基本的例題開始，容許自己邊做邊學",
      en: "start with a basic example and allow yourself to learn as you go",
    },
    love: {
      zh: "用好奇而不評斷的方式，問對方最近喜歡做甚麼",
      en: "ask what the other person enjoys lately with curiosity rather than judgment",
    },
    daily: {
      zh: "花五分鐘試一個新興趣，不用急著做好",
      en: "try a new interest for five minutes without needing to be good at it",
    },
  },
  14: {
    study: {
      zh: "比較兩種解題方法，選一種較適合自己的練習",
      en: "compare two methods and practise the one that suits you better",
    },
    love: {
      zh: "留意言語和行動是否一致，有疑問就平和地問清楚",
      en: "notice whether words and actions match and calmly clarify any question",
    },
    daily: {
      zh: "檢查一項安排的時間和所需材料，提早補好缺漏",
      en: "check the time and materials for a plan and fill one gap in advance",
    },
  },
  15: {
    study: {
      zh: "找一位老師或同學，請教一個自己難以解決的問題",
      en: "ask a teacher or classmate for help with one difficult question",
    },
    love: {
      zh: "問對方需要哪一種支持，也說出自己能做到的範圍",
      en: "ask what support someone needs and explain what you can comfortably offer",
    },
    daily: {
      zh: "為今天最重要的一件事保留時間，其他事量力而為",
      en: "reserve time for today's most important task and keep other demands manageable",
    },
  },
  16: {
    study: {
      zh: "把想學會的能力寫成一個本週能嘗試的小目標",
      en: "turn a skill you want to learn into one small goal for this week",
    },
    love: {
      zh: "分享一個你重視的相處願望，聽聽對方的願望",
      en: "share one hope for how you relate and listen to the other person's hope",
    },
    daily: {
      zh: "寫下一個想做的創作，再選出今天能開始的一小步",
      en: "write down a creative idea and choose one small step to start today",
    },
  },
  17: {
    study: {
      zh: "調整一次溫習時段，記下專注程度有沒有改善",
      en: "adjust one study time and note whether it helps you focus",
    },
    love: {
      zh: "提出一個讓彼此更舒服的小改變，先問對方是否願意",
      en: "suggest a small change that could help you both and ask if they want to try it",
    },
    daily: {
      zh: "改動一個不方便的日常習慣，試一天再決定是否保留",
      en: "adjust one inconvenient routine for a day before deciding whether to keep it",
    },
  },
  18: {
    study: {
      zh: "約一位同學互相檢查一道題目的步驟",
      en: "invite a classmate to check the steps of one question with you",
    },
    love: {
      zh: "主動關心一位朋友，問問最近有甚麼需要幫忙",
      en: "check in with a friend and ask if they need a hand with anything",
    },
    daily: {
      zh: "與一位讓你安心的人安排短暫相聚或通話",
      en: "plan a short visit or call with someone whose company feels comfortable",
    },
  },
  19: {
    study: {
      zh: "把作業分成三個部分，選一部分獨立完成",
      en: "divide an assignment into three parts and work on one independently",
    },
    love: {
      zh: "說明你需要的一段獨處時間，也尊重對方的空間",
      en: "explain when you need time alone and respect the other person's space too",
    },
    daily: {
      zh: "留十分鐘不受打擾的時間，整理今天的優先次序",
      en: "set aside ten uninterrupted minutes to sort today's priorities",
    },
  },
  20: {
    study: {
      zh: "把一份未完成的草稿交給同學，請對方給一個具體建議",
      en: "show a draft to a classmate and ask for one specific suggestion",
    },
    love: {
      zh: "邀請朋友參加一個大家都有興趣的小活動，容許對方婉拒",
      en: "invite friends to a shared-interest activity and leave room for them to decline",
    },
    daily: {
      zh: "留意一個社區活動或展覽，選一項有興趣的內容了解",
      en: "look up a community activity or exhibition and explore one part that interests you",
    },
  },
  21: {
    study: {
      zh: "把最難的作業拆成一個十分鐘能完成的小步驟",
      en: "break a difficult assignment into one step you can try in ten minutes",
    },
    love: {
      zh: "選一個相處上的難題，平靜說出你希望改善的一點",
      en: "choose one relationship difficulty and calmly name one change you would welcome",
    },
    daily: {
      zh: "把一件麻煩事拆小，只處理今天做得到的部分",
      en: "split a difficult task into smaller parts and tackle only what is manageable today",
    },
  },
  22: {
    study: {
      zh: "列出兩個學習方向，各寫一個可先試的小任務",
      en: "list two study directions and one small task to try for each",
    },
    love: {
      zh: "提出兩個相處安排，和對方一起選較舒服的一個",
      en: "offer two ways to spend time together and choose a comfortable option together",
    },
    daily: {
      zh: "列出兩個可行安排，按今天的時間和精力選一個",
      en: "list two workable plans and choose one that fits today's time and energy",
    },
  },
  23: {
    study: {
      zh: "檢查一道題目中的小錯誤，只改好一個細節",
      en: "check one question for a small error and improve just that detail",
    },
    love: {
      zh: "留意一個常被忽略的小需要，用一句話清楚表達",
      en: "notice one small overlooked need and express it in a clear sentence",
    },
    daily: {
      zh: "修整一個常造成小麻煩的細節，讓日常更順手",
      en: "fix one detail that causes a small recurring inconvenience",
    },
  },
  24: {
    study: {
      zh: "從自己最有興趣的部分入手，再連到今天的學習任務",
      en: "start with the part that interests you most and connect it to today's study task",
    },
    love: {
      zh: "用一句真誠的話表達關心，不替對方決定感受",
      en: "express care in one sincere sentence without deciding how the other person feels",
    },
    daily: {
      zh: "為真正喜歡的一件事留十分鐘，留意做完後的感受",
      en: "make ten minutes for something you care about and notice how you feel afterward",
    },
  },
  25: {
    study: {
      zh: "與同學約定一個小組分工和完成時間",
      en: "agree on one group task and a completion time with a classmate",
    },
    love: {
      zh: "確認一個雙方都願意守的小約定，避免勉強承諾",
      en: "agree on one small commitment both people freely want to keep",
    },
    daily: {
      zh: "選一個做得到的小習慣，安排固定的練習時間",
      en: "choose a manageable habit and set a regular time to practise it",
    },
  },
  26: {
    study: {
      zh: "查一個可靠資料來源，用自己的話寫下答案",
      en: "check a reliable source and write the answer in your own words",
    },
    love: {
      zh: "問一件你想更了解對方的事，也尊重對方不想回答的部分",
      en: "ask about something you would like to understand while respecting what stays private",
    },
    daily: {
      zh: "花十分鐘讀一個好奇的主題，記下一個新發現",
      en: "read about a topic you are curious about for ten minutes and note one discovery",
    },
  },
  27: {
    study: {
      zh: "用三句話整理今天的重點，檢查哪一句還不清楚",
      en: "summarise today's lesson in three sentences and check which needs clarification",
    },
    love: {
      zh: "先寫下想說的重點，再用清楚溫和的訊息表達",
      en: "write down your main point before sending a clear, gentle message",
    },
    daily: {
      zh: "把一件待辦事寫成清楚的提醒，放在容易看到的地方",
      en: "write a clear reminder for one task and put it where you can see it",
    },
  },
  28: {
    study: {
      zh: "選一道題目，先動手寫出第一步再檢查",
      en: "choose a question, write the first step, then check it",
    },
    love: {
      zh: "把關心化成一件對方同意的小行動",
      en: "turn care into one small helpful action the other person agrees to",
    },
    daily: {
      zh: "選一件拖延的小事，先花五分鐘開始做",
      en: "spend five minutes starting one small task you have been putting off",
    },
  },
  29: {
    study: {
      zh: "留意自己何時最容易專注，把較難的題目安排在那時",
      en: "notice when you focus best and schedule a harder question for that time",
    },
    love: {
      zh: "先說出自己的感受，再問對方是否願意分享",
      en: "name your own feeling, then ask whether the other person wants to share",
    },
    daily: {
      zh: "停一分鐘留意自己的需要，安排一件照顧自己的小事",
      en: "pause for a minute to notice a need and plan one small act of self-care",
    },
  },
  30: {
    study: {
      zh: "先做幾次平穩呼吸，再慢慢檢查一道題目",
      en: "take a few steady breaths before calmly reviewing one question",
    },
    love: {
      zh: "選一個不趕時間的時刻，平和地談一件在意的事",
      en: "choose an unhurried moment to calmly discuss something that matters to you",
    },
    daily: {
      zh: "安排五分鐘安靜時間，暫時放下螢幕和待辦清單",
      en: "take five quiet minutes away from screens and your task list",
    },
  },
  31: {
    study: {
      zh: "回看一道已掌握的題目，找出能用在新題目的方法",
      en: "review a question you can solve and reuse its method on a new one",
    },
    love: {
      zh: "具體肯定對方一件做得好的事，分享相處中的暖意",
      en: "acknowledge one thing the other person did well and share your appreciation",
    },
    daily: {
      zh: "記下一件今天完成的小事，給自己的努力一點肯定",
      en: "note one thing you completed today and acknowledge the effort it took",
    },
  },
  32: {
    study: {
      zh: "把一個概念畫成簡單圖像，幫助自己理解和記憶",
      en: "draw a simple image of one concept to help you understand and remember it",
    },
    love: {
      zh: "用一個畫面或比喻說出感受，再補一句清楚的需要",
      en: "use an image or comparison to describe a feeling, then state a clear need",
    },
    daily: {
      zh: "畫下或記下今天的一個靈感，不急著判斷好壞",
      en: "sketch or note one idea from today without judging its quality yet",
    },
  },
  33: {
    study: {
      zh: "找出一道題目最關鍵的條件，再試一個解法",
      en: "identify the key condition in a question and test one solution",
    },
    love: {
      zh: "問清楚眼前問題中最重要的需要，一起找一個小解法",
      en: "clarify the most important need in a shared problem and look for one small solution together",
    },
    daily: {
      zh: "找出一件卡住的事缺少甚麼，先補上一項資源或資訊",
      en: "identify what a stalled task is missing and add one resource or piece of information",
    },
  },
  34: {
    study: {
      zh: "把手上筆記和資料分類，選一份最有用的先溫習",
      en: "sort your notes and resources and review the most useful one first",
    },
    love: {
      zh: "互相分享一個有用的資源或點子，讓交流有來有往",
      en: "exchange a useful resource or idea so both people can contribute",
    },
    daily: {
      zh: "把兩個現有點子連在一起，試做一個簡單草稿",
      en: "combine two ideas you already have into a simple draft",
    },
  },
  35: {
    study: {
      zh: "設定一個固定而短的溫習時段，從容易維持的份量開始",
      en: "set a short, regular study time with an amount you can sustain",
    },
    love: {
      zh: "問對方哪個日常小舉動讓彼此安心，選一個能持續做的",
      en: "ask which everyday gesture helps you both feel secure and choose one you can sustain",
    },
    daily: {
      zh: "選一個讓自己安定的習慣，今天保留時間做一次",
      en: "make time today for one familiar habit that helps you feel grounded",
    },
  },
  36: {
    study: {
      zh: "寫下學這個題目的意義，再選一個量力而為的小任務",
      en: "write why this subject matters to you and choose one manageable task",
    },
    love: {
      zh: "說出一個你重視的相處原則，也聽聽對方重視甚麼",
      en: "share one value that matters in your relationships and listen to the other person's",
    },
    daily: {
      zh: "分清一件你重視的責任和可求助的部分，向信任的人開口",
      en: "identify a responsibility you value and ask someone you trust for help with one part",
    },
  },
};
