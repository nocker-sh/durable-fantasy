---
{
  "id": "resident-ニクラス",
  "kind": "residents",
  "title": "ニクラス",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "baskets",
  "buildings": [
    "building-h-c3"
  ],
  "bedroom_candidates": [
    "room-h-c3-niklas"
  ],
  "work": "木工所の小僧",
  "relationships": [
    {
      "a": "エマ",
      "b": "ニクラス",
      "kind": "親子",
      "note": ""
    },
    {
      "a": "ニクラス",
      "b": "フリーダ",
      "kind": "兄妹",
      "note": "兄の真似をして柳を削る"
    },
    {
      "a": "ローゼマリー",
      "b": "ニクラス",
      "kind": "祖母と孫",
      "note": ""
    },
    {
      "a": "ゴットフリート",
      "b": "ニクラス",
      "kind": "師弟",
      "note": "無愛想な親方の下で、木を運ぶところから"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h-c3-niklas",
  "bed_id": "bed-h-c3-3-2",
  "design_dependencies": [
    "building-h-c3",
    "room-woodworker-1",
    "room-h-c3-niklas"
  ],
  "storage_ids": [
    "storage-h-c3-3-2"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ニクラス"
  },
  "work_rooms": [
    "room-woodworker-1"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ニクラス"
  }
}
---
# ニクラス


## 暮らしの立場

ニクラスは木工所の小僧。籠編みのエマに属し、エマ、フリーダ、ローゼマリーという世帯構成で暮らす。仕事と収入のつながりは籠と笊を編む（柳は川べりから）。ニクラスは木工所で働く。

## 人柄と話し方

性格は真面目、背伸びしたがり、母思い。話し方は「おれ。少しかしこまった若者口調」。口癖は「早く一人前に」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-h-c3-niklas]] の bed-h-c3-3-2 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。

## 木工所の仕事と寝床

仕事先は[[room-woodworker-1]]へ結ぶ。ゴットフリートとアントンが同居し、ニクラスは自分の世帯から働きに来る関係を保持する。工房の材料・完成品と家族の食卓・寝床を分け、屋外での長材と搬入、夜食と帰宅を含む日課、立体と描画の照合は残る。
