---
{
  "id": "building-guardhouse",
  "kind": "buildings",
  "title": "門の詰所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-gate",
  "household": "guards",
  "residents": [
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
  ],
  "rooms": [
    "room-guardhouse-1",
    "room-guardhouse-gear",
    "room-guardhouse-entry",
    "room-guardhouse-dining",
    "room-guardhouse-2",
    "room-guardhouse-lower-stairs",
    "room-guardhouse-upper-stairs",
    "room-guardhouse-upper-hall",
    "room-guardhouse-drying",
    "room-guardhouse-3",
    "room-guardhouse-4",
    "room-guardhouse-stefan",
    "room-guardhouse-veronika"
  ],
  "role": "home",
  "issues": [
    "敷地と門・道・隣家・地形、戸と窓・梁は未照合",
    "交代と警備・街灯と食事・睡眠、油と道具・生活設備と日課・立体は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-guardhouse-1",
    "room-guardhouse-gear",
    "room-guardhouse-entry",
    "room-guardhouse-dining",
    "room-guardhouse-2",
    "room-guardhouse-lower-stairs",
    "room-guardhouse-upper-stairs",
    "room-guardhouse-upper-hall",
    "room-guardhouse-drying",
    "room-guardhouse-3",
    "room-guardhouse-4",
    "room-guardhouse-stefan",
    "room-guardhouse-veronika",
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ",
    "building-general"
  ],
  "runtime_layout_omissions": {
    "source": "world/town/floorplan/floor-plan.ts",
    "rooms": [
      {
        "floor": 0,
        "name": "台所"
      }
    ]
  },
  "floor_levels": [
    {
      "floor": 0,
      "elevation_m": 0,
      "ceiling_elevation_m": 2.32
    },
    {
      "floor": 1,
      "elevation_m": 2.52,
      "ceiling_elevation_m": 4.72
    }
  ],
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 4.72,
    "ridge_underside_m": 6.5,
    "overhang_m": 0.3,
    "material": "roof"
  },
  "stair_sections": [
    {
      "lower_room": "room-guardhouse-lower-stairs",
      "upper_room": "room-guardhouse-upper-stairs",
      "furniture": "S",
      "risers": 14,
      "going_m": 0.28,
      "axis": "y",
      "landing_depth_m": 1,
      "clear_width_m": 0.9,
      "lower_end": "end",
      "opening_length_m": 3.64,
      "rail_inset_m": 0.05
    }
  ],
  "workers": [
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 27,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-guardhouse-1",
          "room-guardhouse-gear",
          "room-guardhouse-entry",
          "room-guardhouse-dining",
          "room-guardhouse-2",
          "room-guardhouse-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-guardhouse-upper-stairs",
          "room-guardhouse-upper-hall",
          "room-guardhouse-drying",
          "room-guardhouse-3",
          "room-guardhouse-4",
          "room-guardhouse-stefan",
          "room-guardhouse-veronika"
        ]
      }
    ]
  }
}
---
# 門の詰所

## 四人の勤務と生活

オイゲンとディーター、シュテファン、ヴェロニカが暮らし、町の警備と街灯点けを行う。油は道具屋から受け取り、給金は町の寄り合いから受け取る既存の設定を維持する。家族の相部屋へ置き換えず、昼番と夜番の睡眠を個室に分ける。勤務と帰宅・睡眠の時刻は `world/town/routines.ts` を正とし、この資料で変更しない。

## 当直の準備と食事、寝床

[[room-guardhouse-1]] に引継ぎと地図・鍵と記録、[[room-guardhouse-gear]] に槍と防具・街灯の油と道具を分ける。[[room-guardhouse-entry]] は勤務からの出入りと [[room-guardhouse-dining]]・[[room-guardhouse-2]]・階段を結ぶ。食卓は四人それぞれの席を持つが、交代で食べる案とし、四人が同時に警備を離れる前提にしない。

[[room-guardhouse-lower-stairs]] と [[room-guardhouse-upper-stairs]]、[[room-guardhouse-upper-hall]] から [[room-guardhouse-3]]・[[room-guardhouse-4]]・[[room-guardhouse-stefan]]・[[room-guardhouse-veronika]] へ別々に入る。既存の寝台と衣服箱のIDを維持し、寝る時間の違う人の寝室を通り抜けない。[[room-guardhouse-drying]] は共用の衣服と寝具の手入れに使う。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。門と巡回・街灯の作業と油の運搬、引継ぎと警備の空白・交代の食事と調理・昼と夜の睡眠・遮光と物音、油の容器と量・漏れと火・装備の長さと手入れ、敷地と道・隣家・地形と構造、便所と給排水・暖房、四人の衣服と寝具の乾燥量、立体を詰めてから描画へ渡す。現行の独立した台所の未対応の記録は維持する。
