import { food, dish, medicine, brewedMedicine, tool, material, gear, craftedGear } from "./factories.ts"
import type { ItemDefinition } from "./types.ts"

const DEFINITIONS = {
  // ---------------------------------------------------------------- food (shops on the market)
  apple: food("リンゴ", 3, 6, "apple", "赤くてみずみずしい。かじると甘酸っぱい。"),
  "green-apple": food("青リンゴ", 3, 5, "appleG", "すっぱいが、目がさめる。"),
  pear: food("洋ナシ", 4, 7, "pear", "とろけるように柔らかい。"),
  plum: food("スモモ", 3, 5, "plum", "皮ごと食べられる小さな実。", 1),
  grape: food("ぶどう", 6, 10, "grape", "寒さに強い小粒の房。南門の外の果樹園でとれた。"),
  cabbage: food("キャベツ", 5, 8, "cabbage", "ずっしり重い。スープにすると体が温まる。", 5),
  carrot: food("ニンジン", 2, 4, "carrot", "土の香りがする。", 1),
  turnip: food("カブ", 2, 4, "turnip", "煮るとほくほくになる。"),
  onion: food("タマネギ", 2, 3, "onion", "生でかじると涙が出る。", 1),
  egg: food("卵", 3, 6, "egg", "ウルリケの鶏が今朝産んだ。まだ温かい。", 1),
  trout: food("川マス", 8, 14, "trout", "今朝、川で釣れたばかり。", 3),
  herring: food("塩ニシン", 6, 10, "herring", "塩漬けで日持ちがする。旅の友。", 2),
  // ---------------------------------------------------------------- baked, cooked and poured (made by someone: §4.2.1)
  "rye-bread": dish("黒パン", 6, { hp: 12, stamina: 14, full: 18 }, "bread", "どっしりした黒パン。一つで半日もつ。"),
  roll: dish("白パン", 3, { hp: 6, stamina: 6, full: 8 }, "roll", "小さくて柔らかい丸パン。", 1),
  "apple-pie": dish("りんごのパイ", 16, { hp: 18, stamina: 14, full: 16, warm: 5 }, "pie", "蔵で寝かせたりんごを詰めて焼いた。焼きたては湯気が立つ。"),
  "honey-cake": dish("蜜の焼き菓子", 12, { hp: 10, sp: 6, stamina: 10, full: 10 }, "honeyCake", "農家の巣箱の蜜を練り込んだ。甘い匂いがする。", 2),
  cheese: { ...dish("チーズ", 10, { hp: 18, stamina: 10, full: 12 }, "cheese", "羊の乳で作ったチーズ。"), rarity: "fine" },
  wine: { ...dish("ぶどう酒", 12, { sp: 6, stamina: 4, full: 4, warm: 15 }, "jug", "醸造所で仕込んだ酒。", 5), rarity: "fine" },
  "hot-wine": dish("温めたぶどう酒", 14, { sp: 10, stamina: 6, full: 4, warm: 40 }, "cupWine", "香辛料と一緒に温めた。体の芯まで届く。"),
  "herb-tea": dish("薬草茶", 6, { sp: 8, stamina: 4, full: 2, warm: 25, focus: 10 }, "cupTea", "苦いが、喉にいい。", 1),
  "hot-milk": dish("温めた羊の乳", 6, { hp: 6, stamina: 6, full: 6, warm: 20 }, "cupMilk", "蜜をひとさじ落として。", 2),
  "hot-water": dish("白湯", 1, { full: 1, warm: 10 }, "cupWater", "湯売りの桶から汲んだ。ただの湯だが、ありがたい。", 1),
  "mushroom-soup": { ...dish("きのこのスープ", 18, { hp: 30, stamina: 22, full: 25, warm: 25 }, "soup", "森のきのこを煮込んだ。冷めてもうまい。", 4), rarity: "fine" },
  stew: { ...dish("シチュー", 26, { hp: 40, stamina: 30, full: 35, warm: 30 }, "stew", "根菜と羊の乳でことこと煮た。一皿で体が温まる。", 4), rarity: "fine" },
  "mushroom-stew": { ...dish("きのこの煮込み", 24, { hp: 34, stamina: 26, full: 30, warm: 30 }, "mushStew", "きのことかぶを黒パンと一緒に煮込んだ。", 4), rarity: "fine" },
  "fish-soup": dish("魚のスープ", 20, { hp: 30, stamina: 22, full: 25, warm: 25, focus: 15 }, "fishSoup", "浜の魚の骨でだしをとった。", 4),
  "cabbage-soup": dish("キャベツのスープ", 14, { hp: 20, stamina: 18, full: 22, warm: 20 }, "greenSoup", "くたくたのキャベツ。どこの家でも作る。", 4),
  porridge: dish("粥", 2, { hp: 8, stamina: 12, full: 20 }, "porridge", "麦を水で煮ただけの粥。礼拝堂の前で配られる。", 3),
  "cheese-toast": dish("チーズのせパン", 14, { hp: 22, stamina: 16, full: 18, warm: 10 }, "bread", "炉で炙った黒パンに、とろけたチーズ。"),
  skewer: dish("串焼き", 12, { hp: 18, stamina: 12, full: 12, warm: 8 }, "skewer", "炭火で焼いた川マス。焚き火の匂い。", 1),
  "roast-chestnuts": dish("焼き栗", 8, { hp: 6, stamina: 8, full: 8, warm: 10 }, "nuts", "紙袋の中で、まだ熱い。", 1),
  "baked-potato": dish("焼き芋", 10, { hp: 12, stamina: 12, full: 15, warm: 15 }, "potato", "灰の中で焼いた芋。手を温めてから食べる。", 2),
  "fried-dough": dish("揚げ菓子", 9, { hp: 8, stamina: 10, full: 10, warm: 5 }, "roll", "揚げたてに蜜をかけた。", 1),
  "smoked-fish": dish("干し魚", 9, { hp: 10, stamina: 10, full: 10 }, "driedFish", "浜の台で干すか、炉の煙でいぶした。日持ちがする。", 1),
  "dried-apple": dish("干しりんご", 6, { hp: 6, stamina: 6, full: 6 }, "apple", "薄く切って干した。噛むほど甘い。", 1),
  pickles: dish("酢漬け", 5, { hp: 4, stamina: 6, full: 4 }, "jug", "かぶとキャベツの酢漬け。冬の保存食。", 2),
  ration: dish("旅の携行食", 15, { hp: 10, stamina: 20, full: 18 }, "roll", "固く焼いた麦と干し果実。外へ出るなら一つは持て。", 1),

  // ---------------------------------------------------------------- medicine
  herb: medicine("薬草", 6, { hp: 15 }, "herb", "草原に生える苦い葉。噛むと傷の痛みがひく。", "common", 1),
  "blue-herb": medicine("青い薬草", 25, { sp: 12 }, "herbB", "日陰や湿った草地にまれに混じる青い葉。頭がすっと冴える。", "fine", 1),
  potion: brewedMedicine("回復薬", 40, { hp: 60 }, "potionR", "薬草を煮詰めた回復薬。作り手で効き目も味も違う。"),
  "red-potion": medicine("赤い水薬", 30, { hp: 45 }, "potionR", "薬草を煮詰めた水薬。旅人の必需品。"),
  "orange-potion": brewedMedicine("橙の水薬", 75, { hp: 100 }, "potionO", "蜜を加えてよく効くようにした水薬。", "fine"),
  "white-potion": medicine("白い水薬", 180, { hp: 220 }, "potionW", "修道士に伝わる処方。滅多に出回らない。", "rare"),
  "blue-potion": brewedMedicine("青い水薬", 90, { sp: 40 }, "potionB", "青い薬草から作る水薬。結晶を扱う者が好む。", "fine"),

  // ---------------------------------------------------------------- gathering tools (economy.md §1)
  // with the practice of a woodcutter (and the arm for it), the axe is a weapon too (game-system.md §9.3)
  "wood-axe": tool("木こりの斧", 60, "axe", "woodcutting", 1, 40, "刃こぼれしたら研ぎ直しを。木を倒し慣れた腕なら、魔物にも振るえる。", 18, {
    part: "weapon",
    atk: 14,
    delay: 1800,
    needs: { woodcutting: 4, str: 8 },
    scale: { str: "D" },
  }),
  sickle: tool("鎌", 35, "sickle", "foraging", 1, 50, "草も薬草もきのこも、根を残して刈れる。", 6),
  "fishing-rod": tool("釣り竿", 45, "rod", "fishing", 1, 40, "しなりのいい竿。", 6),

  // ---------------------------------------------------------------- gathering
  "meadow-flower": material("野の花", 4, "flower", "草原や菜園の隅に咲く小さな花。押し花にする人が多い。"),
  plank: material("板材", 6, "log", "原木を挽いた板。柄にも棚にも竿にもなる。", "common", 4),
  "iron-ingot": material("鉄の延べ棒", 24, "scrap", "鉄くずを炭で溶かして延べた。刃物の芯になる。", "common", 5),
  yarn: material("毛糸", 10, "thread", "白い毛を紡いだ糸。首巻きはこれで編む。", "common", 1),
  log: material("原木", 8, "log", "切り出したばかりの丸太。木工師が板にし、木こりが薪にする。", "common", 8),
  "sea-fish": food("浜の小魚", 5, 9, "herring", "網の小魚。焼いても汁にしてもうまい。", 1),
  "lamp-oil": material("灯り油", 5, "jug", "街灯と窓の灯りに。衛兵が夕方、道具屋で買っていく。", "common", 2),
  firewood: material("薪", 3, "firewood", "割った薪の束。かまどにも作業場の炉にも要る。", "common", 4),
  charcoal: material("炭", 6, "charcoal", "樹海の入り口の窯で焼いた炭。鍛冶と料理の火に。", "common", 2),
  mushroom: material("森のきのこ", 5, "mushroom", "木陰に生える茶色いきのこ。スープの具になる。"),

  "raw-hide": material("獣の皮", 18, "hide", "猟師ファルクが届けた獣の皮。革職人に頼めば、丈夫な革になる。", "common", 4),
  "tanned-leather": material("なめし革", 32, "leather", "ルドルフがなめした革。革鎧や靴の材料になる。", "common", 3),

  // ---------------------------------------------------------------- monster materials (drops)
  jelly: material("ぷるぷるのゼリー", 3, "jelly", "スライムが残す粘液のかたまり。乾くと固くなり、糊に使える。"),
  "blue-jelly": material("青いゼリー", 9, "jellyB", "水辺のスライムが残す冷たいゼリー。薬の材料になる。", "fine"),
  "violet-jelly": material("紫のゼリー", 20, "jellyP", "毒をもつスライムのゼリー。素手で触らないこと。", "fine"),
  "ember-jelly": material("熾火のゼリー", 45, "jellyR", "ほんのり温かいゼリー。冬の懐炉に重宝される。", "rare"),
  "soft-fur": material("やわらかい冬毛", 8, "fur", "野うさぎが逃げるときに残していく冬毛のかたまり。仕立て屋が喜んで買う。"),
  "white-fleece": material("白い毛", 14, "furW", "ふわふわの白い毛。紡げば上等な糸になる。", "fine"),
  "sharp-fang": material("鋭い牙", 12, "fang", "森の灰うさぎが残した硬い歯。根や樹皮をかじって鋭くなり、お守りに加工される。"),
  feather: material("羽根", 5, "feather", "大きな鳥の羽根。矢羽根や帽子の飾りに使う。"),
  "hard-shell": material("硬い甲殻", 16, "shell", "虫の魔物の甲殻。軽くて丈夫。"),
  "old-bone": material("古い骨", 6, "bone", "何の骨かはわからない。崩れた砦のあたりでよく見つかる。"),
  "sticky-thread": material("粘る糸", 10, "thread", "虫の魔物が吐く糸。乾くと絹のようにしなやかになる。"),
  "rusty-scrap": material("錆びた鉄くず", 7, "scrap", "大戦の頃の何かの部品。鍛冶屋が溶かして使う。"),
  "old-cog": material("古い歯車", 30, "cog", "戦時の機械の歯車。いまの機関にもそのまま合うことがある。", "rare", 2),

  // ---------------------------------------------------------------- crystals (magic fuel)
  "small-crystal": {
    name: "小さな結晶",
    kind: "crystal",
    rarity: "fine",
    price: 120,
    stack: 99,
    weight: 1,
    icon: "crystal",
    description: "世界樹のふもとで掘られる石。砕くと女神の力が一瞬だけ戻り、祈りに応える。",
  },
  "clear-crystal": {
    name: "澄んだ結晶",
    kind: "crystal",
    rarity: "rare",
    price: 400,
    stack: 99,
    weight: 1,
    icon: "crystalW",
    description: "曇りのない大きめの結晶。触れると、遠い昔の景色がかすかに見える。",
  },

  // ---------------------------------------------------------------- weapons
  "wooden-stick": craftedGear("木の棒", 8, "staff", { part: "weapon", atk: 4, delay: 1700, scale: { str: "E" } }, 20, "手頃な長さの枝。ないよりはまし。"),
  dagger: craftedGear("ダガー", 40, "dagger", { part: "weapon", atk: 9, delay: 1200, needs: { dex: 7 }, scale: { dex: "C", str: "E" } }, 40, "刃渡りの短い小刀。軽くて扱いやすい。"),
  "short-sword": gear("ショートソード", 120, "sword", { part: "weapon", atk: 22, delay: 1500, needs: { str: 8, dex: 7 }, scale: { str: "D", dex: "D" } }, 60, "ギュンターが打った片手剣。"),
  "iron-sword": craftedGear(
    "鉄の剣",
    320,
    "sword",
    { part: "weapon", atk: 36, delay: 1600, needs: { str: 11, dex: 9 }, scale: { str: "C", dex: "D" } },
    80,
    "よく鍛えた鉄の剣。重心がまっすぐで振りやすい。",
    "fine",
  ),
  "hand-axe": { ...gear("手斧", 90, "axe", { part: "weapon", atk: 20, delay: 1700, needs: { str: 9 }, scale: { str: "C" } }, 70, "薪割りにも戦いにも使える。"), made: true },
  "battle-axe": gear(
    "戦斧",
    380,
    "axe",
    { part: "weapon", atk: 48, delay: 2300, twoHanded: true, needs: { str: 16 }, scale: { str: "B" } },
    150,
    "両手で振るう大きな斧。木こりのヨーゼフも一目置く。",
    "fine",
  ),
  spear: {
    ...gear("槍", 150, "spear", { part: "weapon", atk: 28, delay: 1900, twoHanded: true, needs: { str: 9, dex: 9 }, scale: { dex: "C", str: "D" } }, 100, "間合いの長いトネリコの槍。両手で持つ。"),
    made: true,
  },
  mace: { ...gear("メイス", 180, "mace", { part: "weapon", atk: 26, delay: 1800, needs: { str: 12 }, scale: { str: "C" } }, 90, "鉄の頭をもつ打撃武器。鎧の上からでも効く。", "fine"), made: true },
  "oak-staff": craftedGear("樫の杖", 110, "staff", { part: "weapon", atk: 6, delay: 1700, needs: { mnd: 7 }, bonus: { maxSp: 15 } }, 50, "術と祈りを唱える者が持つ杖。先に小さな結晶がはまっている。"),
  "short-bow": craftedGear("短弓", 140, "bow", { part: "weapon", atk: 18, delay: 1600, twoHanded: true, needs: { dex: 10 }, scale: { dex: "C" } }, 50, "狩人が使う小ぶりの弓。両手で引く。"),

  // ---------------------------------------------------------------- armour
  "cloth-hat": gear("布の帽子", 30, "hat", { part: "head", def: 1 }, 10, "冷たい風と小雨を防ぐ。"),
  "iron-helm": gear("鉄兜", 140, "helm", { part: "head", def: 4, needs: { str: 7 } }, 60, "鍛冶場で叩き出した鉄の兜。", "fine"),
  "traveller-coat": gear("旅人の服", 80, "tunic", { part: "body", def: 3 }, 30, "厚手の毛織りの上着。"),
  "leather-armor": gear("革の鎧", 220, "tunic", { part: "body", def: 6 }, 80, "なめした革を重ねた鎧。動きやすい。", "fine"),
  "chain-mail": gear("鎖帷子", 480, "armor", { part: "body", def: 10, needs: { str: 10, vit: 8 } }, 160, "細い鉄の輪を編んだ鎧。重いが頼もしい。", "fine"),
  "wool-cape": craftedGear("毛織りの外套", 160, "cape", { part: "body", def: 4, bonus: { maxHp: 20 } }, 30, "白い毛を織った外套。夜の野営でも体が冷えない。", "fine"),
  "leather-boots": gear("革の靴", 50, "boots", { part: "feet", def: 1 }, 20, "長い道のりでも足が痛まない。"),
  "wooden-shield": craftedGear("木の盾", 60, "shield", { part: "shield", def: 3 }, 50, "樫の板に鉄の縁を打った丸盾。"),

  // ---------------------------------------------------------------- neck wraps (for looks; the tailor sells them)
  "wool-muffler": craftedGear("毛織りのマフラー", 60, "muffler", { part: "neck", look: { neck: "muffler", neckRamp: "cRed" } }, 3, "厚手に織った赤いマフラー。町の人の半分はこれを巻いている。"),
  "striped-muffler": craftedGear(
    "縞のマフラー",
    90,
    "mufflerS",
    { part: "neck", look: { neck: "muffler", neckRamp: "cBlue", neckStripe: "cLinen" } },
    3,
    "青と生成りの縞。迷っても見つけてもらえるように、目立つ色で編む。",
    "fine",
  ),
  "fur-stole": gear("冬毛のストール", 180, "stole", { part: "neck", def: 1, look: { neck: "stole", neckRamp: "cBrown" } }, 6, "やわらかい冬毛を寄せて肩掛けにした。夜の冷えにも負けない。", "fine"),
  "embroidered-scarf": gear("刺繍入りのスカーフ", 140, "scarf", { part: "neck", look: { neck: "scarf", neckRamp: "cPlum", neckStripe: "cHoney" } }, 2, "金糸で家紋を刺繍した細身のスカーフ。", "fine"),

  // ---------------------------------------------------------------- accessories
  charm: gear("お守り", 120, "charm", { part: "accessory", def: 1 }, 5, "町の礼拝堂で祈りを込めた木のお守り。", "rare"),
  "fang-charm": { ...gear("牙のお守り", 90, "charm", { part: "accessory", bonus: { str: 2 } }, 3, "鋭い牙を紐で結んだお守り。腕に力がこもる気がする。", "fine"), made: true },
  "silver-ring": gear("銀の指輪", 260, "ring", { part: "accessory", bonus: { dex: 2 } }, 1, "荷運びのルカスが港町から運んできた銀の指輪。", "fine"),
  "prayer-necklace": gear("祈りの首飾り", 300, "necklace", { part: "accessory", bonus: { fth: 2, maxSp: 20 } }, 2, "修道士の祈りの言葉が刻まれた首飾り。", "rare"),

  // ---------------------------------------------------------------- what only the practised bring (economy.md §2.1)
  // Not to be had in v0.1: life skills stop at 8. Defined so the trades past it have a shape.
  "black-oak-heart": { ...material("黒樫の芯材", 120, "log", "樹海の奥の古い樫を倒すと、芯だけが黒く締まっている。並の斧では刃が負ける。弓と柄の最上の材。", "rare", 6), milestone: 16 },
  "amber-resin": { ...material("琥珀の樹脂", 300, "jellyR", "古木の洞に二百年たまった樹脂が、飴色に固まったもの。木を割らずに取り出せるのは、木を知り尽くした手だけ。", "rare", 1), milestone: 32 },
  "world-branch": {
    ...material("世界樹の落ち枝", 1500, "log", "世界樹のふもとに、まれに落ちてくる灰色の枝。手荒に扱うと灰になって崩れる。祈りがよく通る、と修道士は言う。", "treasure", 4),
    milestone: 64,
  },
  "winter-char": { ...material("冬鱒", 90, "trout", "凍りかけた淵の底でじっと冬を越す、大きな鱒。めったに口を使わない。脂がのっている。", "fine", 4), milestone: 16 },
  "engine-core": {
    ...material("沈んだ機関の芯", 360, "cog", "大戦の頃の機関の芯。川底の泥に埋まっていたのを、糸と根気で引き上げる。錆の下の鋼は、いまの鍛冶では作れない。", "rare", 8),
    milestone: 32,
  },
  "elder-scale": {
    ...material("淵の主の抜け鱗", 1500, "shell", "町の川の淵に住む、誰も釣り上げたことのない大魚が落とした鱗。主に気づかれずに拾える釣り人は、町に一人いるかどうか。", "treasure", 1),
    milestone: 64,
  },
  "frost-lily": { ...material("霜の花", 100, "flower", "樹海の奥で、夜明け前の一刻だけ開く白い花。日が差すと閉じてしまう。", "rare"), milestone: 16 },
  "crystal-moss": { ...material("結晶苔", 320, "herbB", "結晶の気が染みた岩にだけ生える、かすかに光る苔。剥がし方を誤ると光が消える。", "rare"), milestone: 32 },
  "root-dew": { ...material("根の雫", 1500, "crystalW", "世界樹の根が地表に出たところに、朝だけ結ぶ雫。女神の力がほんのわずか混じっている、と言われる。", "treasure"), milestone: 64 },
  "smoked-char": { ...dish("冬鱒の燻し", 160, { hp: 60, stamina: 50, full: 30, warm: 90 }, "driedFish", "冬鱒を炭火でゆっくり燻した。一切れで夜通し体がもつ。", 2, "rare"), milestone: 16 },
  "feast-stew": {
    ...dish("寄り合いの大鍋", 420, { hp: 120, stamina: 100, full: 40, warm: 180 }, "stew", "冬鱒と霜の花を羊の乳で煮込む、寄り合いの集まりの日の鍋。作れる人がいると、その冬は皆が集まる。", 6, "rare"),
    milestone: 32,
  },
  "festival-cake": {
    ...dish(
      "送りの日の焼き菓子",
      1800,
      { hp: 200, sp: 80, stamina: 100, full: 20, warm: 360 },
      "honeyCake",
      "女神を送り出した日、と伝わる祭りの菓子。根の雫を一滴落とす古い作り方は、もう数人しか知らない。",
      2,
      "treasure",
    ),
    milestone: 64,
  },
  "frost-potion": { ...medicine("霜の花の水薬", 300, { hp: 150, sp: 60 }, "potionG", "霜の花を青い薬草と煮詰めた。体と頭の両方に効く。", "rare"), made: true, milestone: 16 },
  "moss-oil": { ...medicine("結晶苔の香油", 700, { sp: 200 }, "potionB", "結晶苔を油に浸して取った香油。嗅ぐと、結晶を砕いたときのような冴えが来る。", "rare"), made: true, milestone: 32 },
  "root-elixir": {
    ...medicine("根の雫の霊薬", 3000, { hp: 600, sp: 300 }, "potionA", "根の雫を結晶苔と霜の花の水薬で割った。修道士の記録に、作り方だけが残っていた。", "treasure"),
    made: true,
    milestone: 64,
  },
  "black-oak-bow": {
    ...craftedGear(
      "黒樫の長弓",
      1100,
      "bow",
      { part: "weapon", atk: 40, delay: 1700, twoHanded: true, needs: { dex: 14 }, scale: { dex: "B" } },
      60,
      "黒樫の芯から削り出した長弓。弦を張ると、低く鳴る。",
      "rare",
    ),
    milestone: 16,
  },
  "amber-staff": {
    ...craftedGear(
      "琥珀塗りの杖",
      2400,
      "staff",
      { part: "weapon", atk: 12, delay: 1600, needs: { mnd: 12 }, bonus: { maxSp: 40 } },
      45,
      "黒樫の杖に琥珀の樹脂を重ね塗りし、先に結晶をはめた。術も祈りもよく通る。",
      "rare",
    ),
    milestone: 32,
  },
  "world-branch-staff": {
    ...craftedGear(
      "世界樹の枝の杖",
      8000,
      "staff",
      { part: "weapon", atk: 18, delay: 1500, needs: { mnd: 14, fth: 16 }, bonus: { maxSp: 80, fth: 2 } },
      40,
      "世界樹の落ち枝を崩さずに削った杖。持つと、遠い昔の祈りの声がかすかに聞こえる気がする。",
      "treasure",
    ),
    milestone: 64,
  },
  "steel-axe": {
    ...tool("鋼の斧", 1400, "axe", "woodcutting", 1.6, 120, "黒樫の柄に、鍛え直した鋼の刃。古い樫でも刃が負けない。", 20, {
      part: "weapon",
      atk: 30,
      delay: 1700,
      needs: { woodcutting: 16, str: 14 },
      scale: { str: "C" },
    }),
    rarity: "rare",
    milestone: 16,
  },
  "engine-steel-sword": {
    ...craftedGear(
      "機関鋼の剣",
      3000,
      "sword",
      { part: "weapon", atk: 60, delay: 1550, needs: { str: 16, dex: 12 }, scale: { str: "C", dex: "C" } },
      80,
      "沈んだ機関の芯の鋼を打ち延べた剣。いまの炉では、この硬さは出せない。",
      "rare",
    ),
    milestone: 32,
  },
  "reforged-blade": {
    ...craftedGear(
      "打ち直した古剣",
      9000,
      "sword",
      { part: "weapon", atk: 90, delay: 1500, needs: { str: 22, dex: 16 }, scale: { str: "B", dex: "C" } },
      85,
      "大戦の機関の鋼を、魔物と仕事のためだけに打ち直した。打つ前に結晶を砕き、人に向けないと祈るのが習わし。",
      "treasure",
    ),
    milestone: 64,
  },
  "lined-coat": {
    ...craftedGear("冬毛の裏地の外套", 1000, "cape", { part: "body", def: 8, bonus: { maxHp: 40 } }, 35, "やわらかい冬毛を裏一面に縫い込んだ外套。夜明け前の霜の中でも震えない。", "rare"),
    milestone: 16,
  },
  "frost-shawl": {
    ...craftedGear(
      "霜の花染めの肩掛け",
      2200,
      "stole",
      { part: "neck", def: 3, bonus: { maxSp: 30 }, look: { neck: "stole", neckRamp: "cSky" } },
      4,
      "霜の花で淡い青に染め、琥珀の樹脂で色を留めた。色が抜けない。",
      "rare",
    ),
    milestone: 32,
  },
  "woven-muffler": {
    ...craftedGear(
      "重ね織りのマフラー",
      7000,
      "muffler",
      { part: "neck", def: 5, bonus: { maxHp: 80, maxSp: 40 }, look: { neck: "muffler", neckRamp: "cCream", neckStripe: "cSky" } },
      4,
      "淵の主の鱗を細く裂いて、毛糸に織り込んだ。光の加減で、どの世界の色にも見える。",
      "treasure",
    ),
    milestone: 64,
  },

  // ---------------------------------------------------------------- quest items
  "sealed-letter": {
    name: "封をした手紙",
    kind: "key",
    rarity: "common",
    price: 0,
    stack: 1,
    weight: 0,
    icon: "letter",
    description: "蝋で封をした手紙。届け先の名前が丁寧な字で書いてある。",
  },
  "lost-bell": {
    name: "小さな鈴",
    kind: "key",
    rarity: "common",
    price: 0,
    stack: 1,
    weight: 0,
    icon: "bell",
    description: "羊の首に下げる鈴。振ると澄んだ音がする。",
  },
} satisfies Record<string, ItemDefinition>

export type ItemId = keyof typeof DEFINITIONS

export const ITEMS: Readonly<Record<ItemId, ItemDefinition>> = DEFINITIONS

export const ITEM_IDS = Object.keys(ITEMS) as ItemId[]
