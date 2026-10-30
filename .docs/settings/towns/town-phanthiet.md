---
{
  "id": "town-phanthiet",
  "kind": "towns",
  "title": "ファンティエット",
  "status": "設計中",
  "source": ".docs/world/world.md",
  "design_gate": "未通過",
  "world_instances": "共通設計。並行世界ごとの住民差は未決",
  "implementation": "町と建物あり",
  "maps": [
    "map-phanthiet",
    "map-phanthiet-market",
    "map-phanthiet-craft",
    "map-phanthiet-gate",
    "map-phanthiet-in-bakery",
    "map-phanthiet-in-inn",
    "map-phanthiet-in-tavern",
    "map-phanthiet-in-apothecary",
    "map-phanthiet-in-general",
    "map-phanthiet-in-tailor",
    "map-phanthiet-in-crystal",
    "map-phanthiet-in-buyer",
    "map-phanthiet-in-h-m5",
    "map-phanthiet-in-armorer",
    "map-phanthiet-in-woodworker",
    "map-phanthiet-in-leather",
    "map-phanthiet-in-h-c2",
    "map-phanthiet-in-warehouse",
    "map-phanthiet-in-h-m5-floor-2"
  ],
  "issues": [
    "全建物のグリッド再設計と生活の照合未完了",
    "共同設備の管理担当・上下流・廃棄物処理の位置と日課の設計未完了"
  ],
  "facilities": [
    "facility-square-well",
    "facility-market-well",
    "facility-gate-well",
    "facility-square-washing",
    "facility-bakery-oven",
    "facility-h8-privy",
    "facility-h8-treatment",
    "facility-h8-nonfood-plot",
    "facility-h7-garden",
    "facility-h6-garden",
    "facility-h4-garden",
    "facility-h7-wool-preparation",
    "facility-square-pasture",
    "facility-square-windmill"
  ],
  "supply_systems": [
    {
      "id": "domestic-water",
      "resource": "生活用水",
      "sources": [
        "facility-square-well",
        "facility-market-well",
        "facility-gate-well"
      ],
      "carriers": [
        "resident-リーゼル"
      ],
      "delivery": "各世帯が汲み、リーゼルの水運びは日課内の補助",
      "storage": "各世帯の蓋付き容器。飲用と洗濯・掃除を分離",
      "unresolved": [
        "職人通りの取水と運搬経路",
        "井戸管理の具体的な担当と時刻",
        "水源と汚水処理の地形上の分離"
      ]
    },
    {
      "id": "milling",
      "resource": "麦・粉・ふすま",
      "sources": [
        "building-farmhouse"
      ],
      "processing": [
        "facility-square-windmill"
      ],
      "destinations": [
        "room-bakery-2"
      ],
      "handlers": [
        "resident-カール"
      ],
      "unresolved": [
        "稼働する風車の敷地と内部、原料と粉・ふすまの数量・保管と行き先",
        "カールの他の仕事と両立する製粉・受渡しとパン屋への搬入"
      ]
    },
    {
      "id": "bread",
      "resource": "粉・薪・生地・パン",
      "sources": [
        "facility-square-windmill",
        "resident-ヨーゼフ"
      ],
      "processing": [
        "room-bakery-2",
        "facility-bakery-oven"
      ],
      "destinations": [
        "room-bakery-1"
      ],
      "unresolved": [
        "製粉から台所と窯までの受渡し・搬入路と日課",
        "冷却と灰よけの設備",
        "窯と隣地の離隔"
      ]
    },
    {
      "id": "ash",
      "resource": "降灰と炉の灰",
      "handlers": [
        "resident-ベルンハルト",
        "resident-トビアス",
        "resident-モニカ"
      ],
      "reuse": "降灰の再利用先は陶工と畑。炉灰・煤・混ざり物は分けて扱いを設計する",
      "unresolved": [
        "灰の冷却・保管と集荷地点",
        "再利用しないものの行き先",
        "運搬の担当と日課"
      ]
    },
    {
      "id": "waste-water",
      "resource": "洗濯水・台所の汚水・排泄物",
      "sources": [
        "facility-square-washing",
        "room-bakery-2"
      ],
      "policy": "清潔な水・食品・灰の容器と混ぜず、行き先のない排水溝を描かない",
      "unresolved": [
        "便所の方式と配置",
        "汚水の受け口・処理場所・維持担当",
        "下流の取水と畑との位置関係"
      ]
    }
  ],
  "design_dependencies": [
    "map-phanthiet",
    "map-phanthiet-market",
    "map-phanthiet-craft",
    "map-phanthiet-gate",
    "map-phanthiet-in-bakery",
    "map-phanthiet-in-inn",
    "map-phanthiet-in-tavern",
    "map-phanthiet-in-apothecary",
    "map-phanthiet-in-general",
    "map-phanthiet-in-tailor",
    "map-phanthiet-in-crystal",
    "map-phanthiet-in-buyer",
    "map-phanthiet-in-h-m5",
    "map-phanthiet-in-armorer",
    "map-phanthiet-in-woodworker",
    "map-phanthiet-in-leather",
    "map-phanthiet-in-h-c2",
    "map-phanthiet-in-warehouse",
    "facility-square-well",
    "facility-market-well",
    "facility-gate-well",
    "facility-square-washing",
    "facility-bakery-oven",
    "facility-h8-privy",
    "facility-h8-treatment",
    "facility-h8-nonfood-plot",
    "facility-h7-garden",
    "facility-h6-garden",
    "facility-h4-garden",
    "facility-h7-wool-preparation",
    "facility-square-pasture",
    "facility-square-windmill"
  ]
}
---
# ファンティエット

## 都市の役割

ファンティエットは畑と市場と鍛冶場がある、プレイヤーのホームタウンである。都市の位置づけは [[world#場所]] を変更せずに引き継ぐ。

## 設計する生活

食料、水、燃料、衣服、道具、住まい、排水、排泄物と灰の回収を都市内外の経路としてつなぐ。住民は世帯と仕事を持ち、仕事のための建物と眠る部屋を持つ。公共の設備には管理する住民と維持の仕事を割り当てる。

## 地区と建物

広場、商店通り、職人通り、南門の各マップ資料と、所属する全建物・部屋・住民資料を参照する。

## グラフィックへ進む条件

各地区の物流と生活、各建物の全階、各部屋の家具と動線をグリッドで検証し、資料間の参照と矛盾を解消してから描画へ渡す。未設計の対象はメタデータへ残し、完成した都市として扱わない。

## 水と洗濯

広場・商店通り・南門の井戸を生活用水の受け口とする。各世帯は自分で汲むことを基本とし、リーゼルが全世帯へ常時配水する設定にはしない。職人通りには現在、井戸の定義がないため、別地区から運ぶ経路か地区の共同設備を設計する必要がある。

[[facility-square-washing]] は飲用水の取水場所ではない。洗った物は各世帯の室内へ持ち帰る。屋外の洗濯物干しを、灰の降る世界の生活の表現として置かない。

## 食品と燃料

粉とパン、野菜、魚、果物は、作る人から売る人へ運ばれる。パン屋は家庭の台所と [[facility-bakery-oven]] を使い分ける。生地と焼き上がりのパンには灰を避ける覆いと置き場が必要である。ヨーゼフの薪と炭は仕事用と家庭用の両方へ届く経路を持つが、一日の配送量や運搬担当はまだ確定していない。

## 灰と汚水

灰の再利用は世界観で決まっているが、降灰、炉の灰、煤と混ざり物をすべて同じ袋で扱う設計にはしない。ベルンハルトとトビアスの作業、モニカの売る仕事をつなぎ、家庭が冷まして蓋をしておく場所を決める。

便所と汚水の処理場所は現行資料に欠けている。場所と維持する人を決める前に、地面へ溝や配管を描いて解決したことにしない。飲用水の井戸、食品を扱う場所、洗濯場との関係を地形上で確定するまでは設計未完了である。


## 羊毛の手入れ場の未配置の案

[[facility-h7-wool-preparation]] の設備は敷地をまだ割り当てていない案であり、現行の町や家庭の室内へ採用していない。処理用水と汚水の一時保管、羊の世話と家の仕事・受渡しを、敷地と身体・時間へ続けて照合する。

牧草地の所有と入口・飼育と手入れは [[facility-square-pasture]] を参照する。


## 麦からパンまでの製粉の接続

[[facility-square-windmill]] を農家からパン屋へ渡す粉の工程として持つ。現在の回る外観を稼働する設備の証明とせず、麦と粉・ふすまの在庫、敷地と機構・操作面、搬入と日課を設計する。薪の供給を麦の製粉と混同せず、パン屋では粉と燃料を別々に受け取る。
