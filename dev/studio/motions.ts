// Every baked clip with a Japanese label, the item it is shown with and the prop that
// explains it (a tree to chop, a well to draw from, water to swim in...).
import type { Item } from "#/world/scene/figure/look"
import type { PropKind } from "./props"

export type Motion = {
  clip: string
  label: string
  cat: string
  item?: Item
  prop?: PropKind
  /** pelvis height when seated (the chibi legs are shorter than the seat) */
  seatY?: number
  /** sprite px to sink the body (swimming sits low in the water) */
  sink?: number
}

export const CATEGORIES = ["基本", "移動", "暮らし", "剣・盾", "格闘", "魔法・道具", "やられ", "その他"] as const

export const MOTIONS: Motion[] = [
  // 基本
  { clip: "Idle_A", label: "待機", cat: "基本" },
  { clip: "Idle_FoldArms", label: "腕を組む", cat: "基本" },
  { clip: "Idle_Talking", label: "話す", cat: "基本" },
  { clip: "Idle_TalkingPhone", label: "電話で話す", cat: "基本" },
  { clip: "Idle_ShakeOff", label: "体をほぐす", cat: "基本" },
  { clip: "Yes", label: "うなずく", cat: "基本" },
  { clip: "Dance_Simple", label: "踊る", cat: "基本" },
  { clip: "Idle_Rail", label: "柵にもたれる", cat: "基本", prop: "fence" },
  { clip: "Idle_Rail_Call", label: "柵から呼ぶ", cat: "基本", prop: "fence" },
  { clip: "Sitting_Enter", label: "座る", cat: "基本", prop: "bench" },
  { clip: "Sitting_Idle", label: "座って待つ", cat: "基本", prop: "bench", seatY: 0.44 },
  { clip: "Sitting_Talking", label: "座って話す", cat: "基本", prop: "bench", seatY: 0.44 },
  { clip: "Sitting_Exit", label: "立ち上がる", cat: "基本", prop: "bench" },
  { clip: "LayToIdle", label: "寝床から起きる", cat: "基本", prop: "mat" },
  // 移動
  { clip: "Walk", label: "歩く", cat: "移動" },
  { clip: "Walk_Formal", label: "しずしず歩く", cat: "移動" },
  { clip: "Walk_Carry", label: "荷物を運ぶ", cat: "移動", item: "sack" },
  { clip: "Jog", label: "走る", cat: "移動" },
  { clip: "Sprint", label: "全力で走る", cat: "移動" },
  { clip: "Crouch_Idle", label: "しゃがむ", cat: "移動", prop: "bush" },
  { clip: "Crouch_Walk", label: "しゃがみ歩き", cat: "移動", prop: "bush" },
  { clip: "Jump_Start", label: "ジャンプ（踏み切り）", cat: "移動", prop: "hurdle" },
  { clip: "Jump_air", label: "ジャンプ（空中）", cat: "移動", prop: "hurdle" },
  { clip: "Jump_Land", label: "ジャンプ（着地）", cat: "移動", prop: "hurdle" },
  { clip: "NinjaJump_Start", label: "大ジャンプ（踏み切り）", cat: "移動", prop: "hurdle" },
  { clip: "NinjaJump_Idle", label: "大ジャンプ（空中）", cat: "移動", prop: "hurdle" },
  { clip: "NinjaJump_Land", label: "大ジャンプ（着地）", cat: "移動", prop: "hurdle" },
  { clip: "Roll", label: "前転", cat: "移動" },
  { clip: "Roll_RM", label: "前転（移動つき）", cat: "移動" },
  { clip: "Slide_Start", label: "スライディング（入り）", cat: "移動" },
  { clip: "Slide", label: "スライディング", cat: "移動" },
  { clip: "Slide_Exit", label: "スライディング（立つ）", cat: "移動" },
  { clip: "ClimbUp_1m_RM", label: "段差をよじ登る", cat: "移動", prop: "wall" },
  { clip: "Swim_Idle", label: "立ち泳ぎ", cat: "移動", prop: "pond", sink: 14 },
  { clip: "Swim_Fwd", label: "泳ぐ", cat: "移動", prop: "pond", sink: 22 },
  { clip: "Push", label: "箱を押す", cat: "移動", prop: "crate" },
  { clip: "Driving", label: "荷車を操る", cat: "移動", prop: "cart" },
  // 暮らし
  { clip: "Chop_Tree", label: "木を切る", cat: "暮らし", item: "axe", prop: "tree" },
  { clip: "Farm_PlantSeed", label: "種をまく", cat: "暮らし", item: "basket", prop: "field" },
  { clip: "Farm_Watering", label: "水をやる", cat: "暮らし", item: "bucket", prop: "sprouts" },
  { clip: "Farm_Harvest", label: "収穫する", cat: "暮らし", item: "basket", prop: "crops" },
  { clip: "Interact", label: "井戸の水をくむ", cat: "暮らし", prop: "well" },
  { clip: "Fixing_Kneeling", label: "ひざをついて洗う", cat: "暮らし", prop: "tub" },
  { clip: "PickUp_Table", label: "台から取る", cat: "暮らし", prop: "table" },
  { clip: "Chest_Open", label: "宝箱を開ける", cat: "暮らし", prop: "chest" },
  { clip: "Consume", label: "飲む・食べる", cat: "暮らし", prop: "table" },
  { clip: "Idle_Lantern", label: "ランタンを掲げる", cat: "暮らし", prop: "lamppost" },
  { clip: "Idle_Torch", label: "松明を掲げる", cat: "暮らし", prop: "brazier" },
  // 剣・盾
  { clip: "Idle_Sword", label: "剣を構える", cat: "剣・盾", item: "sword", prop: "dummy" },
  { clip: "Sword_Regular_Combo", label: "剣の連撃", cat: "剣・盾", item: "sword", prop: "dummy" },
  { clip: "Sword_Regular_A", label: "斬る 1", cat: "剣・盾", item: "sword", prop: "dummy" },
  { clip: "Sword_Regular_A_Rec", label: "斬る 1（戻り）", cat: "剣・盾", item: "sword", prop: "dummy" },
  { clip: "Sword_Regular_B", label: "斬る 2", cat: "剣・盾", item: "sword", prop: "dummy" },
  { clip: "Sword_Regular_B_Rec", label: "斬る 2（戻り）", cat: "剣・盾", item: "sword", prop: "dummy" },
  { clip: "Sword_Regular_C", label: "斬る 3", cat: "剣・盾", item: "sword", prop: "dummy" },
  { clip: "Sword_Regular_C_RM", label: "斬る 3（踏み込み）", cat: "剣・盾", item: "sword", prop: "dummy" },
  { clip: "Sword_Attack", label: "大きく斬りかかる", cat: "剣・盾", item: "greatsword", prop: "dummy" },
  { clip: "Sword_Attack_RM", label: "大きく斬りかかる（踏み込み）", cat: "剣・盾", item: "greatsword", prop: "dummy" },
  { clip: "Sword_Dash_RM", label: "踏み込み斬り", cat: "剣・盾", item: "sword", prop: "dummy" },
  { clip: "Sword_Block", label: "剣で受ける", cat: "剣・盾", item: "sword", prop: "dummy" },
  { clip: "Idle_Shield", label: "盾を構える", cat: "剣・盾", item: "mace", prop: "dummy" },
  { clip: "Idle_Shield_Break", label: "盾を崩される", cat: "剣・盾", item: "mace", prop: "dummy" },
  { clip: "Shield_OneShot", label: "盾で殴る", cat: "剣・盾", item: "mace", prop: "dummy" },
  { clip: "Shield_Dash_RM", label: "盾で突進", cat: "剣・盾", item: "mace", prop: "dummy" },
  // 格闘
  { clip: "Punch_Jab", label: "ジャブ", cat: "格闘", prop: "dummy" },
  { clip: "Punch_Cross", label: "ストレート", cat: "格闘", prop: "dummy" },
  { clip: "Melee_Hook", label: "フック", cat: "格闘", prop: "dummy" },
  { clip: "Melee_Hook_Rec", label: "フック（戻り）", cat: "格闘", prop: "dummy" },
  // 魔法・道具
  { clip: "Spell_Simple_Enter", label: "呪文（構え）", cat: "魔法・道具", item: "staff", prop: "target" },
  { clip: "Spell_Simple_Idle", label: "呪文（ため）", cat: "魔法・道具", item: "staff", prop: "target" },
  { clip: "Spell_Simple_Shoot", label: "呪文（放つ）", cat: "魔法・道具", item: "staff", prop: "target" },
  { clip: "Spell_Simple_Exit", label: "呪文（解く）", cat: "魔法・道具", item: "staff", prop: "target" },
  { clip: "OverhandThrow", label: "投げる", cat: "魔法・道具", prop: "target" },
  { clip: "Pistol_Idle", label: "銃を構える", cat: "魔法・道具", prop: "target" },
  { clip: "Pistol_Aim_Neutral", label: "銃で狙う", cat: "魔法・道具", prop: "target" },
  { clip: "Pistol_Aim_Up", label: "銃で上を狙う", cat: "魔法・道具", prop: "target" },
  { clip: "Pistol_Aim_Down", label: "銃で下を狙う", cat: "魔法・道具", prop: "target" },
  { clip: "Pistol_Shoot", label: "撃つ", cat: "魔法・道具", prop: "target" },
  { clip: "Pistol_Reload", label: "弾をこめる", cat: "魔法・道具", prop: "target" },
  // やられ
  { clip: "Hit_Chest", label: "胴に受ける", cat: "やられ", item: "sword" },
  { clip: "Hit_Head", label: "頭に受ける", cat: "やられ", item: "sword" },
  { clip: "Hit_Knockback", label: "吹き飛ぶ", cat: "やられ", item: "sword" },
  { clip: "Hit_Knockback_RM", label: "吹き飛ぶ（移動つき）", cat: "やられ", item: "sword" },
  { clip: "Death_D", label: "倒れる", cat: "やられ", item: "sword" },
  // その他
  { clip: "Zombie_Idle", label: "ゾンビ（待機）", cat: "その他", prop: "grave" },
  { clip: "Zombie_Walk", label: "ゾンビ（歩く）", cat: "その他", prop: "grave" },
  { clip: "Zombie_Scratch", label: "ゾンビ（ひっかく）", cat: "その他", prop: "grave" },
]
