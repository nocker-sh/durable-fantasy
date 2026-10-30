// A few lines of the world to read while a map loads (ui.md §3.16): what people in town notice,
// say and do under the falling ash, and what is told of the places on the road. Nothing here adds
// to the world's history; it keeps to what world.md has settled, seen from everyday life.
// A passage with `at` belongs to that map and is shown when going there; the rest go anywhere.

export type Flavor = {
  text: string
  at?: string
}

export const FLAVOR: readonly Flavor[] = [
  // ---------------------------------------------------------------- ash and cold
  { text: "灰は音もなく降る。\n朝いちばんの仕事は、戸口の灰を掃くこと。" },
  { text: "屋根の灰は、積もりきる前に下ろす。\n重くなった灰は、梁をきしませる。" },
  { text: "灰の薄い日に日が差すと、\n町じゅうの人が日向に出てくる。" },
  { text: "降る灰を、女神さまのいない空のため息と呼ぶ人がいる。\n呼ばない人もいる。" },
  { text: "窓の灯りは、灰の中でにじんで見える。\nそれを暖かいと思うかどうかは、帰る家があるかどうかで決まる。" },
  { text: "井戸の桶にはいつも蓋をする。\n開けたままにした水は、灰の味がする。" },
  { text: "洗濯物は家の中に干す。\n外に干せば、乾く前に灰色になる。" },
  { text: "灰は畑に混ぜれば土を肥やし、\n焼き物にかければ艶になる。捨てるところがない。" },
  { text: "寒いのは灰が日を遮るからだと、子どもは教わる。\n大人になると、それでも寒いと言う。" },
  { text: "白い息と灰が混じって、\nどこまでが自分の吐いたものか分からなくなる夜がある。" },
  { text: "夜が長い。\n十時にようやく日が差し、六時にはもう灯りの時間になる。" },
  { text: "長い夜のあいだ、町は眠らない。\n灯りの数だけ、起きている誰かがいる。" },
  { text: "灰を踏む足音は、雪よりも軽い。\n振り返ると、自分の足跡だけが続いている。" },
  // ---------------------------------------------------------------- mufflers and threads
  { text: "首に巻くものは、自分の世界の糸で編む。\n歪みが消えるとき、持ち主を連れ戻すために。" },
  { text: "初めてのマフラーは、たいてい家族が編む。\n巻いてもらった日のことを、誰もがなんとなく覚えている。" },
  { text: "別れ際に、マフラーの端をほどいて糸を渡す。\nまた会えるかは分からないけれど。" },
  { text: "マフラーを巻き忘れて出かけた者は、\n帰ってこないことがある、と昔話は言う。" },
  { text: "他人のマフラーには手を触れない。\nそれだけは、子どもでも知っている。" },
  { text: "編み直したマフラーには、前の糸が少しだけ残る。\n捨てられない色というものがある。" },
  // ---------------------------------------------------------------- the town
  { text: "パン屋の窯は夜明け前から熱い。\n冷えた手を窯の前で温めていく人が、毎朝いる。", at: "phanthiet" },
  { text: "広場の井戸端は、町でいちばん噂の集まる場所。\n灰が降っていても、話はやまない。", at: "phanthiet" },
  { text: "鍛冶場の槌の音は、夜の町の時計のようなもの。\n止むと、少しだけ寂しい。", at: "phanthiet" },
  { text: "礼拝堂の鐘は、迷った人のために鳴る。\n今では、鳴らない日のほうが多い。", at: "phanthiet" },
  { text: "商店通りの灯りは、夜のほうが賑やかだ。\n夜市の屋台に、湯気が上がる。", at: "phanthiet-market" },
  { text: "酒場の戸を開けると、温めた葡萄酒の匂いがする。\n灰を払ってから入るのが、ここの礼儀。", at: "phanthiet-market" },
  { text: "薬屋の天井には、乾かした薬草が下がっている。\n苦い匂いは、よく効く印だと言われる。", at: "phanthiet-market" },
  { text: "職人通りでは、作り手の名前が品物に残る。\n誰が打ったかを、使う人は覚えている。", at: "phanthiet-craft" },
  { text: "共同の炉は、夜遅くまで消えない。\n順番を待つあいだ、職人たちは黙って火を見ている。", at: "phanthiet-craft" },
  { text: "南門の番は、灰の向こうを見張る。\n来る人も、帰る人も、見送る。", at: "phanthiet-gate" },
  { text: "門の外へ出る前に、マフラーを締め直す。\n門番は、それを見てから通す。", at: "phanthiet-gate" },
  // ---------------------------------------------------------------- the road
  { text: "草原のスライムは、叩かなければ寄ってこない。\n叩けば、はじけて小さく逃げていく。", at: "south-meadow" },
  { text: "霜の降りた草の上に、灰がうっすら積もる。\n踏み跡だけが、黒く道になる。", at: "south-meadow" },
  { text: "丘の上の一本木は、遠くからでも見える。\n帰り道の目印にしている人は多い。", at: "south-meadow" },
  { text: "森の入り口では、炭焼きの煙が細く上がる。\n町の冬は、この煙から始まる。", at: "forest-edge" },
  { text: "針葉樹の枝は灰を受けて重く垂れる。\n風が吹くと、灰がまとめて落ちてくる。", at: "forest-edge" },
  { text: "樹海の奥は昼でも暗い。\n苔むした古い壁が、何を守っていたのかは誰も知らない。", at: "deep-forest" },
  { text: "森の霧は、灰を含んで少し重い。\n迷ったら、来た道の踏み跡を探す。", at: "deep-forest" },
  { text: "赤い砂丘には、半分埋もれた歩く機関が眠っている。\n錆びた脚は、もう二度と動かない。", at: "red-dunes" },
  { text: "浜の網小屋には、乾かした魚が並ぶ。\n海の魚は、ここから町まで背負って運ばれる。", at: "net-sheds" },
  { text: "崖道の見張り塔は崩れて久しい。\n今は、海鳥が巣をかけている。", at: "sea-cliff" },
  { text: "峠の祭壇には、誰も祈っていない。\nそれでも、石を一つ積んでいく人がいる。", at: "mountain-pass" },
  // ---------------------------------------------------------------- the world, as people tell it
  { text: "世界の真ん中には、枯れた大樹が立っている。\nどこからでも、その影だけは見える。" },
  { text: "結晶は砕けば力になり、記憶ごと消える。\nだから砕く前に、少しだけ耳を当てる人がいる。" },
  { text: "女神さまのことを、町の人は出ていった家族のように話す。\n恨み言半分、懐かしさ半分で。" },
  { text: "知らない顔の旅人がいても、誰も驚かない。\n歪みは、ずっと前から日常のこと。" },
  { text: "同じ顔の住人が、自分のことを知らない日がある。\nそういう日は、少しだけ遠回りして帰る。" },
  { text: "終わりは、ゆっくり来るものだと皆が知っている。\nだから今夜のスープを、ちゃんと温める。" },
]

/** A passage for going to `map`: one of that place's, or one from anywhere, at random. */
export function flavorFor(map: string, random = Math.random): Flavor {
  const here = FLAVOR.filter((f) => !f.at || f.at === map || map.startsWith(`${f.at}-in-`))
  return here[Math.floor(random() * here.length)] ?? FLAVOR[0]
}
