# コードの作り

ディレクトリの役割と依存の向きは `AGENTS.md` の「ディレクトリ構成」で決めてある。この文書は、それらがどうつながって動くかを書く。言葉の意味は [[glossary]]、サーバーの決まりは [[game-system]] にある。

## 操作が流れる順

店での売買は `world/core/buy.ts` と `sell.ts`、頼まれごとの受注と完了は `world/core/take-errand.ts` と `hand-errand.ts` が扱う。`apply.ts` は共通の回復・行動不能の確認を済ませてから各操作へ振り分ける。頼まれごとは種類に応じて材料、または届け先と荷物を必須とする型にし、処理側で欠落を補わない。購入前の品揃え・品質と価格の確認は `get-shop-purchase.ts` が受け持ち、所持金・重量・収納を確認してから品と代金・一日ごとの親しさを一緒に確定する。

倉庫の預け入れ・引き取りは `world/core/storage/store.ts` と `retrieve.ts` が扱い、共通の回復・行動不能の判定後に呼ぶ。料金、品質を保った移し替え、空き枠・重量の判定をここにまとめる。店と倉庫の一日一回の親しさ更新は `commerce-friendship.ts` を共用する。親しさの定数は `friendship-rules.ts`、増加は `befriend.ts`、値引き率と価格への適用は `friend-discount.ts` と `friend-price.ts`、頼まれごとと親しさ更新の日付は `day-of.ts` が定義し、売買や製作から頼まれごとの定義表を参照しない。

攻撃技・魔法・祈りの効果の型は `world/core/skill-types.ts` で種類ごとに分け、定義表は `skills.ts` に置く。`art-swing.ts` の攻撃計算は物理技と魔法の効果だけを受け取り、必要な倍率・能力値の指定漏れを既定値で補わない。祈りと応急手当の回復は `cast.ts`、攻撃技の消費は `pay-art.ts` が扱い、`get-skill-unavailable-reason.ts` で武器・習熟・待ち時間・SP の判定順を共有する。討伐報酬・経験値分配・被弾・復活は `loot.ts`・`share.ts`・`hurt.ts`・`revive.ts` に置き、討伐者と分配を受ける仲間の成長と回復は `grow-combat-player.ts` を使う。共通の自然回復と行動不能の確認は引き続き `apply.ts` が先に行う。

店全体の営業と、会話相手本人の店番は `world/maps/keeper-present.ts` の `keeperPresent` を共用して判定する。交代相手が営業していても、休んでいる本人には買い物や製作依頼を出さない。会話の選択時にも現在の店番を確認する。

採集道具の選択は `world/core/gathering-tool.ts` で行い、袋と装備中の使用可能な道具を品質込みの性能で比べる。同じ性能なら装備中を優先する。選んだ道具の所在を型で区別し、採集成功時だけその道具の耐久を減らす。

製作依頼の受注と受け取りは `world/core/commission/order.ts` と `collect.ts` の状態遷移で扱う。`apply.ts` は共通の回復・行動不能判定を済ませてから呼び出す。材料や所持金が不足した受注、持ち物が満杯の受け取りでは、依頼・材料・代金を変更しない。

ブラウザでは `world/game.ts` の Game がゲーム全体を持つ。Game は three.js の場面、キー入力、部屋との接続、プレイヤーのデータを持ち、画面に出すものを一つの値（`world/state.ts`）にまとめる。React の部品（`components/`）は、`components/game/game-provider.tsx` で同じ Game の参照を共有し、`hooks/use-game.ts` と `use-game-state.ts` を通して操作と購読を行う。ゲームの状態を React 側で持ち直さない。セッションの状態と、接続・サーバー通知・会話・生産や装備操作・交流の処理は `world/client/` が受け持つ。各処理は `world/client/game-session.ts` の同じ GameSession を参照し、`create-session-context.ts` から必要な操作だけを渡される。`world/parts/` はキー入力、開いている窓、部屋の先読み、会話の選択肢、出来事の知らせなどを受け持つ。

製作依頼の残り時間は、表示中の職人に未完成の注文がある間だけ更新する。閉じた窓、注文のない窓、すべて完成した窓にはタイマーを残さない。期限の更新には `hooks/use-deadline-clock.ts` を使い、長い製作待ちは低い頻度で更新しつつ最後の期限では完成表示へ切り替える。

プレイヤーの経路移動は実際の経過時間から距離を計算し、マスの境界で余った距離も次の区間に使う（`lib/engine/path-follower.ts`）。速度の設定は生成時に固定し、`advance-path-waypoint.ts` が一区間の位置と距離の消費を扱う。各更新の残距離・通過した点数・向きは呼出し内だけに保持し、呼出し元の座標と経路の配列を更新する。低い描画頻度でもサーバーと同じ歩行速度を保ち、停止中に経過した時間も現在の経路の終点まで反映する。演出の時間刻みの上限は移動距離に使わない。

経路探索の候補の優先順位は `lib/engine/min-priority-queue.ts` が管理する。ヒープの作業配列を外へ渡さず、探索のたびに独立したキューを作る。格子の設定は名前付きの入力で渡し、大きさ・解像度と短縮時の余白は生成時に固定する。障害物の配列の中身は最新の値を読む。短縮時の余白は `world/scene/path.ts` が渡し、エンジンでゲームの値を決めない。モンスターは身体の余白を通行格子側で検査してセル経路を要求するため、短縮時の余白を追加しない。

A* 探索のコスト・前のセル・候補の展開は `lib/engine/grid-path-search.ts` に分ける。探索ごとに独立した作業配列を作り、障害物の更新を読み、同じ優先度の候補の順も維持する。`lib/engine/grid-pathfinder.ts` は端点の補正と探索・経路の短縮を組み立てる。設定の検査は `assert-pathfinder-grid.ts`、設定の共有型は `grid-pathfinder-types.ts` に置く。経路探索と曲線の平面座標は `vector2-types.ts` の `Vector2Tuple` を直接参照し、処理のクラスを型だけの依存元にしない。塞がれた端点の補正は `lib/engine/get-nearby-free-grid-cell.ts` が持ち、候補の範囲と周回・行の順を保つ。前のセルへの参照からの経路点の復元は `lib/engine/get-grid-waypoints.ts` が担い、開始点へ届かない参照や循環から部分的な経路を作らない。

地面の形と配置の共有型は `world/maps/layout-types.ts`、地形の機能がないことを表す定数は `empty-layout-features.ts` に置く。中央の広場と周囲の地区の配置は `layout.ts` の `SQUARE_LAYOUT` が持つ。河川の座標列は一度だけ生成し、共同洗濯場の基準位置も同じ点列から求める。`lib/engine/get-nearest-polyline-x.ts` は行に最も近い標本の x 座標を返し、標本の間の補間とは区別する。各地区と野外の地面は `world/maps/layouts/` に一つずつ置き、`ground-layouts.ts` は野外の定義の対応と外縁を加えた配置だけを組み立てる。共通の空き地の初期値は `ground-layout-bases.ts`、土道の補間は `get-dirt-road.ts`、海岸・砂丘・崖・峠はそれぞれの地形関数を使う。`with-rimmed-layout.ts` は元の地形に閉じた外縁の高さを加え、`get-ground-rim-height.ts` は同じ位置のノイズを各辺で共有する。

`world/maps/layouts.ts` は地図の選択と町の踏み跡を加えた配置の保持を担当する。地図名は `Map` で照会し、継承したプロパティを地図として使わない。戸口の壁ごとの座標と外向きは `get-house-door-approach.ts`、描画用の踏み跡は `get-house-door-trail.ts`、道路上の最近点は `get-nearest-road-point.ts` が持つ。線分への射影は `lib/engine/get-nearest-segment-point.ts` を使う。踏み跡は通行判定を変えない。地面の保存識別子には地図選択・踏み跡の計算・家と戸口の定義も含め、参照の検査は地図選択からの依存も辿る。識別子の組立ては `lib/engine/get-source-fingerprint.ts`、文字列のハッシュは `get-string-hash.ts` に分ける。既存の保存形式に合わせてパス順の内容を結合し、文字列は UTF-16 の各符号単位を順に処理する。

地面の高さは `world/scene/helpers/world/compute-h.ts` が基礎、広場、台地と階段、川、共同洗濯場、野外の地形の順で組み立てる。各段は同じ場所と地面定義の読取り専用の文脈を受け取り、高さを返す。階段は台地や洗い場の高さより後に適用する。野外の地形の混合では道路の線分からの距離を使い、地形の関数へ渡す道路距離は生成中の道路の標本から読む。これらの二つの距離と、地面の格子を作る順序は混同しない。格子の生成は `compute-fields.ts` が行を先に、各行の列を後に走査し、`sample-ground-field-cell.ts` が川・道路・踏み跡・路面の種類を高さより先に書く。道路の形状は `get-ground-road-paths.ts` が固定し、揺らぎを含む距離と勝った路面の種類は `get-road-field-sample.ts` が組で返す。道がなければ既存の未配置の値を返し、道路用のノイズは計算しない。踏み跡の距離は `get-trail-field-distance.ts` が持つ。

経路の短縮は `lib/engine/get-shortened-path.ts` に分け、見通しの判定を探索側から渡す。見通しを単調と仮定せず遠い候補から調べ、短縮できない区間では元の隣接点を残す。

キーを押し続けた移動では、既存の経路をそのフレームの経過時間だけ進めてから、次の経路を作って送信する。新しく送った経路に直前のフレームの待ち時間を使うと、サーバーが経路を受け取るより先に進みすぎるため、入力と移動更新の順序を保つ。

生き物の出現定義は `world/core/monsters.ts` に置き、`spawn-of.ts` と `spawns-on.ts` が読み込み時に ID とマップの索引を作る。戦闘の対象検索は前者、マップ入場・復活確認・描画の生成は後者を共有する。マップ内の全 HP を読むときに各個体を全定義から探し直さず、定義順を保った読み取り専用の一覧を使う。未知のマップには空の一覧を返し、問い合わせのたびに索引を増やさない。

移動先に着いて行う会話・採集と、戦闘の追跡は `world/scene/runtime/action-target.ts` の `PendingAction` が一つだけ保持する。新しい行動は前の予約を置き換える。到着した会話・採集は通知前に取り出して消費し、通知中に設定された次の行動を同じ到着で実行しない。戦闘は短い追跡経路の到着では消費せず、停止・別の行動・対象の戦闘終了で解除する。 敵への接近は、攻撃範囲内の空きマスへ実際に経路を引けることまで確かめる。最初の候補が到達不能なら周囲の別候補を試し、経路が受理された時点で探索を止める。

プレイヤーの状態の公開順は、保存形式の版とは別の `PlayerState.revision` で表す。`world/server/publish-player.ts` が番号を進め、Player DO は返す状態もこの値にそろえる。対面取引のコーディネーターが本人の状態を変更する経路も含める。クライアントの `world/client/player-publication.ts` を、操作応答・非同期通知・入場時の初期状態と Game の状態更新で共有する。順序の規則は [[game-system#13. 永続化]] にある。

ブラウザはマップの部屋と WebSocket でつながる。送り合うメッセージの形は `world/protocol.ts` にあり、サーバーは受け取ったメッセージを zod で確かめる。部屋の入口は `routes/map/[mapId].ws.ts` で、メッセージの種類ごとの処理は `world/server/map-room/` にある。戦闘の対応表は `combat.ts`、受付は `handle-attack.ts`、分配候補の接続の取得と結果通知は `combat-audience.ts` と `notify-combat.ts` が受け持つ。攻撃要求と命中は `world/server/begin-strike.ts` と `advance-strike.ts` が二段階の RPC で保存し、通常攻撃と戦技の受付を `world/core/combat-payment.ts` の受領記録で固定し、戦技の消費を重複させない。受付は予約時の世代・HP・スタミナも確認し、未払いの古い要求を復活後の状態で受け直さない。未完了の要求は Wild DO のアラームで再送する。保存形式と移行は `world/server/wild-record.ts` にあり、同じ対象と同じ攻撃者には未完了の要求を重ねない。討伐の落とし物と分配先、反撃の抽選は `world/server/combat-plan.ts` が予約時に決める。命中と配送要求を一緒に保存し、別の RPC か次のアラームが受取人ごとのキューを配送する。`world/core/receive-combat.ts` が返す受領記録は結果と同じ保存単位に置き、受領確認が失われた場合も先の ID から順に送り直す。復活でプレイヤーの世代を進め、以前の世代への反撃は新しい HP に適用しない。ブラウザは命中通知で描画とセッションの敵 HP・復活時刻を更新し、倒れた対象が自分の戦闘対象なら解除する。描画がまだない場合も状態を保持する。敵がいるマップでは既存の接続確認に合わせて `heartbeat.ts` がサーバーの現在の HP と復活時刻を読み直し、接続中のブラウザへ返す。命中の確定と `Wild.snapshot` は `world/server/advance-wild-revision.ts` と `publish-wild.ts` の同じ公開順を使い、番号を HP と同じ保存単位に置く。`world/client/merge-wild.ts` が敵ごとに状態をマージし、`RoomClient` が接続の切り替え時に比較対象を空にする。番号の意味と古い応答の扱いは [[game-system#8. 戦闘]] にある。接続ごとに更新間隔を制限し、敵のいない町では生き物を問い合わせず、未参加の接続ではいずれの問い合わせもしない。Player DO の状態変更の配送更新番号も確認し、通常操作の応答が失われた場合やアラームが届けた結果を現在のマップへ反映する。読み出しだけではこの番号を進めず、全状態の公開順とは区別する。番号が変わったときだけ状態を送るため、町へ移動した後の結果も復元しつつ、同じ持ち物や演出を繰り返し配信しない。定期同期の再送は [[game-system#8. 戦闘]] に従い、`heartbeat.ts` がプレイヤー・生き物・採集資源の同期を個別に進め、`notifications.ts` が送信の成否を返す。復活はこの応答で反映し、ブラウザの時刻だけでは HP を戻さない。攻撃の拒否通知には対象の識別子を付け、描画側は現在追っている対象が一致する場合だけ停止する。前の討伐に対する遅い拒否で、次の敵への移動や別の行動を取り消さない。報酬の配送は討伐が確定したときだけ行い、分配の計算は `world/core/party/share-out.ts` に置く。戦闘の演出・結果通知の失敗で、報酬や反撃の保存を中断しない。通知の失敗は内容を含めず記録し、再接続では保存済みの状態を読み直す。保存や DO 間の呼び出しの失敗は通知の失敗として握りつぶさない。

通常コマンドの入力は `world/server/map-room/player-command-types.ts` に置き、地図の識別子、本人の状態と保存、接続への結果送信と周囲への通知だけを要求する。`world/server/map-room/work.ts` は操作とハンドラーの対応だけを持ち、プレイヤーのコマンド、採集、加工、加工依頼の注文と受取り、倉庫、頼まれごとはそれぞれの `handle-*.ts` が受け付ける。`get-command-shop-access.ts` は店の営業と実際に店番をしている人への距離を順に確かめ、`run-map-player-command.ts` は売買の予約と確定を市場へ、それ以外をプレイヤーへ渡す。確定した座り状態は結果の通知より前に保存し、公開する姿と準備状態は `publish-command-player.ts` が接続状態へ反映してから周囲へ通知する。通知が失われても確定した状態は戻さない。位置の照会は読取り専用のセルを受け、マップの座標を可変の型へ強制変換しない。

部屋は位置にかかわる確認をする。歩いた道がそのマップの歩けるマスを通っているか、店主や扉に十分近いか、などである。確認が済むと、部屋はそのプレイヤーの Durable Object に規則の実行を頼み、結果を本人に返す。

入場の対応表は `world/server/map-room/moving.ts`、受付は `handle-join.ts` に置く。`reserve-map-admission.ts` は本人の保存状態を先に読み、定員を予約して本番の訪問権限を確認する。`arrive-map-player.ts` は保存先へ到着を頼み、途中で切断した場合は接続の所有を外し、別の行先を返された場合はその行先を通知する。`admit-map-connection.ts` は到着を認められた場合だけ接続の経路と姿を保存する。到着処理から戻る間の切断も保存直前に確認し、所有を解放する。接続へ反映する姿・経路・準備状態は純粋な `get-map-admission-presence.ts` が保存済みの状態から作る。予約を取ったかと入場済みかは別に保持し、`finish-map-admission.ts` は入場しなかった定員だけを返す。返却が失敗しても入場中のフラグは外し、失敗自体は呼出し元へ返す。

初期通知は `send-initial-map-state.ts` が本人の状態、採集資源、生き物、周囲への入場通知の順に送る。`get-initial-map-players.ts` は同じ本人の古い接続を閉じ、本人と未確定の姿を初期一覧へ含めない。`read-initial-map-resources.ts` は初期通知と並行して資源と生き物を読み、読取りの例外も結果として受け止める。本人への初期通知が成功した後に読取りの失敗を呼出し元へ返すため、通知が先に失敗しても並行処理の拒否が未処理の Promise として残らない。入場済みの人数は初期通知の失敗では戻さず、接続の退出処理に任せる。

戦闘の受付は接続と対象のマップを確認し、`prepare-map-attack.ts` が保存済みの能力、到達範囲、立ち上がりを確認する。純粋な `world/core/get-attack-readiness.ts` は生存・技の種類・通常攻撃の間隔・スタミナの順を保持し、技固有の待ち時間と支払は保存先へ任せる。受付と配送の入力は `attack-types.ts` に置き、マップの地形、接続の読取りと送信、周囲への通知など実際に使う範囲だけを型で受け取る。到達範囲は `can-reach-monster.ts`、通常攻撃と技の命中計算の組立ては `world/core/get-attack-blow.ts` が受け持つ。乱数は立ち上がりの受入れ後だけ消費する。

命中の予約と実行は `execute-map-attack.ts`、支払結果と命中の公開は `publish-map-strike.ts`・`notify-map-strike.ts` に分ける。`deliver-map-strike.ts` は保存済みの配送を進めてから反撃を通知し、`reconcile-strike-notices.ts` は本人への最後の配送結果を使う。アラームが討伐や反撃を先に配送していた場合だけ現在の保存状態を読み、イベントなしで補う。本人への結果・命中・反撃の通知の失敗は保存処理を止めず、保存先の読取りや配送の失敗は呼出し元へ返す。反撃と定期同期で反映する戦闘不能の停止状態は純粋な `get-fallen-presence.ts` で共有する。反映時点の到達範囲から停止地点を写し、位置が欠けている場合は戦闘不能だけを保存して座標を作らない。

定期同期の対応表は `heartbeat.ts`、受付は `handle-heartbeat.ts` に置く。純粋な `get-map-refresh-plan.ts` がマップ内の対象と前回の試行時刻から必要な同期を選び、受付は保存先を読む前に試行時刻を保存する。本人の配送更新は `refresh-map-player.ts`、生き物と採集資源は `refresh-map-wild.ts`・`refresh-map-nature.ts` が受け持つ。三つの処理は並行して通知まで進み、一つの保存先の遅延や失敗でほかの同期を止めない。全ての終了を待ってから保存先の失敗を呼出し元へ返す。本人への通知が失われた場合は配送の公開番号を進めず、次の試行で再送する。本人の状態が変わっていない場合は番号だけを保持する。入力の型は `heartbeat-types.ts` に置き、部屋全体や描画用のマップを要求しない。

経路移動の受付は `world/server/map-room/handle-move.ts`、拒否した経路の補正は `refuse-movement.ts` に置く。受信した時刻で到達範囲と次の経路を検査し、立ち上がりや保存を待った時間を開始時刻へ加えない。保存先が現在の到達地点への補正を受け付けた場合だけ、接続の経路と姿を更新し、周囲へ通知する。最後に本人へ拒否を返す。位置がなければ座標を仮定せず、補正の保存・周囲への通知をせずに拒否する。`world/valid-path.ts` は空の経路を先に断り、開始地点、隣接と地形の検査を行う。受付の型は `movement-request-types.ts` に置き、地形検査の `walkable.ts` は大きさと歩行面だけを受け取る。

住民との会話の受付は `world/server/map-room/handle-engage.ts` に置く。開始時は住民の位置と距離を確認し、本人の到達地点で経路と公開する姿を停止させる。会話を終えるときは位置を必要とせず、会話相手だけを外す。店の品揃えと買取価格の照会は `handle-shop-look.ts` が受け持ち、実際の店番の位置を確認してから品揃え、本人の持ち物、買取価格を順に読む。買取対象の種類は `world/core/get-carried-sellable-item-ids.ts` が持ち物の最初の順で重複を外し、取引できない品を除く。`npc-cell.ts` がマップから使うのは識別子だけで、照会の引数に描画や地形の値を要求しない。

マップを渡る受付は `world/server/map-room/handle-warp.ts` に置く。接続の参加・操作状態と出口への距離、行先の開通を確認し、`tire-for-travel.ts` で野外へ出る疲労を保存先へ反映してから移動を頼む。保存先が移動を受け付けた場合だけ行先を通知する。`at-warp.ts` はマップの読取り専用の座標を受け、通信へ渡す座標は要素を写して可変の型への強制変換を避ける。帰還は `handle-revive.ts` が回復結果を通知した後に接続の戦闘不能と座り状態を外し、保存された帰還先を通知する。回復結果の通知失敗は帰還の通知を止めない。

食事・薬の回復、満腹と時間付き効果は `world/core/consume-command.ts` にまとめる。効果がないなどの拒否条件を確認してから持ち物を減らし、所持品から使う操作とショートカットから使う操作で同じ規則を通す。戦技・祈り・応急手当は `world/core/cast.ts` と `pay-art.ts` で共通の条件確認を通す。回復量と薬草の確保は `get-cast-recovery.ts` に分け、HP が満タンでないことを確かめてから呼ぶ。コマンドの結果の型は `transition.ts` にあり、`accept.ts` と `reject.ts` から同じ形式で返す。技の種類ごとに威力や回復の定義を型で必須にする。

規則そのものは `world/core/` の純粋な関数で、状態とコマンドを受け取り、受け入れて新しい状態と出来事を返すか、理由を付けて断る。同じ関数をブラウザでも使い、押せないボタンを灰色にする。結果を決めるのはいつもサーバーである。

取引所の DO は RPC とアラームの入口だけを持つ。受付・預かり・登録・受け取り・回復の手順は `world/server/begin-exchange-order.ts`・`advance-exchange-order.ts`・`deliver-exchange-inbox.ts`・`recover-exchange.ts`、保存全体の型と版の移行は `world/server/exchange-record.ts` に置く。コーディネーターは Void や Player DO の実装を参照せず、必要な RPC だけを持つ相手を引数で受け取る。各処理の成功後の保存と、例外時の状態の巻き戻しは Void が受け持つ。

部屋の取引所の対応は `world/server/map-room/exchange.ts` に置き、`handle-exchange-request.ts` が参加状態、掲示板との距離、銘柄を確認してから保存先の参照を得る。注文は `place-exchange-order.ts`、取消は `cancel-exchange-order.ts`、受取りは `claim-exchange-inbox.ts` が受け持つ。注文は予約、登録、本人への結果、板の読取りと通知の順に進め、拒否や結果送信の失敗後に板を読まない。取消は成立後にプレイヤーを読み、受取りは予約の ID を配送へ渡す。板の送信は `send-exchange-board.ts` に共通化し、各処理へは必要な RPC と送信だけを持つ文脈を渡す。

取引所の注文は `world/core/hold-order.ts` で受領済みの要求を先に照合し、新しい内容の検証と引落しの組立てを `get-order-escrow-command.ts` へ渡す。要求の内容比較は `same-intent.ts`、要求と預かり記録の型は `exchange-order-types.ts`、要求領域の初期化は `empty-requests.ts` が持つ。部屋は接続と操作番号で要求を識別し、取引所へ受付を頼む。取引所は接続の所有権を再確認し、要求を保存してから Player DO の預かりを呼ぶ。プレイヤーは預かり記録と持ち物・代金を同時に保存し、取引所は登録と完了記録を同時に保存する。接続ごとの古い要求を拒否し、未完了の要求を新しい要求で上書きしない。履歴全件ではなく、取引所とプレイヤーそれぞれで一人につき最後の要求を保持する。受取箱の配送も含め、DO 間の呼び出しは取引所からプレイヤーへ向け、相互に待つ経路を作らない。

取引所の受取箱は `world/core/reserve-inbox.ts` と `finish-inbox.ts` で予約と完了を分け、`receive-inbox.ts` がプレイヤーへの受領を扱う。予約・受領の型は `exchange-claim-types.ts`、初期化は `empty-claims.ts` に置く。取引所は予約を保存してから Player DO の受け取りを呼び、Player DO は品物と受領記録を同じ保存単位へ反映する。取引所の保存や応答が失われた場合も同じ予約を再送する。受領済みの再送は、後から対面取引が保留された場合も重ねて品物を戻さない。未受領の品物は対面取引の保留中に持ち物へ加えない。取引所のアラームは一度の処理量を制限し、失敗した受取人を後ろへ回す。プレイヤーと取引所の状態移行は、それぞれの既存データを保って受領記録と予約領域を追加する。

## Durable Objects

プレイヤーの保存全体の型と版の移行は `world/server/player-record.ts`、初期値は `initial-player-record.ts`、厳密な復元は `restore-saved-player.ts` に置く。ゲーム状態の対応形式を判定する `world/core/parse-player.ts` と分け、DO の通常操作は補助ローダーの新品への代用を使わない。Void は操作より先に移行結果を保存するため、版の移行時にもプレイヤーデータを確認する。読めないデータでは例外を返し、データの値を例外やログへ含めない。

Durable Object の入口は `durable-objects/` にあり、どれも Void の規約に従う。プレイヤー一人ごとの `player`、町ごとの `directory` と `nature`、全部の町で一つの `market` と `exchange`、生き物の具合を持つ `wild`、パーティごとの `party` がある。どれをいくつ持つかは世界観と対応させてある（[[world#世界の作りと Durable Objects]]）。マップの部屋は誰もいなくなると何も持たずに閉じ、続けて残すべきものは `player` などほかの Durable Object に置く。

## 定義表

住民、世帯と建物、日課、台詞、店、アイテム、レシピ、マップは TypeScript の定義表にあり、状態は ID だけを持って定義表から引く。住民の日課は定義を読み込むときに一度だけ時刻順に並べ、営業・会話・表示の判定で再利用する（`lib/engine/cyclic-schedule.ts`）。日課の場所・活動・区間の型は `world/town/routine-types.ts` に置き、定義表や室の割当て処理を型の参照先にしない。日課の文字列の時刻は `world/town/create-routine-slot.ts` が `world/core/parse-time.ts` で検証し、不正な定義は読み込み時に拒否する。境界の時刻は有限かつ重複なしとし、不正な照会時刻も拒否する。境界は生成時に写して固定し、呼出し元の配列や返した予定の変更で選択時刻がずれないようにする。返す予定そのものは元の参照を保ち、予定の全情報を複製した不変値であるとは扱わない。周期の長さと時刻の単位は呼出し側が持ち、エンジンへ一日の長さを埋め込まない。授業と記録の場所の割当ては `world/town/with-routine-activity-spot.ts` が担い、定義表から渡された室の中で住民・活動・役割と階が一致する場所を使う。対応がなければ元の予定を保ち、別の役割や階の場所を借りない。住民と町の表は `world/town/`、ルールにかかわる表は `world/core/`、マップは `world/maps/` にある。住民と台詞は世帯単位、建物は地区単位でファイルを分ける。製作の設備と消費量は `world/core/crafting-rules.ts`、設備の型は `crafting-types.ts`、設備の参照は `station-of.ts` に置く。レシピの表は `world/core/recipes/`、一覧の統合は `recipes/catalog.ts`、ID の索引は `recipe-of.ts` が持つ。失敗率と品質の計算は `fail-chance.ts`・`crafted-quality.ts`・`quality-weight.ts` に分ける。コマンドの共通検証は `world/core/apply.ts`、製作時の材料・品質・費用・経験値の処理は `world/core/craft-command.ts` に置く。採集の道具選択・耐久消費・成果の受け取りは `world/core/gather-command.ts` にまとめる。装備の着脱は `world/core/equip.ts` と `unequip.ts`、能力値の上限の反映は `settle-stats.ts` が扱う。条件・外す枠と収納の検証は `get-equipment-selection.ts`・`get-equipment-displacements.ts`・`get-returned-equipment.ts`、印の引継ぎと削除は `worn-of.ts`・`without-worn-slot.ts` に分ける。取引の持ち物・所持金の出入りは `world/core/trade-out.ts` と `trade-in.ts`、持ち物と装備の合計重量は `world/core/inventory-weight.ts` にまとめる。取引の保留と確定は `world/core/prepare-trade.ts` と `finish-trade.ts` が扱い、出入りの規則を共通の入口から呼ぶ。承認と拒否の結果型は `world/core/transition.ts` で共有する。職種ごとの現行レシピと将来の節目のレシピを元の順でまとめ、ID からの参照には一度だけ作る索引を使う。住民の一覧順は焼き出したスプライトの番号に対応するため、定義の置き場所を変えても順は変えない。外見の補完は `world/town/create-resident-looks.ts`、頭装備の表示は `world/town/wearable.ts` が担う。指定済みの髪と首巻きを保ち、未指定の前髪は性別ごとの未指定者の順、首巻きは全住民の順で選ぶ。マップの歩けるマスと住民の立つ場所は、描画の側の地形から `scripts/export-map.ts` で `world/maps/<マップ>.json` に書き出し、サーバーはこの JSON だけで確かめる。場面を組み立てなくてよいようにするためである。地形や建物を変えたら書き出し直す。 書き出しはプレイヤーの画面へ入らない専用のブラウザ文書から `dev/map-snapshot.ts` で地形・建物と採集物の同じ場面生成を呼び、開発用モジュールは実在するソースのファイル名で読み込む。スナップショットの識別子・寸法・通行ビットを検証してから定まった形式へ変換し、比較だけの場合はファイルを変更しない。生成処理との比較と、実際の描画ランタイムのグリッドとの比較を別々に行う。

## 描画

`create-monster-body.ts` は種類の定義から形・色・拡大率を一緒に組み立てる。実ゲームの `monsters.ts` と開発画面の生き物の詳細は同じ処理を使い、検査用の表示だけ通常種の色や固定の倍率へ戻さない。水平の囲いの検査もこの実際の生成物の頂点へ照合する。

プレイヤーと他の接続者の地面の高さは、人物ごとに座標が変わったときだけ求める（`lib/engine/position-sample.ts`、`world/scene/runtime/walkers.ts`）。配置済みの高さをカメラ追従・遮蔽の照準・名札と吹き出しでも使う。マップごとに人物と保持値を作り直し、外見の変更後も同じ座標の高さを新しい姿へ適用する。地形が途中で変わる場合は保持値を作り直す必要がある。

破棄したマップの描画から届く進捗や失敗は現在の画面へ送らず、遅れて完成した描画は解放する。MapScene の接続状態はインスタンス内部に保持し、本体の参照を固定する。描画の接続や開始に失敗した場合も、接続済みの資源を回収して現在の画面へ失敗を返す。終了処理は `release-scene-attachment.ts` が描画と通知を止めてから監視・描画面・資源・表示層を回収し、一つの失敗で残りを飛ばさない。

描画周期は `scene-frame-loop.ts` が保持し、開始の重複や描画中の再呼び出しで次のフレームを二重に予約しない。予約の失敗は呼び出し元へ返し、再試行を妨げる予約状態を残さない。

ランタイム自身の描画中の状態と通知先は `scene-runtime-lifecycle.ts` が保持する。資源を直接解放するときも、先にこの接続を閉じる。公開する状態の読み書きは同じ接続へ渡し、破棄後の再開や再接続を受け付けない。組み立て中の各操作はこの接続を参照し、未完成の公開ランタイムを参照しない。

地面の画像は並行で準備できるが、共有の地形と灯り・描画物の登録を変更する組み立ては `world/scene/runtime/scene-build-queue.ts` で直列化する。待機中に離れたマップは組み立てず、作成中に離れたマップは完成後に解放してから次へ進む。非同期の解放も完了まで待ち、解放が失敗した場合はキャンセルの理由と両方を残す。失敗した一件で後続の構築を停止しない。

描画資源は作成の都度 `lib/engine/cleanup-stack.ts` へ登録する。非同期の組み立ては `with-cleanup.ts` が囲み、途中の失敗でも取得と逆順に解放する。住民も一人ずつ登録する。共有する資源は一度だけ解放し、シェーダーだけが参照するテクスチャや影の描画先は `lib/graphics/dispose-object-tree.ts` で回収する。解放に失敗した資源があっても残りを処理し、元の作成エラーを失わない。収集は `collect-object-assets.ts`・`collect-material-assets.ts`・`collect-texture-assets.ts` に分け、幾何・材質・影の資源は実際に解放可能かを確認する。共有参照の重複排除と解放順、失敗の集約はツリー全体で維持する。

`create-scene-runtime.ts` は地面の並行準備と共有状態を触る構築の直列化を組み立て、`assemble-scene-runtime.ts` がマップの描画と操作を接続する。`create-scene-town.ts` は町の構築と静的メッシュの統合を扱い、動く物や遮蔽の単位を統合から保護する。

描画器とシーンの根の生成は `world/scene/runtime/create-scene-renderer.ts`・`create-scene-root.ts` に置き、取得時の解放登録と逆順の回収を維持する。カメラの生成は `create-scene-camera.ts`、表示寸法と描画面・後処理の画素数の同期は `resize-scene-viewport.ts`、移動先の輪とカーソルの生成は `create-walk-markers.ts` が担う。

環境は `create-scene-environment.ts` が環境光・太陽と照準・煙の順に根へ追加する。`create-scene-sun.ts` は影を先に所有へ登録してからカメラと解像度を設定する。`create-scene-smoke.ts` は元の画素のテクスチャ、幾何、材質を順に取得し、全てを所有してから根へ追加する。煙突がない場合も資源の回収手順は同じにする。煙の二色と透明な縁は `create-smoke-pixels.ts`、煙突の順と寿命の位相・横流れの初期値は `create-smoke-puffs.ts` に置く。粒は煙突の元の位置を共有し、更新中に位置を複製し直さない。

地面と水面は `create-scene-terrain.ts` が建物より先に組み立てる。ミニマップの地面の画素は `create-ground-canvas.ts` が渡し、屋内の床と占有する家具の図は `paint-interior-minimap.ts` が描く。部屋は登録した描画定義との対応で引き、別の部屋の図で代用しない。読み込みの進捗を通知して処理を譲った後に、地形と水面の幾何・材質を取得する。

地形の頂点とテクスチャ座標は `lib/graphics/create-heightfield-vertices.ts`、各セルの三角形は `create-grid-indices.ts` が入力の大きさと高さから作る。`create-ground-surface.ts` がこれらを幾何へ渡し、法線を計算してから `create-ground-material.ts` の地面と斜面の石の材質を使う。`apply-ground-shader.ts` は上向きと斜面、水際の材質の使い分けを保つ。`create-scene-water.ts` は水面の材質と平面を作り、時刻と空の色を照明へ渡す。幾何・地面と石のテクスチャ・材質・水面を取得の都度所有へ登録し、石のテクスチャがシェーダーだけから参照される場合や、水面を根へ追加する途中の失敗でも回収する。屋内でもミニマップは残し、屋外用の地面と水面は隠す。

住民の組み立ては `create-scene-population.ts`、このマップへ一日のどこかで来る人の選択は `create-map-residents.ts`、外見の事前生成との照合と人物の取得は `create-resident-actor.ts` が担う。人物を取得したら次の人物より先に所有へ登録する。`scene-population.ts` の ScenePopulation は人物・住民表の番号・仕事場を一組で保持し、番号の抜けを詰めずに会話の対象へ戻す。公開する人物と番号の配列は読み取り専用とし、人物の状態は描画と日課が更新する。

日課の場所の規則は引き続き `world/town/spot-at.ts`、活動の姿勢は `activity-pose.ts` が持つ。ScenePopulation は各人物の場所を一度引き、店先と人物をその対応から同期する。描画する地点への変換は `get-scene-spot-position.ts`、席・位置と向きの更新は `update-scheduled-resident.ts`、店の札と屋台の品・覆いは `update-scheduled-shop-fronts.ts` に置く。店の営業判定と、そのマップの名前付き地点にいる売り手の判定は混ぜない。

時刻と照明の接続は `scene-lighting.ts` の SceneLighting が持ち、空と環境光、日課、家の灯り、人物と板絵の色・太陽と水面の順に同期する。日課を反映してから部屋の使用を判定する。三つの色の定義は `scene-light-palettes.ts`、色空間を保つ混合は `mix-scene-light.ts`、一日の曲線との接続は `get-scene-light.ts` に置く。空と霧は `update-scene-sky.ts`、屋内外の環境光と窓の明るさは `update-scene-ambient-light.ts`、色と太陽・水面の同期は `update-scene-light-tint.ts` が担う。

`scene-house-lights.ts` の SceneHouseLights は各階の使用中の灯りを保持し、窓と鎧戸を家の生活時間に合わせる。同じ階と家の判定は一回の時刻更新の中で共有し、次の更新へ使い回さない。炎・街灯・煙のフレーム更新は `update-scene-flames.ts`・`update-scene-lamps.ts`・`update-scene-smoke.ts` に分ける。街灯の順は生成時の位置から一度並べ、時刻による点灯の番号を保つ。煙の粒の取得は環境の組み立て、描画は一括描画が持ち、照明の更新は粒の位相と位置を渡す。水面の時刻と空の色の一様変数は、生成時から具体的な型を持って照明へ渡す。

移動入力と経路、停止と凍結は `scene-movement.ts` の SceneMovement が描画ごとに保持する。押し続けたキーから格子の候補を作る処理は純粋な `get-held-walk-candidates.ts` に分け、角が塞がれた場合の候補の順と、最初の空き候補での経路の照会を維持する。停止の通知より先に行動予約を外し、追跡で明示した場合だけ予約を保持する。住民・採集・作業場への接近と到着時の通知は `scene-interactions.ts` の SceneInteractions が受け持つ。周囲の候補は `get-approach-candidates.ts` が来た側から近い半径と左右の順で作る。予約を消費してから到着を通知し、通知中に選ばれた次の行動を前の到着で実行しない。住民への到着と向き合わせは `scene-resident-conversation.ts` が扱う。住民表の番号は ScenePopulation の人物との対応から取り、向きと移動先の表示を先に更新してから到着を通知する。登録されていない人物から番号のない到着を送らない。

敵の追跡と攻撃間隔は `scene-combat.ts` の SceneCombat が描画ごとに保持する。範囲内では行動予約を保持したまま経路を短くし、向きを合わせてから攻撃の演出と通知を行う。対象を選び直しても前の攻撃からの待機は保持する。命中・消費・報酬はサーバーの判定を使う。

サーバーから届く命中結果と生き物の描画状態は `scene-combat-feedback.ts` の SceneCombatFeedback が扱う。状態を反映してから撃破の演出と追跡の終了を通知し、その後に命中表示を出す。対象がすでにいない場合は表示を作らない。表示と期限の所有は `scene-hit-labels.ts` の SceneHitLabels に分け、通常の期限切れとマップ終了の両方で要素を外す。位置の投影に失敗した場合も作成した要素を残さない。

行動不能・座る状態と作業の一時動作は `scene-posture.ts` の ScenePosture が保持する。行動不能への遷移を記録してから移動を凍結し、戦闘を終えて姿勢を変える。同じ状態の通知は繰り返さず、行動不能中の座る通知は取り込まない。通常の座る操作で移動の凍結は変更しない。

頭上の吹き出しは `scene-speech.ts` の SceneSpeech が人物ごとに保持する。同じ人物の次の発言で前の要素を外し、表示期限と退出をフレームで確認する。描画のレイヤーを付け直すときは保持中の要素を渡し、位置と見た目の計算はランタイムの共通の文字配置を使う。

名前・吹き出し・ダメージ数字の投影と画素への配置は `scene-label-projection.ts` の SceneLabelProjection に集める。地面の高さが渡された場合はその値を使い、省略時だけ歩行面を読む。画面外の判定、画素への丸めと縦のずらしを共通化し、表示条件や人物ごとの高さは呼び出し側が渡す。

住民の名前要素と住民の対応、表示距離、指している住民の名前の強調は `scene-resident-names.ts` の SceneResidentNames が保持する。強調のクラスは対象が変わったときだけ付け替える。位置は人物の描画中の座標を使い、非表示の人物には指していても名札を出さない。

ポインターのドラッグ・最新のホバー・ホイールの受付と、ネイティブのイベント登録は `scene-pointer.ts` の ScenePointer が所有する。ドラッグを始めたポインターだけが回転と終了を通知し、キャンセルとフォーカス喪失でクリックを残さない。ホバーは描画時に最新の位置だけを照会し、クリックは離した位置で直ちに照会する。終了では保持中の入力と表示を消し、登録した相手から同じハンドラーを解除する。地面の照会は `lib/graphics/get-ground-hit.ts` に分け、空いた地面を建物より優先し、塞がれた場合に橋や段の歩ける面を探す。歩ける構造面もないときは元の地面を返し、実際の移動の検証は呼び出し側に残す。

人物・他プレイヤー・生き物・動物と採集物のクリック判定は `lib/graphics/pick-visible-owner.ts` を共有する。表示中の根だけを照会し、最初の交点の子から親をたどって、登録した描画物の持ち主を返す。別の対象を指す子のメタデータは所有の判定に使わず、描画物の置換や退出も次の照会へ反映する。ポインターのホバーとクリックの優先順、採集物の残量による表示の切替は呼び出し側に残す。

採集物と作業場の描画ごとの保持、残量の表示、クリックした子から対象を引く処理は `scene-gathering.ts` の SceneGathering が担う。資源と設備の生成は `create-gathering-node.ts` と `create-station-spot.ts` に分け、生成順と採集物の通行判定はランタイムと書き出しで共通にする。釣りの利用位置は岸に残し、波紋だけを `find-fishing-water.ts` で橋を避けた近い水面へ置く。

描画フレームの予約・頻度制限と FPS・状態通知の周期は `scene-frame-loop.ts` の SceneFrameLoop が保持する。起動時に時計を読み直し、描画を省くフレームでは時計と世界を進めない。更新へ渡す実経過時間と、動きの補間用に上限を置いた時間を区別する。世界の更新順と描画後の計測位置は SceneFrameRenderer に渡し、停止後はフレームを追加予約しない。

フレームの処理順は `scene-frame-renderer.ts` の SceneFrameRenderer が持つ。描画前に歩行者と世界を進め、カメラを追従させてから遮蔽・ポインター・輪郭と煙を同期して描く。描画後に現在の人物の名前、生き物の状態と名前、戦闘の追跡、住民の名前を更新し、発言と灰を進めて計測を記録する。壁時計は生き物の更新の直前に、単調増加の時計は住民の名前の更新後に読む。発言と灰の更新にかかった時間を、記録へ渡す時刻に足し直さない。フレームが描けなかった場合は、その後の表示更新と計測を進めない。

影の更新の要求は `scene-shadow-updates.ts` の SceneShadowUpdates が保持する。時刻を変更した場合は次の描画で再計算し、通常は前の要求からの間隔で更新する。霧の開始と終端は `update-scene-fog.ts` がカメラと人物の距離に合わせる。定義のない霧や異なる種類の霧は書き換えない。

輪郭と人物の透視表示は `scene-outlines.ts` の SceneOutlines が同期する。通常の自分の輪郭は常に表示し、遮蔽物越しの表示を別に指定する。ほかの人物と生き物は指された対象だけを囲み、外見の置換や他プレイヤーの退出もその時点の集合を読む。プレビューの自分には輪郭と透視表示を変更しない。生き物の名前と HP の表示は `update-monster-labels.ts` が戦闘中・負傷・近さと描画物の表示状態から決める。非表示でも HP の表示状態は同期し、位置の投影は共通処理へ渡す。

人物の描画に使う視点と、住民・動物・建物・灯りのフレーム更新は `scene-world-animation.ts` の SceneWorldAnimation が受け持つ。先読みの時計を進めてから追従前の視点を共有し、住民の更新後に動物の画面右方向を求める。建物の更新中に追加された更新処理は次のフレームから動かす。視点の追従は `scene-camera-follow.ts` の SceneCameraFollow に分け、通常は描画中の人物の高さを追い、プレビューでは入力後の注視点を地形の高さへ合わせる。人物の向き用の視点共有、世界の更新、カメラの追従という順を維持する。

フレーム内の歩行者の更新順は `update-scene-walkers.ts` にまとめる。自分の移動を進めてから到着を通知し、そこで選ばれた次の経路へ前のフレームの時間を使わない。人物の配置はその後に行い、他プレイヤーも移動と配置の順で更新する。`walker-motion.ts` の WalkerMotion は実経過時間で経路を進め、補間用の時間で姿勢と向きを更新する。待機中の自分の一時行動と他プレイヤーの待機を区別し、地面の高さは歩行者ごとに保持する。角度の境界をまたぐ向きの補間は `lib/engine/blend-heading.ts` を住民と共有する。

自分と他プレイヤーの人物・名前の所有は `scene-walkers.ts` の SceneWalkers が持つ。外見の差分は `walker-appearance.ts` の WalkerAppearance が判定し、姿そのものの変更と手に持つ物だけの更新を区別する。名前の要素を保って人物を作り直し、退出では人物を解放してから名前を外す。終了処理には管理役を登録し、初期の人物への参照を固定せず、終了時点の自分の人物を解放してから他プレイヤーを外す。他プレイヤーの集合は参照側へ読み取り専用で渡し、遅れて届いた退出済みの人物の更新や移動は無視する。視点と入力が読む自分の座標と経路は `create-walker-movement.ts` の参照を通して最新のものを使う。

カメラと人物の間の遮蔽物は `scene-occlusion.ts` の SceneOcclusion が確認する。透過可能な物は目標の不透明度へ補間し、透過しない建物はそのまま保って人物の透視表示へ判定を渡す。プレビューでは物の透過と透視を行わない。材質の更新は `lib/graphics/set-object-opacity.ts` が単一・複数の材質を型で確かめて適用する。

マップの描画の入口は `world/scene/runtime/scene.ts` の MapScene で、地形・住民配置・照明・歩行者・入力は `world/scene/runtime/` に分ける。建物・野外・小物・テクスチャはそれぞれ `construction/`・`fields/`・`props/`・`textures/` に、人物の体・服・髪・装備・描画は `figure/` に分ける。描画は `world/scene/` が受け持ち、ゲームに依存しない部品は `lib/graphics/` と `lib/engine/` にある。

地形の高さ・道・川の計算は、選んだマップのデータが必要になった時点で行う。Worker の読み込み時に未使用の初期マップを計算せず、保存済みの地形があればそれを使う。道・川・踏み跡までの距離は、地形生成の開始時に線分を `lib/engine/polyline.ts` のインスタンスへ写し、線分の方向と長さを各地点で計算し直さない。

地面の絵は重いので、いくつかの Web Worker で帯に分けて描き、描いた絵はブラウザの IndexedDB に残して次からはそれを使う。残した絵は描くコードそのものを鍵にしているので、コードを変えれば描き直される。この鍵は `world/scene/ground-version.ts` にまとめ、Workerの起動と帯の受信を扱う処理から分ける。ノイズと補間の実装も鍵に含める。地面を描く入口から辿れるローカルの実装の参照と、鍵に含める TypeScript のファイルの対応を `ground-version.test.ts` で照合する。

地面を描く Worker は起動・転送・実行・応答の復号の失敗を扱い、応答の帯位置と画素数を依頼と照合する。失敗した帯は現在入場するマップだけ通常の描画で補い、先読みでは中断する。全体が失敗したら残りの Worker とイベントを解放し、遅れて届く応答で破棄済みの地面を書き換えない。

先読みと入場時の地面生成は、同じマップなら進行中の処理を共有する。入場先が先読みの順番待ちなら先に開始し、失敗した読み込みは次回にやり直せるようにする。描き終えた地面は保存完了を待たずに表示へ渡す。保存中も同じ地面を共有し、IndexedDB の取引完了または保存の待ち時間上限に達したら進行中の処理を外す。

地面と人物画像のキャッシュアクセスは `lib/engine/optional-cache-access.ts` で待ち時間を制限する。失敗や無応答なら生成へ進み、そのアクセス経路をページ内で再利用しない。読み出しと書き込みは別々に管理し、保存失敗でも読み出しを止めない。待機を打ち切った後に届いた人物画像は解放する。

住民の姿はドット絵のスプライトで、`scripts/bake-sprites.ts` で前もって八方向の動きを `public/tmp/sprites/` に焼いておく。この生成物は Git に含めない。配信時は `public/.assetsignore` で `tmp/` の診断ログ・スクリーンショット等を除外し、ゲームで読む `tmp/sprites/` だけを残す。

焼いていない組み合わせ（プレイヤーの見た目など）は、スプライト用の Worker がその場で描く。焼き出し済み画像の一覧は `world/scene/runtime/assets.ts` でページ内の一つの要求にまとめ、受信とJSONの読取りに待機上限を置く。届かない場合や形式が不正な場合は要求を中止し、そのページでは通常の生成へ進む。一覧の形は `world/scene/sprite-manifest-schema.ts` と `is-sprite-manifest.ts` で検査し、住民への適用時には名前・見た目・画像寸法を照合する。コマ数が現在の定義と異なるアニメーションも通常の生成を使う。保存用 PNG の生成が失敗しても描画済みのフレームは表示する。フレームの描画に失敗した場合は Worker の使用枠を戻して別のフレームへ進み、同じフレームの再要求には待ち時間を設ける。Worker 自体の起動・通信・実行が失敗した場合は、その Worker を停止し、待ち時間をおいて処理枠を補充する。重複した失敗通知で処理枠を増やさず、停止した Worker に届くキャッシュ結果や描画結果は表示せずに解放する。失敗記録の保持件数と待ち時間は `world/scene/sprite-pool.ts` が定義する。`world/scene/anims.json` は生成されたモーションデータであり、実装ファイルと同じ理由では分割しない。地面の灰は不透明な画素として先に判定し、灰で隠れる草や石は計算しない。灰は物ごとに板を足さず、材質のシェーダーで空を向いた面に積もらせる。

絵付きの吊り看板の木地は `world/scene/textures/create-sign-texture.ts` が作り、絵柄は `textures/signs/sign-painters.ts` から種類ごとの描画関数へ渡す。共通の木地と個別の絵柄を分け、未定義の種類は木地を返す。色と重なる描画の順は各関数に残し、種類の追加でほかの絵柄の条件分岐を増やさない。整数の描画範囲は `lib/engine/get-integer-range.ts` が開始を含み終わりを含まない順序で作る。

マップ入場の計測は `bun scripts/check-map-loading.mjs` で行う。新しいブラウザで地面の先読みと部屋の先行接続を止め、初回入場と別のマップを経由した再訪を比べる。結果は Git 対象外の `public/tmp/map-loading.json` に書く。これは実際の接続と描画の準備を含むが、出口を踏んでサーバーが移動を許可するまでの時間は含まない。

複数接続の基本確認は `bun scripts/check-multiplayer.mjs` で行う。独立したブラウザの保存領域で二人を作成し、同じ町とチャンネルへ入り、相互の入場通知・チャット配送・パーティへの招待と承諾・退出の通知を確かめる。町をまたぐ入場は開発サーバーの許可を使うため、本番の糸による訪問権限の検査には使わない。失敗時の画面と接続・読み込み状態は Git 対象外の `public/tmp/` に残す。Cookie や保存済みプレイヤーの全データは出力しない。

町の実行時性能は `bun scripts/check-runtime-performance.mjs` で確認する。ゲームの描画 FPS と別に、ブラウザのアニメーションフレーム通知の間隔を記録する。間隔の中央値・上位の値・最大値と長い停止の割合を残し、平均だけでは見えない引っかかりを調べる。この通知の回数をゲームの描画回数として扱わない。新規キャラを実際に作成し、接続中の町で通常速度と CPU 制限時の描画速度、メインスレッドの稼働時間、持ち物を開く応答と移動を調べる。出力は Git 対象外の `public/tmp/runtime-performance.json` に保存する。操作時間には自動操作の通信時間も含む。開発サーバー上の単独接続での測定であり、遅い GPU・少ないメモリ・多数のプレイヤーを再現したものではない。

描画は低い性能の機械でも動くことを優先し、設定画面は置かない。動かない物は、材質が同じで、いちばん近い「動く親」（薄くなる家、消える屋台、揺れる木の冠など）が同じもの同士を一つのメッシュにまとめて描く（`lib/graphics/merge-static.ts`）。物の数も見た目も変えず、GPU に出す命令の数だけを減らす。結合の入口は `merge-static.ts` に置く。`get-static-batch-groups.ts` が結合の条件・制御する親・属性の組を照合し、`merge-static-batch-groups.ts` がその親の座標へ形状をまとめる。空になった親の掃除は `remove-empty-static-parents.ts` に分け、根と制御する親を残す。互換な頂点属性の連結は `concat-buffer-geometries.ts`、頂点番号の移し替えは `get-concatenated-geometry-index.ts` が担う。`create-attribute-array.ts` は元の数値配列の型を保ち、正規化された色を別の表現へ変えない。動く物は作るときに登録し、動かない物の変換行列は毎フレーム計算し直さない。煙突の煙は同じテクスチャを使う板を一括描画し、カメラからの距離順に並べる。共有する描画済み画像は容量と件数に上限を設け、最近使っていないものからデコード済みデータを解放する（`lib/graphics/bitmap-cache.ts`、上限は `world/scene/sprite-pool.ts`）。人物の表示用キャンバスへコピーしてから共有キャッシュに渡すため、追い出しても表示中の姿は消えない。再び必要になった画像は保存済みデータから読み直すか、Worker で再生成する。材質キャッシュは元画像を弱参照で保持し、使わなくなったマップの画像を引き留めない。破棄した材質はキャッシュから外し、再訪時に作り直す。人物ごとの表示用キャンバスにも保持数の上限を設け、表示中のテクスチャを避けて古い動作・方向から解放する。解放後に届く描画結果は破棄する。人物の描画要求は同じフレームを重複登録せず、マップを離れるときと姿を交換するときに、その人物のテクスチャを解放する。生き物の表示位置はサーバーと同じ時刻の計算を使い、描画側だけ直近の休憩地点を保持して毎フレームの地形判定を減らす。保持する地点は固定数とし、地形が固定されたマップごとに作り直す（`world/core/monster-motion.ts` の `MonsterMotion`）。倒されて復活を待つ生き物は、破片演出が終わった後の位置計算を止める。サーバーが復活を通知した時点の時刻から位置を計算し、待機中のフレームを再生しない。生き物の描画用の地面の高さは、位置が変わったときに計算し直す。静止中と破片の間で同じ高さを共有し、座標配列も再利用する。高さの保持はマップごとに作る描画オブジェクトに閉じる（`world/scene/monsters.ts`）。灰の粒の揺れは `lib/engine/phase-oscillator.ts` で固定の位相を事前計算し、時刻の三角関数を粒どうしで共有する。粒数と元の運動式は保つ。うさぎの形状は同じ材質と影の設定の部品を本体の下でまとめ、移動・選択の輪郭・部品ごとの影を保ちながら描画命令を減らす。統合後の不要な元形状は直ちに解放する。戦闘の破片演出は、終了時と再発生時に古い形状と材質を解放し、生き物と共有するテクスチャは残す。影は毎フレームではなく、決まった間隔と太陽が動いたときにだけ描き直し、描画は 60fps を上限にする。ブラウザのフレーム時刻を使い、微小な時刻の丸めで描画を飛ばさず、高リフレッシュレートの画面でも過剰に描画しない（`lib/engine/frame-limiter.ts`、影の間隔は `world/scene/runtime/scene-shadow-updates.ts`、描画上限は `scene-frame-loop.ts`）。

靴の描画と接地は `world/scene/figure/get-shoe-capsule.ts` の同じ踵・爪先と半径の計算を使う。`get-native-footwear.ts` は外見の既存の寸法と靴の選び方を身体の文脈から取り、両足の形状を返す。足の目標と歩行の骨長・靴の区間の準備、後退と両手の届き方の準備では、この形状から接地を求める。身体全体と衣服・前腕の離隔や姿勢の分岐の証明は従来の全身の形状を使い、各区間の対象と境界を保つ。

人物は `world/scene/actor.ts` と `world/scene/figure/figure.ts`、町の動物の生成は `world/scene/spawn-animals.ts`、スプライトとメッシュの行動はそれぞれ `sprite-critter.ts` と `mesh-critter.ts` に分ける。住民と町の動物の地面の高さは `lib/engine/position-sample.ts` で直前の座標と結果を保持し、歩行や配置換えで座標が変わったときに求め直す。立ち止まっている間も姿勢や向きの更新は続ける。住民と生き物の名前表示には、配置に使った地面の高さを渡し、画面投影で地形を重ねて調べない。保持する値の寿命はマップ内の描画オブジェクトに合わせる。

名前・体力表示・吹き出しの画面位置は `lib/graphics/screen-labels.ts` が保持し、ピクセル位置と表示状態が変わったときだけ DOM のスタイルを書き換える。非表示中は位置を書き換えず、再表示時に現在の位置へ更新する。住民名のホバー装飾も対象の切替時だけ更新する。

ポインター移動によるホバー判定は、各描画フレームで最後に届いた座標だけを使う。クリック時の判定はそのクリックの座標で即時に行い、描画待ちによる入力の取り違えを避ける。

## 開発用の道具

`/dev` のページ（`pages/dev/` と `dev/`）では、定義表を一覧し、住民や物を一つずつ見て、描画を試せる。建物詳細は間取りから各階の室内を組み立て、階と昼夜を切り替えて表示する。回転表示とサムネイルの撮影距離は `dev/place-preview-camera.ts` が画面比率と外形から求め、`lib/graphics/get-perspective-box-distance.ts` が外形の八頂点を水平・垂直の視野と手前の面へ収める。`get-camera-facing-bounds.ts` は支点のある小物の画像がカメラへ向く回転も外形へ含め、固定した板の囲いだけで切らない。民家の表示用データはゲームの入場可能マップには登録しない。サムネイルは画像へ変換した直後に、回転表示は閉じるときに、使ったGPUリソースを解放する。共有している形状・材質・テクスチャは重複して解放しない（`lib/graphics/scene-resources.ts`）。サムネイルの保存キーには表示サイズも含める。小物と生き物の一覧のサムネイルは、画面に入った対象から生成する。一覧の行と画像の寸法は維持し、見えない場面を初回にまとめて組み立てない。目の比較は `dev/get-eye-portrait.ts` が必要な最初の静止画だけを描き、元の切出しの画素を維持する。ゲームの画面には開発用のものを出さず、開発用のパネルは開発中のビルドにだけ出す（[[ui#1. 原則]]）。

開発用の動的一覧と詳細は、`pages/dev/[sheet].server.ts` と `[sheet]/[id].server.ts` でブラウザ描画を指定する。`dev/catalog.tsx` の DevPage が準備する Canvas と画面の準備完了の通知を使い、URL の引数はブラウザのページのコンテキストから読む。テクスチャ一覧は看板の描画関数の対応表も読み、種類が増えたら同じ生成処理による実物を表示する。

`scripts/` のスクリプトは bun で動かす。マップの書き出し、スプライトの焼き込み、屋外のマップと屋内の写真撮り、`/dev` の全ページがはみ出していないかの確認、経済の試算がある。写真を撮るものは開発サーバーを動かした状態で使う。開発画面の検査は最初の HTTP 失敗、資源の取得失敗と画面の例外を再試行で置き換えない。ページの準備完了と画面内の画像・フォントを同じ期限で待つ。スタジオの準備完了は最初の人物画像を描いた時点で通知する。`scripts/dev-overflow.ts` の既定は一覧・各種の先頭詳細と専用ページを二つの幅で調べる検査であり、`DEV_PAGE` を指定した場合はその一画面だけの検査として件数を表示する。

## テスト

幾何の証明を含むファイルは `vite.config.ts` の test の既定で順に実行し、各ファイルの実行環境の分離を維持する。重い全身の検査が競合する負荷を抑え、各テストの制限時間と判定条件は変えない。負荷による時間切れと機能上の失敗を分ける。

初回戦闘と採集のブラウザ検証は `CPU_SLOWDOWN=4` で CPU 制限付きにもできる。キャラクター作成前から再読込後まで同じ制限を適用し、結果にも倍率を記録する。既存の操作・保存の検査と待機期限を維持する。GPU の遅さやメモリ不足を再現する設定ではない。

テストは実装と同じディレクトリに `*.test.ts` で置き、`vp run test` で動かす。規則のテストは `world/core/` の関数を直接呼ぶ。町の暮らしの整合（寝床の数、日課、通れる道、軒先の物の置き場など）もテストで確かめ、テストにできないものは [[consistency]] のチェックリストで確かめる。`lib/engine/` には、依存の向きと実行時の import に循環がないことを確かめるテストがある。型だけの依存は `import type`・`export type` で明示し、実行時の依存に含めない。

HP・SP の表示は回復が残る間だけ定期更新し、満タンまたは行動不能で停止する。満腹・温まり・集中の表示も、すべて尽きたらタイマーを止める。プレイヤーの状態が更新されたらその場で表示を計算し直し、回復や効果が生じたら再開する（`components/hud/status-frame.tsx`）。

## ブラウザの所有権と復帰

`routes/api/session.ts` は `world/server/establish-session.ts` を呼び、ブラウザの所有権を Cookie とプレイヤーの Durable Object で照合する。マップ接続は認証済みの所有者を接続状態へ置く。プロフィールの入力規則は `world/core/player-schema.ts`、復帰位置の計算は `world/core/location-at.ts` にあり、描画や UI を参照しない。作成途中の入力は `world/client/profile-draft.ts` が扱う。プレイヤーの保存先でも HP がない間の歩行とマップ移動を拒否する。倒れたときは、その時刻までに歩いた位置へ経路を止め、HP と同じ状態保存で確定する。再接続後に残りの経路を歩き終えた扱いにせず、復活で HP が戻った後に町への移動を受け付ける。保存・移行の約束は [[game-system#13. 永続化]] を参照する。

パーティの会話の型は `world/core/party-chat-types.ts`、保持と連投の上限は `party-chat-rules.ts`、送受信は `send-party-chat.ts` と `read-party-chat.ts`、加入と脱退の履歴境界は `join-party-chat.ts` と `leave-party-chat.ts` に置く。永続状態は既存の `party` DO、接続への配信は `world/server/map-room/deliver-party-chat.ts` と `send-party-chat.ts` が受け持つ。仲間の HP・居場所の報告と受信可能な会話の取得は `poll` でまとめ、同じ所属状態から返す。定期確認ごとにパーティの保存を繰り返さず、一つの処理で確定する。送信時にはプレイヤーの保存済み所属とパーティの名簿を確認する。受信時も名簿と加入時点の発言番号を確認し、所有者の内部識別子を配信内容から除く。ブラウザは `GameSession` の受信位置をマップ移動後も保ち、同じ発言と脱退済みパーティの遅い応答を表示しない。保持件数と履歴の範囲は [[game-system#12. チャット]] にある。

武器が持つ戦技・術・祈りの一覧は `world/core/skills.ts` の定義から `arts-of.ts` が読み込み時に索引を作る。画面とアイテム説明は定義順の変更不可な一覧を共有し、取得のたびに全技を走査しない。定義の参照は `skill-of.ts`、現在の技の識別は `is-skill-id.ts` と `skill-ids.ts`、ショートカットの書式は `skill-key.ts` と `skill-of-key.ts` が担当する。使用条件は `art-blocked.ts` が武器から先に判定し、必要な能力値と生活スキルを定義順で調べる。応急手当の回復量は `first-aid.ts` に置く。

店の在庫の型は `world/core/market-types.ts`、定時の品出し表は `market-batches.ts` に置く。通常在庫の初期化は `seed-stock.ts`、参照は `stock-of.ts`、増減は `move-stock.ts` が担当する。価格と買取上限の担当は [[economy#4.1 在庫で動く価格]] に従う。通常在庫の時間経過は `restock-stock.ts` と `hour-of-stock.ts`、棚と需要で共通の決定的な揺れは `market-hash.ts` に置く。全体の更新は `restock.ts` が入口となり、`get-market-happenings.ts` と `get-batch-happenings.ts` が品出しと住民の購入を時刻順に組み立てる。`apply-market-happening.ts` が更新用に複製した棚へ反映し、品質の割当は `split-batch.ts` と `batch-quality.ts`、住民が買う品質の順序は `consume-batch.ts` が受け持つ。出来事の型は品出しと購入で分け、品出しにだけ必要な初回の印を購入へ持ち込まない。

購入時の価格差と残量の確認は `take.ts`、断られた予約の返却は `give-back.ts`、返却可能な品出し回の判定は `batch-replaced.ts` が受け持つ。値引きは `price-now.ts`、次回の品出しは `next-batch.ts` に置き、品出し日と返却可能な回の計算は `market-day-start.ts` を共有する。

店の在庫表示は `world/server/shop-offers.ts` と `shop-buying.ts`、売買の永続的な予約と再送は `begin-shop-trade.ts`・`finish-shop-trade.ts`・`recover-shop-trades.ts`、保存形式は `market-record-types.ts`、旧形式の移行は `migrate-market-record.ts` と `market-migrations.ts` に置く。新規状態だけを `initial-market-record.ts` から作る。Player DO の受領判定は `world/core/receive-shop.ts` を使う。確定と補償の規則は [[economy#4.4 作り置きの店と焼き上がり]] に従う。

採集資源の予約と再送は `world/server/begin-gather.ts`・`finish-gather.ts`・`recover-gathering.ts`、保存形式は `nature-record-types.ts`、旧形式の移行は `migrate-nature-record.ts` と `nature-migrations.ts`、新規状態は `initial-nature-record.ts`、受領記録は `world/core/receive-gather.ts` に置く。`durable-objects/nature.ts` は入口だけを持つ。接続の定期同期は資源の残量も読み直し、遅延した採集の確定・返却と自然回復を、部屋への入り直しを必要とせず反映する。規則は [[economy#1. 採集]] に従う。

移動と攻撃前の起立は `world/server/map-room/stand-up.ts` で確認する。Player DO の保存が成功するまで接続側の座り状態を解除せず、拒否された場合は移動や攻撃の予約へ進まない。通知の失敗と保存の失敗を区別し、確定した起立を通知の失敗で取り消さない。

通常操作の保存成功後は、通知の成否にかかわらず接続の座り状態とプロフィールを更新する。プロフィールの反映は `publish-command-player.ts` が受け持ち、最初の準備完了または公開する姿の変更がある場合だけ周囲へ知らせる。定期同期でも Player DO の座り状態を接続へ反映する。状態の保存に失敗した場合には接続の状態を先へ進めない。

店と採集資源の旧保存形式は、在庫・残量・時計の構造と数値を検証してから移行する。検証は保存された ID を現行の定義表で絞らず、廃止された項目や追加の保存情報を削らない。読み取れない状態は移行の保存前に例外とし、初期状態で置き換えない。店の検証スキーマは `market-state-schema.ts` にあり、`is-market-state.ts` で元の値を絞り込んで `restore-market.ts` が同じ参照を返す。パース結果への置換で追加情報を削らない。採集資源も `nature-state-schema.ts` と `is-nature-state.ts` で確認し、`restore-nature.ts` が元の値を返す。店の時間経過でも廃止品はそのまま残し、現行の品だけ補充・消費を進める。保存された廃止品から現在の需要や価格を推測しない。


## 製作依頼の受取対象

加工依頼の定義表は `world/core/commissions.ts`、定義の組立ては `define-commission.ts`、参照は `commission-of.ts` に置く。注文スキーマの `commission-order-schema.ts` と一覧比較の `same-commission-orders.ts` を保存形式・通信・コマンドで共有する。関連する型は `commission-types.ts`、上限と既定の抽選の値は `commission-rules.ts`、職人ごとの品質の抽選は `commission-quality.ts` が担当する。ブラウザは選択時の一覧を送信時まで保持し、マップの部屋が一覧を照合して職人と距離を調べる。`world/core/commission/collect.ts` は同じ一覧を更新直前にも照合する。公開順の番号は読出しや回復でも進むため、注文の選択の一致には使わない。規則は [[economy#3. 加工の依頼]] に従う。


## 倉庫の選択対象

`world/client/player-actions.ts` は預ける持ち物または引き取る倉庫の一枠を送信時まで保持する。通信は保存と同じ `stackSchema` を使い、`world/core/storage/store.ts` と `retrieve.ts` が更新直前に `same-stack.ts` の `sameStack` で照合する。取引の複数品の比較もこの一品の比較を使い、品質・作り手・耐久の比較漏れを別々に直す構造にしない。規則は [[game-system#5. 持ち物・装備・倉庫]] に従う。


## ドラッグした品の保持

`components/hud/drag.ts` は保存と同じ品のスキーマを持つドラッグ情報を検証し、開始時の一枠を保持する。持ち物と装備の窓はその一枠を操作へ渡し、`world/core/inventory-selection.ts` が規則の実行直前に比較する。通常のクリックによる使用・装備・取り外し・売却も同じ比較を通す。売却では市場の予約前にも照合し、`same-shop-command.ts` の要求の一致へ選択した品を含める。並べ替えは送り先も照合し、倉庫へのドロップは開始時の品と現在の持ち物を確認してから倉庫の規則へ進む。ショートカットへの登録は物を移す操作ではなく、品またはスキルへの参照を保持する。

## 定義表の外にあった礼拝堂

礼拝堂の外形と入口は `world/town/chapel.ts` の CHAPEL に持ち、`world/scene/construction/chapel.ts` が描く。本堂と鐘塔の外周、屋根・基壇・控え壁の張出しは chapelFootprints が返し、個別設定の配置検査が使う。世帯の家を並べる HOUSES へ礼拝堂を住居として追加せず、[[building-chapel]] で用途と内部設計を管理する。共通定義の建物資料が欠けたら資料検査を失敗させる。

屋外の仕事への経路検査は `scripts/lib/resident-journeys.ts` が、住民と自宅・仕事場の対応、正確な戸口・到着場所・幅・出発方向を照合する。地面の到着場所は検査の入口で共通定義から渡し、検査の中へ町の名前や固定座標を埋め込まない。身体の占有と橋・川の計算は `scripts/lib/audit-outdoor-journey.ts` が受け持つ。資料の到着地点が、洗濯場の階段を下りた作業位置を表すとは限らない。

町の鶏・猫・豚・羊の個体IDと所属マップ・描画の初期定義は `world/town/animals.ts` に持つ。Three.js に依存せず、設定資料の飼育割当と `world/scene/spawn-animals.ts` の生成が同じ定義を使う。描画物には animalId を付ける。現在の移動と外見を保つための分離であり、飼育室への帰宅や就寝の行動を実装した意味にはしない。

マップへの動物の配置は、個体定義をマップIDで絞って行う。描画のマップ定義に動物の有無のフラグを重ねて持たず、屋内や別の地区に広場の個体を複写しない。個体のないマップでは、描画物の作成と動物用の地形の参照を行わない。

## 元の部屋と家具の診断

`world/town/floorplan/room-inventory.ts` は元の部屋と生成した区画を照合し、`FloorPlan.unrepresentedRooms` へ対応しない部屋を残す。`world/town/interiors.ts` は形状を扱えない元の家具を位置と寸法付きの `unrenderedFurniture` へ残す。どちらも描画と通行の形状に混ぜず、診断のために空の区画や代替の家具を描かない。

`scripts/check-settings.ts` が全棟・全階の現行の定義から診断を集め、`scripts/lib/runtime-graphics.ts` で個別資料の記録と照合する。設計と描画の照合の扱いは `.docs/settings/README.md` に従う。

授業の参加者は `world/town/routine-activities.ts` が日課の活動タグとマップから読み取る。設定検査の `scripts/lib/classrooms.ts` が先生の仕事、学ぶ人の部屋参照、卓と椅子の割当と座る身体の間隔を照合する。日課の表示文言から役割を推測せず、実行時の場所と時刻は既存の日課に従う。

加工設備の配置は `world/town/equipment-place.ts` と `locate-stations.ts` が規則と位置を結ぶ。共同作業場の地上階と設備の存在を確認し、加工規則に対応する場所がない場合やIDが重複する場合は定義エラーにする。設備を黙って位置なしの状態へ変換しない。

職人通りの共同炉と金床・薪の既存の配置は `world/town/craft-yard.ts` で共有し、描画と加工判定が別々の座標を持たない。屋内の加工設備は描画の種類だけでなく元の家具名で結び、同じ種類の台を並べ替えても別の作業面を参照しない。設備資料の runtime_station は `scripts/lib/runtime-stations.ts` が実行時の設備とマップへ照合する。

`lib/engine/scalar-field-range.ts` は双線形の補間の格子線と照会矩形の端から最小・最大を求める。補間と同じ座標の切詰めを `ScalarField.gridCoordinate` で使い、四隅だけでは見落とす内部の起伏も含める。設定検査は現行の地形を地区ごとに計算し、独立した配列に保持して床の基礎と入口の外階段へ渡す。実行時の地面や建物をこの検査で変更しない。

`scripts/lib/audit-building-foundation.ts` は共有の `foundation-schema.ts` で寸法を読み、地形の保持範囲と地面・床下面の隔たりを照合する。`scripts/lib/entry-step-geometry.ts` は戸から階段と踊り場・踏面を求める。入力の敷地・部屋・基礎は `entry-step-site-schema.ts` と `get-entry-step-site.ts` が照合し、戸口への変換は `get-entry-step-door-pose.ts`、断面の長さ・幅・蹴上げは `get-entry-step-section.ts`、踏面と踊り場は `get-entry-step-surfaces.ts` が担当する。各面の位置と矩形は `get-entry-step-point.ts`・`get-entry-step-rectangle.ts` で同じ回転と縮尺を使う。強制変換で未検証の値を渡さず、有限な入力でも計算が表現範囲を超える形状は拒否する。`audit-entry-steps.ts` は階段の配列と重複を検査し、`get-entry-step-errors.ts` から戸・寸法・接近路・地形の個別検査を元の順序で呼ぶ。接近路は `entry-approach-schema.ts` を資料の読取りと共用し、非有限な座標を経路の接続として受け入れない。`entry-opening-height.ts` は戸口の頭上高を確認する。外階段の寸法と型は `entry-steps-schema.ts` と `entry-steps-types.ts` で共用し、保持範囲外の地形を丸めて踏面の支持に使わない。外階段の占有は敷地と屋外の経路へ渡し、別の建物の案で消えないようにする。

戸の検査は戸板の回転と操作する身体を分け、`scripts/lib/door-operation.ts` が身体の円弧と家具の使用面の競合を照合する。operation.waits_for は理由を持つ作業順序であり、戸板の回転に対する待機条件とは別である。資料の使用面が動いたら、重ならなくなった待機条件も不整合として扱う。

`scripts/lib/door-push.ts` は外から戸を押して入る身体と戸板の連続した動きを扱う。区間の移動量と回転量から距離の変化の上限を求め、接触しないことと取っ手へ届くことを区間全体で証明する。記録した姿勢だけの点検に置き換えない。床と踊り場の和集合、壁と枠・家具と使用面、開いた戸を保持して室内側の閉める位置へ移る区間も照合する。実行時の操作や描画はこの資料検査から変更しない。

室内の糸車は機織り機と別の描画種類として持ち、`world/scene/construction/spinning-wheel.ts` で動輪・スポークと糸巻き・伝動紐・踏み板を組む。元の家具の座標と占有は維持する。室内の窓と枠は所属する壁の切下げに合わせて隠し、壁が戻ってから表示する。切下げの途中で窓だけが浮く状態を作らない。

荷車の無荷の駐車状態は `world/town/parked-cart-shape.ts` に荷台・車輪と軸・柄と支持の同じ定義を持つ。`get-parked-cart-fit.ts` は矩形の長い辺へ前後軸を向け、全体を均等な倍率で収める。`world/scene/construction/parked-cart.ts` は `parked-cart-frame.ts` と `parked-cart-wheel.ts` を組み、名前を持つ部材の静的な接触を検査できるようにする。スポークはインスタンスでまとめ、車輪と軸・柄の形を木箱や積荷で代用しない。資料は [[room-barn-2#空の荷車の駐車した形]] にある。

飲用水甕は `world/town/water-jar-shape.ts` の胴と蓋の同じ輪郭を `world/scene/construction/water-jar.ts` が回転体へする。内側と口縁を持つ陶器の胴、口縁へ接する取り外す蓋を描き、元の占有と床の高さを保つ。資料は [[room-h4-1#飲用水甕の閉じた外形]] にある。個別の水甕の検査表示も同じ描画を使う。

茶の壺・灯り油の壺・釉の甕は用途の異なる描画種類を持ち、`world/scene/construction/ceramic-vessel.ts` で閉じた器の輪郭を作る。茶の壺の持ち手、油壺の細口と栓・紐、釉の甕の広い蓋を分け、家具の元の占有の中へ収める。土色は既存の色の帯から取り、夜は室内の灯りに従う。

ろくろは `world/scene/construction/potters-wheel.ts`、砥石と支持台・水受けは `world/scene/construction/whetstone.ts` で描く。ろくろは下の足で回す円盤と上の成形面・縦軸を分け、支持台へ円盤が埋まらないようにする。砥石は住民の台詞にある荒・中・仕上げを表し、支持台の長辺へ合わせる。`world/town/get-interior-piece.ts` は元の家具を表示用の寸法へ変換した結果を受け取り、描画できる形と未対応の記録のどちらでも名前と寸法・障害物の情報を保持する。

籠と柳の材料は `world/scene/construction/basketry.ts`、仕事用の鍋・桶・袋・道具箱は `world/scene/construction/workshop-container.ts` に形を分ける。`world/scene/interior.ts` の家具の分岐は `FurnitureKind` の全種類を扱う。表面の生活の跡は支持面の高さが決まる後段へ明示的に回し、新しい家具の種類に描画処理がない場合は型検査で拒否する。元の全階で未対応の家具がないことは `workshop-container.test.ts` で検査し、新しい未対応の名前の記録を保持する検査とは分ける。

## 資料の平面と描画への投影

`world/town/floorplan/authored-floor-plan.ts` は個別の部屋のグリッドと配置を実寸の `FloorPlan` へ変換する純粋な処理である。入力の共有型は `authored-types.ts` に置き、全体の寸法の検査は `assert-authored-plan-dimensions.ts`、外壁に収まる開口の検査と外壁面への投影は `get-authored-entrance.ts` と `get-authored-entrance-opening.ts` に分ける。部屋と家具の検査・投影は `get-authored-room-projection.ts` と個別の検査・矩形変換に分ける。被覆と壁の索引は階・行・列の数値で保持し、被覆の検査後に `get-authored-wall-dividers.ts` が階・行・列の順で壁の区間を投影する。部屋の原点と家具の矩形を同じ倍率で移し、壁の連続したセルをまとめ、戸のセルを埋めない。部屋の境界どうしが同じ壁または戸を共有することだけを許し、内部の重複、未被覆の床、範囲外の家具は拒否する。共有可能なセルの条件は `can-share-room-cell.ts` に置き、資料の `FloorOccupancy` と実行用の投影が同じ判定を使う。家具の名前から似た形を推測せず、資料の `runtime_kind` と `runtime_solid` を使う。種類の定義は `world/town/furniture-kinds.ts`、明示した種類の検査は `parse-furniture-kind.ts` に分ける。既存の名前の判定は `get-furniture-kind.ts` に順序を持つ規則として残し、資料の明示した種類の代わりにはしない。

`scale-room-piece-dimensions.ts` は配置の座標変換と分けて、家具の実寸の付属情報を室内の倍率へ一度だけ変換する。椅子と足掛けは `scale-seat.ts`、卓の天板・脚と膝の空間は `scale-work-surface.ts` を使う。炉・棚・寝台も各部品の変換を使い、向き・階・グリッドの矩形は元の配置に保つ。描画の位置を決める変換で実寸を重ねて掛けない。

`scripts/export-authored-plans.ts` は選んだ建物・各室と参照先の屋外マップの資料を読み、`world/town/floorplan/authored/` へ型検査可能な配置データを書き出す。`scripts/lib/get-authored-plan-source.ts` が共有型への直接の参照とプロジェクトの整形を含むソースを作る。整形後の内容を比較し、変化のない再出力でファイルの更新時刻や開発画面の読込みを変えない。現在の対象は寄り合い所で、資料の用途は共用として保持する。書き出しただけでは町へ登録されない。寄り合い所は `HOUSES` の `authored` から外観・上下階の室内・通行判定へ同じ配置を渡す。ほかの建物への採用は個別に行う。投影した平面は `interiorPlan` の引数へ渡せるため、採用時の描画と通行判定で別の配置を作らない。

外観の生成は `scripts/lib/assert-envelope-plan-dimensions.ts` で内装の幅・奥行・セル寸法と建物資料の寸法の一致を先に確認する。外形の実寸の積が同じでも、元のグリッドや尺度が異なる入力を混ぜない。戸の開閉に使う接続の読み取りは `scripts/lib/get-door-swing-source.ts` が一意性と幅・座標を検証し、`get-door-swing-frame.ts` が厚い壁の通路と蝶番の位置を求める。移動先や部屋全体の被覆の検査とは分け、既存の床セルを使った局所の衝突診断を保つ。外観の戸は `get-envelope-door-source.ts` で実寸と金具・開閉を検証し、`get-envelope-door-projection.ts` で内側の戸板と外の開口を照合する。室のセル原点と戸の実寸の点の換算は `project-envelope-door-point.ts` が一度だけ行う。`compile-envelope-door.ts` は検証と照合の結果を描画用の単位へ組み立て、外観全体の入口から金具の判定を分離する。

資料から配置データへの変換は `scripts/lib/compile-authored-plan.ts` が組み立てる。建物の構造と文書 ID の索引、部屋の入力、家具、外への入口、階段の断面をそれぞれ検証して変換する。部屋名や寸法を文字列・数値へ読み替えて補完せず、重複した文書 ID は参照の前に拒否する。実行用の出力は設計状態にかかわらず実際に出力する各室の階段接続を覆う断面と既知の開口・手すり寸法を要求する。設計途中の資料を保持できることと、実行用の配置を出せることは別の条件である。

資料案の階段は `world/town/floorplan/stair-geometry.ts` が段数・床高・踏面・踊り場から一つの階段を計算し、上下階の描画と通行判定で共有する。`world/scene/construction/authored-stair.ts` は上階では同じ階段を下へ降ろし、上向きに複製しない。上階の床は `lib/engine/rectangle-subtraction.ts` で開口を除いた矩形へ分解して描き、上の踊り場の床板を二重に描かない。資料案の縦横は同じ室内倍率で投影し、階高と床厚も資料の差から得る。既存の自動間取りの描画寸法は維持する。

家具と間仕切りの室内投影は `get-interior-furniture-projection.ts` が対象の階の元の順序で組み立てる。中心と幅・奥行への変換は `project-interior-piece-placement.ts` に置き、家具の付属寸法の換算と分ける。描画未対応の家具も名前と占有を保持し、間仕切りの種類は型付きの対応表から選ぶ。

`world/town/interior-plan.ts` の入口の投影は `get-interior-entrance.ts` が描画の点と通行・到着のセルを一緒に求める。壁の内側のセルを選ぶ丸めは `get-interior-door-coordinate.ts` に置く。階段の実寸から表示への換算は `project-interior-stair-section.ts`、階ごとの床開口と通行を塞ぐ範囲は `get-interior-stair-projection.ts` が扱う。矩形の移動と倍率は煙道と階段で `project-interior-rectangle.ts` を共用し、表示倍率を世界の実寸へ戻さない。

窓・灯り・煙道の室内投影は `get-interior-fixture-projection.ts` が対象の階を選び、各 `project-interior-*` の処理へ渡す。窓は外向きの方向と壁上の点を同じ方位から求め、壁厚が未定や正の有限値でない場合、投影結果が非有限になる場合を拒否する。灯りの位置と高さ、煙道の壁厚と床の支持も表示倍率で一度だけ換算する。

室内マップは `world/maps/indoor-maps.ts` で組み立てる。現在の町の地上階もこの処理を使い、採用する資料案の上階を追加したときは別のマップIDを持たせる。上階へ街の戸を複製しない。階段の接続は `world/town/interior-stair-links.ts` が同じ断面の上下の踊り場から求める。階とマップの登録を `get-interior-stair-registry.ts` で一意に解決し、乗り口の選択と安全な到着点の探索を分ける。同じ索引に保持した歩行グリッドを階段判定と `world/maps/create-indoor-map.ts` のマップ生成へ渡し、別々に作り直さない。到着点はマップごとに最初の接続を索引にし、各室の生成のたびに全リンクを探索しない。上階の到着点の存在を確認してから描画名や住民の生成を呼ぶ。既知の室内の親空間の情報は `get-interior-map-space.ts` からマップ定義へ渡す。同じ階の資料の部屋 ID と平面領域は `get-authored-room-space.ts` から親空間の情報に保持し、全マップの登録時に `assert-map-room-spaces.ts` で包含と重なりを検査する。単位と未照合の扱いは [[spatial-model#室内マップの親空間]] に従う。乗り口は幾何の座標範囲を列挙せず、実在する歩行グリッドのセルだけから選ぶ。踏面と床開口の上を着地点にせず、歩けるセルだけを辿り、階段と街の戸の戻り判定から離れた近傍へ到着させる。接続先の階や着地点がない配置は拒否する。生成した室内は `assert-indoor-map-access.ts` で出現地点と全ての移動開始セルの通行を確認し、開始セルの重複と出現直後の戻り判定を拒否する。`are-map-cells-connected.ts` は指定セルを補正せず、四方向の歩行グリッドで出現地点から各出口へ到達できることを確認する。この検査は接続先マップの座標や世界全体の立体の重なりを保証しない。

資料案の外壁はグリッドの境界セルの内側へ描き、同じセルを通行判定でも塞ぐ。入口の中心と幅・高さはセルの丸めた中心から描き直さず資料の実寸を使う。上階の外壁に地上階の入口の穴を開けない。これらは現在の自動間取りへの一括の寸法変更にはしない。

資料案の各階は床高・天井高と床厚を持つ。`get-authored-floor-levels.ts` が書出しに必要な既知の天井と基礎の厚みを検証して読む。`assert-authored-floor-levels.ts` と `is-authored-floor-level-valid.ts` は書出しと実行時の双方で、階の一意な登録と、有限で表現可能な床の両面・室内の高さを照合する。地上階の床厚は基礎の指定を、上階の床厚は直下の天井と床高の差を使い、不足や矛盾のある床は書出し時に拒否する。上階の確認表示では直下の階の構造も同じ平面から組み立て、開口越しに屋外の地面を代わりに見せない。壁の透過表示の縮小は各階の床を支点に行い、下階の壁が上階の開口へ浮き上がらないようにする。

煙道は建物の `flues` が炉と上階の区画を結び、`scripts/lib/flue-sections.ts` が支持する炉の占有と上階の保管からの離隔を照合する。上階の煙道は専用の家具種別として同じ平面へ投影し、下階の炉の上部もその矩形へ合わせる。棚を煙道と同じ位置に置いたまま外側に煙突だけを描かない。

`scripts/lib/compile-envelope.ts` は敷地の回転、基礎の床高、軒と棟・軒の出、入口の戸と外階段、煙道から外観の寸法を生成する。`get-envelope-source.ts` が敷地・基礎・屋根と入口階段を検証し、`get-envelope-entry.ts` は一意に特定できる寸法付きの入口戸を取得する。煙道の出口は `get-envelope-flue-outlets.ts` で本数と高さを確認する。型付きの入力を読む際に、元の資料や追加のメタデータは書き換えない。

`assert-finite-envelope.ts` は計算後の全数値も確認し、有限の入力同士の計算で非有限値が生じた場合は、その項目の位置を示して書出しを拒否する。

`get-envelope-window-projection.ts` は窓を敷地の原点と基礎高さを含む同じ座標系へ投影し、対応する階の高さが一意に定まらない場合は拒否する。`compile-envelope-window.ts` は投影した位置と向きから描画へ渡す窓の寸法を組み立てる。既存の描画へ渡す窓台の高さは、基礎からの相対高さとして保持する。`world/scene/construction/authored-building.ts` はこの寸法で建造し、室内表示の拡大倍率を屋外へ持ち込まない。煙突を乱数で増やさず、屋根材は元の建物の材質へ合わせる。寄り合い所の町の外観も同じ寸法で建造する。

窓と吊り灯りは各室の `windows` と `lamps` に持ち、`scripts/lib/room-fixtures.ts` が壁・天井・家具との位置を確認する。窓は階と外壁上の位置・開口幅・腰高・高さ・枠を、灯りは平面位置・本体の上下と天井への吊りを持つ。`world/town/room-fixtures.ts` の形で室内と外観へ投影し、`world/scene/construction/room-fixtures.ts` が共通の窓枠を描く。

窓の位置には実際に壁の開口を切る。腰壁は残すため、窓を追加しても通行できる外壁セルにはしない。壁の透過表示ではその壁に属する窓枠とガラスも一緒に隠す。資料案の灯りは指定した器具だけを描き、自動で部屋の中央へもう一つ足さない。寄り合い所は各階の住民の予定に合わせて窓と吊り灯りを点灯する。予定の位置は資料の活動位置から投影し、時間と行動文は `routines.ts` の定義を保持する。活動の視線は `activity-pose.ts` が同じ室内の原点と倍率で投影する。着席した生徒は椅子の北向きを保ち、先生は生徒のいる範囲、記録担当は使用する卓へ向く。会話用の立ち位置を家具の内部へ移さない。

資料の椅子は家具ごとの `seat` に物理寸法を持つ。書出しで占有格子との大小、座面と板厚・背もたれ・脚の関係を検査し、`interiorPlan` が室内倍率を一度だけ掛ける。`world/scene/construction/chair.ts` は投影後の寸法で脚・座面・背もたれを作る。通行の使用面と着席した身体の位置は別に扱う。

資料の卓は `work_surface` に天板高と厚さ、脚の幅と引込み、座面上に必要な膝の空間を持つ。資料検査と書出しは同じ寸法の読み取りを使い、座面から天板下面までの離隔を照合する。書出しは部屋の通常の配置検査も通し、検査を経ずに不整合な配置を描画へ渡さない。投影後は `work-table.ts` が室内の床を基準に描き、卓の上の物も同じ天板高を参照する。

資料を採用した室内では `SceneDefinition.figureMetres` から人物の縮尺を渡し、住民とプレイヤー・他のプレイヤーを同じ室内倍率で描く。屋外用の縮尺のまま人物だけを小さくしない。旧自動間取りの室内は従来の縮尺を維持する。

授業の着席位置は `activityPose` が資料の椅子の中心・座面高と前寄せから投影する。会話と通行の使用面は変更せず、身体だけを座面に配置する。`Actor` は座るアニメーションの腰の水平移動をフレームごとに相殺し、座面との支持面を合わせる。影は床に残し、名札は実際の描画位置へ追従する。予定が変わると着席を解除する。足掛けは対応する卓を参照し、卓の下の範囲と脚との干渉を資料検査で照合する。

活動中の身体と向きは `activityPose` が同じ日課の一回の参照からまとめて返す。資料の室内座標は起動時にマップ・人物・活動の索引へ投影し、予定更新のたびに全室を走査しない。参照先のマップと日課の実際の場所が一致しない場合は適用しない。返す配列は呼出しごとに分け、描画側が変更しても索引の座標を壊さない。同じ階の人物と活動に複数の位置が指定された資料は書出し時に拒否する。

足掛けの板と二本の支持材は `world/town/foot-rest.ts` が同じ立体の区画へ分ける。室内描画と資料検査はこの区画を共有し、板の平面だけで干渉を判断しない。板が支持材へ届かない幅の資料は、寸法の読み取りで拒否する。`scripts/lib/audit-foot-rest.ts` が割り当てた卓とその脚を照合し、不正な卓の寸法や支持材だけの衝突も検査結果へ返す。

卓の天板と四本の脚は `world/town/work-table.ts` の区画を共有する。室内の組立て、足掛けとの干渉検査、着席した膝の検査で脚の位置を個別に計算し直さない。区画は呼出し側の座標と単位、床の高さを受け取り、脚を床から天板下面までつなぐ。

入口の開口高は `scripts/lib/entry-opening-height.ts` の `entryOpeningHeight` で読み、立って通れる高さと地上階の天井への納まりを通常の資料検査と書出しで共有する。外観へは検証済みの平面の開口高を渡す。敷地の回転方向のゼロ成分は `siteTransform` で正規化し、外観の各所で補正し直さない。

戸板、押して入る身体と室内側で開閉する身体、家具の使用面は `scripts/lib/door-axes.ts` の `doorAxes` から同じ閉じた向きと内向きを得る。鏡映した戸や壁の向きによって、それぞれ別の軸を選び直さない。

外観の入口戸は `scripts/lib/compile-envelope.ts` が `roomDoorSwing` の閉位置と蝶番を敷地座標へ投影する。壁面の開口中心は階段との接続に使い、戸板は壁厚分だけ室内側へ置く。`world/scene/construction/authored-building.ts` は枠の内端を開閉検査と同じ通り幅に置き、壁面から戸板までの見込みを枠と開口上面でつなぐ。

資料から作る平面の入口は `AuthoredPlan.entrySide` と開口セルの中心を持ち、`authoredFloorPlan` が外壁面上の二次元の点と外向きへ変換する。`interiorPlan` は同じ点と向きから戸口セルと内向きの到着セルを求め、`interiorRows` と室内の外壁開口も同じ入口を使う。戸口セルの中心は壁面より必ず内側に置く。外壁の角をまたぐ幅や、グリッドの戸口セルと一致しない入口は拒否する。既存の自動配置の平面が持つ南壁の入口は変更しない。

入口戸の縦の断面は `world/town/door-leaf-section.ts` が完成床からの下端と上端を求める。資料検査と外観の書出しが同じ関数を使い、描画は書き出した上下端を使う。開口高を戸板の高さへ流用せず、床と開口上端の隙間は資料で明示する。

戸板に付く部品の突出を含む厚みは `doorMovingThickness` が求める。室内の戸板回転、押して入る身体、閉め始めるまでの移動、開いた戸の通り幅はこの厚みを使う。外観の補強材と取っ手は同じ突出寸法を使い、板厚へ独自の倍率を掛けない。

戸の握る位置は `doorHandleAlong` が蝶番からの距離として読み、開閉の到達距離と外観の取っ手へ渡す。押して入る経路の連続検査では、身体と板全体の距離と、身体から握る位置までの距離を分ける。戸板の先端を握る位置へ置き換えない。

寸法を持つ寝台は `world/town/bed-parts.ts` の `bedParts` が脚・枠・床板・寝具・頭側の板へ分ける。`scripts/lib/bed-dimensions.ts` が資料を読み、資料検査と書出しが同じ部材区画の成立を確かめる。`interiorPlan` は寝台の全寸法を室内の縮尺へ一度だけ変換し、室内描画がその区画を使う。既存の寸法未設計の寝台は別に残し、新しい家の採用と混同しない。

椅子の facing は座面の幅・奥行きと別に保持し、`seatRect` が部材を座面の中心まわりに四方向へ投影する。背もたれと足掛けは同じ向きを使う。資料検査は明示した向きが割り当てた卓へ向くことと、座面の上の膝の空間を確認する。回転した椅子の幅と奥行きを、元の部材寸法を書き換えて表さない。

着席する人物の根元の補正は `seatedRoot` が身体のアニメーションと支持面から求め、実際の Actor と身体の照合が共有する。椅子の向きから身体の前進方向と角度を求め、活動位置を北向きの固定値へ置き換えない。

点と矩形、線分と矩形、線分同士の距離は `lib/engine/point-rect-distance.ts`・`segment-rect-distance.ts`・`segment-segment-distance.ts` に分ける。矩形と線分の境界の規則は `segment-intersects-rect.ts` に置く。敷地・道路・戸・運搬経路と身体の照合が共通の計算を使い、建物の資料検査を幾何計算の入口にしない。

棚の側板・背板と棚板は `world/town/shelf.ts` の `shelfParts` が同じ区画へ分け、`shelfBays` が棚板の厚みを引いた保管内寸を返す。`shelfItemParts` は棚板上面へ資料の物を載せ、内寸を越す物や重なる物を拒否する。資料の読み取りと検査・書出し、室内の縮尺変換と描画は同じ寸法を使う。四方向の点の回転は `lib/engine/quarter-turn-point.ts`、矩形の回転は `quarter-turn-rect.ts` が受け持ち、椅子と収納・卓上で共用する。矩形は囲いと回転数・任意の原点を名前付きの入力で受け、座標と回転を位置引数で混ぜない。

収納の引出しと身体の後退は `world/town/storage-retrieval.ts` が棚の正面に合わせて同時の直線経路へ投影する。`scripts/lib/storage-retrieval.ts` は相対運動を線分と矩形の距離で照合し、途中を飛ばさず身体と動く物の干渉を検査する。手が届く距離は相対位置の端点で最大となるため両端を照合する。使用面への収まりと壁・家具、同じ段のほかの物との干渉も確かめる。小箱の使用内寸は `storageBoxInterior` が壁・底・被せ蓋の厚みを除いて求める。

小箱の内寸は `world/town/storage-box-interior.ts`、底・側板・蓋の部材は `storage-box-parts.ts` が受け持つ。関連型は `storage-box-types.ts` にまとめ、蓋の取っ手の寸法判定と部材は `get-storage-lid-handle-error.ts`・`get-storage-lid-handle-parts.ts` で共用する。底・側板・取り外す平蓋の区画から、閉じた状態と蓋を上げた状態を描く。内部を塞ぐ一枚の塊を描く方法は使わず、保管容量と同じ空洞と内面を維持する。`world/scene/construction/storage-box.ts` が部材の内外と蓋の裏面を描く。

箱の蓋の移動先は、全資料を読み込んだ後に建物の該当階の天井へ照合する。読み込み順のために建物が未参照の状態で検査を済ませず、書出しでも同じ建物の断面を渡す。設計ゲートを通す箱に蓋の動きや照合できる天井がない場合は拒否する。

炉の正面は資料の `hearth_front` を書出しと縮尺変換で保持し、焚口と火の照明を同じ面へ向ける。矩形の面と法線は `lib/engine/rectangle-face.ts` が求め、使用位置の照合と描画で共有する。煙道は上下階の全室の家具へ離隔を照合し、寝台や別室の木製部材も除外しない。

煙道の床貫通は `world/town/flue-floor.ts` が木床と石縁を重ならない区画へ分ける。階段の穴を両方の材料から除き、石縁も建物の外へはみ出させない。上階の床厚を通す石縁の幅は資料の `floor_collar_m` を実行時の `floorCollar` へ渡し、屋内の拡大率を一度だけ適用する。

石縁の支持は `world/town/flue-corbel.ts` が段積みの部材へ分ける。床の上階から見ると床裏を上端に、下階から見ると天井を上端に置き、同じ断面を使う。支持の深さは縮尺変換し、段数は変えない。資料の書出しは張出しと深さ、段数、下階の立位高さを照合し、支持のない煙道を通さない。

煙道の肉厚と内寸は `world/town/flue-walls.ts` が外形から求め、内装の立上りと屋根上の煙突が同じ四方の石積みを描く。空洞へ上面の板を張らない。屋根の高さは `lib/engine/gable-roof-height.ts`、棟で分ける面は `gable-roof-panels.ts` が求め、資料の屋根高さの検査と外装が同じ勾配を使う。`get-gable-roof-halves.ts` が軒の張出しと棟の分割を持ち、関連する屋根と面の型は `gable-roof-types.ts` に置く。屋根面は煙突の外形を切り欠き、煙道を横切らない。

炉の火室と喉部は `world/town/hearth.ts` が寸法と正面から求め、煙道の内寸全体が火室へ接続することを確かめる。`lib/engine/cuboid-subtraction.ts` が石積みの立体から火室と喉部の空間を除く。資料検査と描画は同じ部材を使い、黒い面を外に貼って焚口を表す方法を設計済みの炉へ使わない。

炉の手入れの平面は `scripts/lib/hearth-maintenance.ts` が部屋資料の身体と使用面、家具・焚口・火室へ照合する。火室は描画と同じ `hearthChamber` から求め、手の到達距離は戸や収納と同じ定数を使う。部屋のグリッド検査から呼び、書出し時にも同じ条件を保つ。

手入れ道具の挿入線は `world/town/hearth-tool.ts` が炉の正面と握り位置から奥の左右へ投影する。部屋検査は手が握りへ届くことと、道具が焚口を通ることを別々に照合する。道具の長さへ腕の長さを足して不足を隠さない。

棚の `tool` は `world/town/stored-tool.ts` が棚板へ載る刃と細い柄の部材へ分ける。棚の内寸・向きと縮尺、取り出す経路は既存の棚と共有する。手入れ道具の参照は同じ部屋の棚と収納物へ解決し、使う寸法と保管する外形がずれた場合は拒否する。

炉の道具の運搬は `scripts/lib/hearth-carry.ts` が棚の引出し結果から相対外形を求める。平行移動中は障害物を道具の半幅ずつ拡張し、中心の線分を照合する。回転時は身体を止め、最も遠い角の半径を含む円を照合する。書出しと全資料の検査へ同じ建物の天井断面を渡す。

固定した向きの矩形の経路の外形は `lib/engine/rectangle-translation-bounds.ts`、連続した衝突は `rectangle-translation-hits.ts`、回転半径は `rectangle-turn-radius.ts` に置き、荷物と炉の道具の運搬が共用する。移動経路の外接矩形と、実際の連続した通過範囲の交差を区別する。線分と矩形の交差は `segmentIntersectsRect` にまとめ、距離の計算も同じ交差判定から始める。境界接触と許容差は呼び出し側が明示し、既存の検査条件を保つ。

持ち替えの道具の相対外形と回転中の保守的な外形は `world/town/handoff-envelope.ts` と `handoff-rotation-envelope.ts` が求める。`scripts/lib/hearth-handoff.ts` は棚からの引出しと運搬の終点を初期姿勢へ投影し、握りを基準に部屋の三次元の部材へ照合する。固定した向きの移動は `lib/engine/cuboid-translation-hits.ts` が各軸の交差区間を照合し、途中を飛ばさない。身体の幅と平面の手の到達距離は既存の設計条件を保持する。

腕の握りの位置と長さは `world/scene/figure/arm-grip-point.ts`・`arm-grip-lengths.ts`・`solve-arm-grip.ts` が実際の骨格と掌のアンカーから求め、native の腕の組み立てと共有する。`lib/engine/solve-two-bone.ts` は二本の固定長の節から中間関節を求め、到達範囲の外を未解決として返す。高さを固定する解は `solve-two-bone-at-height.ts`、区間全体の到達は `two-bone-segment-reach.ts`、関節の速度の上限は `two-bone-joint-speed-bound.ts` に分ける。手首の回転や身体の姿勢・干渉は、この関節位置の解だけで解決した扱いにしない。

作業時の傾きと刃の接触面は `world/town/hearth-work-tilt.ts` と `hearth-spatial-strokes.ts` が求める。床と奥壁へ当たる厚みを含む条件から傾きと握る長さを解き、持ち替えの末端も同じ外形を使う。作業の左右の握りを平面の到達条件へ、道具の全外形を家具へ照合する。

作業姿勢の候補は `world/scene/figure/native-work-pose.ts` が既存の足形を床へ接地し、固定長の腕へ握りを解く。`scripts/lib/native-work-pose.ts` は実際の身体形状の保守的な境界を室内へ照合する。炉・煙道と支持部・壁・開いた戸・ほかの家具は `scripts/lib/hearth-room-section.ts` が同じ部屋座標の断面へまとめ、持ち替えの検査と共有する。境界が重なる場合は未解決として残す。`lib/graphics/ray/primitive-bounds.ts` と `cylinder-bounds.ts` は描画形状の境界を扱い、ゲームの配置には依存しない。明示した骨格の描画は `renderSkeletonFrame` を既存の描画処理と共有する。 握りの軸は `hearthSpatialStrokes` が道具の傾きから求め、作業姿勢は身体の向きへ変換して手の取付軸を合わせる。ベクトルの回転は `lib/engine/qrot.ts`、回転の合成は `qmul.ts`、方向間の最小回転は `qfrom-to.ts` に置く。共通の型は `quaternion-types.ts` が持つ。手の表面は既存の形状のままであり、取付軸の一致を指や手首の可動域の照合済みとは扱わない。

身体と室内部材の境界の距離は `lib/engine/segment-cuboid-distance.ts` が面の交点で線分を区切り、`get-segment-cuboid-interval-minimum.ts` が各区間の端点と二次式の停留点を照合する。接触ぎりぎりの距離を点のサンプリングで代用しない。保守的な直方体の交差は `lib/engine/cuboid-translation-hits.ts` に置く。作業の支持を固定した候補の検査では、中央と両端を静止形状として照合する。連続した動作の囲いは静止した端の境界とは分けて扱う。

左右の靴形状は `world/scene/figure/legs.ts` が描画と同じ端点と半径で返し、`buildBody` が明示して渡す。`world/scene/figure/footing.ts` はその形状から床へ置く高さと各靴の最下点・隙間を求める。作業姿勢は図形の並び順から足を選ばず、資料の接地指定もこの結果へ照合する。

膝の衣服の半径も `world/scene/figure/legs.ts` が同じ脚の曲面の節から返す。`world/scene/figure/kneeling.ts` は指定された腰の下降から両靴を床へ置き、一方の膝を衣服の表面で床へ合わせる。`solveTwoBoneAtHeight` は指定した関節高さで二つの球を水平な円へ切り、円の交点から固定長の節を解く。靴の向きは維持し、脚の回転を新しい関節位置へ合わせてから作業の腕を解く。

支持を固定した作業範囲は `world/scene/figure/work-stroke.ts` が両端の姿勢を求める。`twoBoneSegmentReach` は肩から握りの線分への最短距離と両端の最大距離から、二本の節の外側と内側の到達条件を全区間で照合する。室内検査は中央と両端の形状を照合し、室内への連続した離隔は `world/scene/figure/work-stroke-clearance.ts` が照合する。

`world/scene/figure/arm-shape.ts` の係数から `native-arm-surfaces.ts` が腕と袖口の形状を作り、描画と検査で共有する。移動量の上限は `native-arm-motion-speed.ts` が同じ係数から求める。`twoBoneJointSpeedBound` は固定した肩と曲げる方向に対し、握りの直線区間で肘が動く速さの上限を求める。曲げる平面の特異点や伸び切る区間は未解決を返す。室内検査は中点の形状へその移動量を加えた保守的な囲いで区間全体を証明し、重なる区間は細分化する。有限の姿勢の標本だけでは成功にしない。身体自身との接触はこの室内検査の対象外として残す。

`world/town/working-tool.ts` は棚の道具と同じ刃・柄を、握りを原点とする直交座標へ組み直す。`world/scene/figure/tool-fixed-body-clearance.ts` はその座標へ身体を投影し、道具の全移動と固定した身体の境界を照合する。腕の形状は `buildArms` が左右を明示し、`buildBody` が返す。作業する腕は別の動く形状として扱い、反対の腕は固定した身体の検査へ含める。丸い錐体の連続にはカプセルの囲い、胴体の断面の連続には区間ごとの箱の囲いを描画の定義から受け取る。

袖口は `nativeArmSurfaces` が前腕の軸に垂直な手首の平面で切る。丸い端の前方への張出しを除き、掌の握る位置を衣服で覆わない。室内の離隔検査は切る前の保守的な囲いを引き続き使えるため、見た目を直すために検査の範囲を弱めない。

`world/scene/figure/working-arm-tool-clearance.ts` は刃と握る腕・手の全体、柄と上腕の離隔を、区間内の相対移動量を含む囲いで照合する。柄の全体が動く手首の平面より掌側にあることも前腕の方向の変化を含めて照合する。掌の内部の球は `nativeArmSurfaces` が描画と同じ位置と半径から返し、柄の握る断面を収める条件へ使う。道具の座標への射影は `projectToolFrame` を固定した身体の検査と共有する。掌の内部へ収まることと、握る指の接触面の設計は分ける。

作業候補の柄の断面は `world/town/working-tool.ts` が収納した道具から取り出し、`work-pose.ts` が骨格の任意の `handGrips` へ渡す。`arm-shape.ts` が描画と同じ掌から開口を引き、元の保守的な境界と素材分類を保持する。通常の骨格はこの追加情報を持たない。形状の条件は [[town#作業姿勢の掌と柄の接触]] に従う。

`world/scene/figure/forearm-body-clearance.ts` は作業する前腕・掌・袖口と固定した全身の離隔を照合する。区間の被覆は `certify-linear-interval.ts`、中点の移動の上限は `can-clear-work-forearm-interval.ts` に分け、既存の例外を返す呼出し境界を維持する。カプセルと断面の囲いで解決しない場合は `lib/engine/field-separation.ts` で符号の変化の上限を使い空間を細分化する。衣服の開いた裾の変化の上限は形状を作る `context.ts` が持ち、襟と首巻きも元の形状の囲いを渡す。判定の条件と上腕の残件は [[town#作業する前腕と身体の離隔]] に従う。

灰の受け容器の資料は `scripts/lib/ash-receiver.ts` が収納物へ結び、鉄の箱と蓋、実際の内側の容量、引出しと戸口の手前までの経路を照合する。`box_material` は `shelf-dimensions.ts` から `ShelfItem.boxMaterial` へ渡し、`scaleShelf` が寸法だけを縮尺へ変換し、`storage-box.ts` が木と鉄を既存の素材で描く。形状の底・側面・蓋は材質を変えても共有する。条件と未確認の工程は [[town#炉の灰の受け容器]] にある。

`world/town/storage-carry.ts` は身体と荷物の相対位置を保つ平面の移動と、その場の向き替えを照合する。手入れの道具と灰箱が同じ処理を使い、壁・家具・開いた戸の囲いは `scripts/lib/room-carry-obstacles.ts` が組み立てる。同じファイルの `roomEnvelopeObstacles` は壁と開いた戸だけを返し、炉の作業断面と灰箱の蓋の立体検査も共有する。対応する開口を持たない戸や、必要な枚数の戸板を組み立てられない資料は、障害物を省かず拒否する。収納物との接続、行先、立体の高さと用途の条件はそれぞれの検査が持つ。平面の通過を身体の動き、荷重や屋外の処理までの証明にしない。

箱の `lid_handle` は `shelf-dimensions.ts` が `ShelfItem.lidHandle` へ変換する。収納物の `height` は持ち手を含む外形の高さとし、`storageBoxInterior` が持ち手の高さを引いて箱本体の内寸を求める。`shelfLidHandle` は棚の向きから持ち手の軸を決め、`storageBoxParts` が蓋と一緒に動く三つの部材を返す。規則は [[town#灰箱の蓋の持ち手]] にある。

`world/town/storage-lid-plan.ts` は箱を床へ下ろす区間と、蓋・持ち手だけを動かす三つの区間を組み立てる。同じ部材配列から表示する状態と全区間の移動検査を求める。`scripts/lib/ash-lid-rest-plan.ts` は元の収納物を棚から取り除いた状態を作り、棚の部材と残る収納物、壁、開いた戸、炉の石積み、灯りと生活の小物へ照合する。形状が未定義の家具と小物は全高の囲いを空ける。支持面と未照合の操作は [[town#灰箱の蓋の置き場所]] に従う。

基礎と各階の厚み・高さは `assertAuthoredFloorLevels` を資料の変換と実行時の平面の組立てで共有する。資料の変換は、重い配置と動作の照合より先にこの構造を検査する。基礎がない資料を最後まで組み立ててから拒否する処理を避け、条件とテストの時間制限は保持する。

`world/town/certify-storage-translation.ts` は収納物の部材の直線移動を、部屋の断面と障害物へ全区間で照合する。箱を運ぶ高さへ持ち上げる区間と、蓋を外して置く区間が同じ処理を使う。灰箱の持上げには `storageLidState` が返す床上の閉鎖状態を渡し、別の高さから箱を作り直さない。`getStorageClosureError` は収納から引き出した部材を下ろした状態と、蓋を戻す状態の部材が一致することを確認する。各区間の衝突がなくても、その間に部材の位置が飛ぶ経路は拒否する。灰箱の運搬は部屋の立体の障害物のうち身体と箱の高さに入るものも平面の経路と向き替えへ加え、床の家具だけが空くことを通過条件にしない。設計の条件は [[town#炉の灰の受け容器]] に従う。

ルートの `#/*` 参照は `package.json` と `tsconfig.json` で同じ対象へ向ける。後者は設定検査を実行する Bun でも参照を解決するために持ち、Void が生成する `void/routes` の型も残す。

`scripts/lib/get-ash-receiving-parts.ts` は収納の箱と受け位置のメタデータから蓋を外した同じ部材を組み立てる。部屋への配置と、実際の骨格の身体・道具の静止位置と連続する左右の作業の検査が、この形状を障害物として共有する。入力の形と未確認の方法は `ash-receiving-schema.ts` が検査する。灰の移載の設計条件は [[town#炉の横の灰の受け位置]] に従う。

`world/town/get-upright-storage-offsets.ts` は空箱の持上げ、身体の位置に沿う水平移動、手前の位置での下降を一続きの変位へ変換する。`get-storage-path-error.ts` はその全区間と、蓋の各区間で実物の部材を照合する。`scripts/lib/get-ash-approach-error.ts` は身体の幅と頭上の余裕も加えて照合する。灰箱の検査では専用棚に置いた蓋を障害物として残す。範囲と未確認の工程は [[town#空の灰箱を炉の手前へ運ぶ]] に従う。

`get-box-side-grips.ts` は箱の実物の手前の角と描画する掌の半径から左右の目標を求め、`solve-bimanual-grip.ts` は左右の肩と元の骨の長さを保って関節を解く。`scripts/lib/get-native-box-grip-candidate.ts` は立位の接地と座標の変換を組み立て、`get-box-core-clearance-error.ts` が両腕を除く身体の保守的な囲いと箱を照合する。資料の候補は灰箱の設定検査へ接続する。未照合の接触と動作は [[town#空の灰箱を両手で持つ姿勢]] に従う。

`get-box-arm-clearance-error.ts` は `nativeArmSurfaces` の上腕・前腕と切断前の袖口のカプセルを箱へ照合する。`to-carrier-local-point.ts` と `to-carrier-world-point.ts` は同じ接地した身体の原点を使い、両腕の解と室内の箱を同じ座標で扱う。掌と指の接触はこの離隔へ含めず、[[town#灰箱を持つ腕と袖口の離隔]] に従う。

野外の生き物の時刻からの位置は `world/core/monster-at.ts` が求める。基点と休憩地点は `get-monster-home.ts`・`get-monster-rest.ts`、位相は `get-monster-motion-hash.ts` をサーバーと描画で共有する。経路は `get-monster-route.ts` が組み立てる。`lib/engine/get-grid-segment-cells.ts` が線分の通るセルと角の隣接セルを列挙し、塞がれた経路だけ `GridPathfinder` の格子経路へ迂回する。`get-monster-route-position.ts` が経路の距離と時刻から位置を求める。`MonsterMotion` は休憩地点に加えて隣接する固定数の経路だけを保持し、毎フレームの通行判定を増やさない。移動の条件は [[game-system#野外の生き物の移動の足場]] に従う。

モンスターの身体の寸法は `world/core/monster-body-shapes.ts` が持ち、描画のメッシュと伸縮の式が同じ値を読む。`get-monster-body-radius.ts` は各種の拡大率と変形を含む水平の囲いを求める。`lib/engine/get-swept-grid-clearance-error.ts` は移動する円と塞がれたセルの矩形の距離を全区間で検査する。`create-monster-navigation-free.ts` が身体の囲いと探索地点への接続を検査し、休憩地点と格子経路へ採用する。探索の格子と元の通行格子は分け、迂回経路の各区間を `get-monster-segment-error.ts` で元の通行格子へ照合する。直線の全身の通過が証明できた場合、その証明には両端の休憩地点の身体も含まれるため、同じ区間と端点の検査を重ねず経路を返す。直線が不成立なら休憩地点を個別に確認して迂回し、別の照会へ証明結果を持ち越して地形の変更を隠さない。

野外の設定資料の生息面は `scripts/lib/ecology-zone-schema.ts` が構造を定め、`audit-ecology-zones.ts` が実行時の登録種との網羅を照合する。格子と現在の通行地形、各面の矩形と利用位置、身体の囲いでの経路を別の検査へ分ける。これらは資料の検査であり、実行時の資源配置や採食の動作を生成しない。配置案と未配置の条件は設計ゲートを通過させない。

`get-ecology-territory-errors.ts` は種ごとの各出現範囲に生息面の利用位置があるかを照合する。同じ矩形を共有する個体は一度だけ検査し、位置の網羅を個体ごとの行動・利用時間や経路の完成と区別する。対象種と範囲は `world/core/monsters.ts` の出現定義から渡し、検査用の種一覧を別に管理しない。

生息面の `placement.sites` は、それぞれ独立した格子と資源・利用位置、水分収支と未照合条件を持つ。`get-ecology-placement-errors.ts` が区画 ID の重複を検査し、`get-ecology-site-errors.ts` が区画内の地形と利用位置・経路を照合する。`get-ecology-site-territories.ts` は区画の格子が登録された出現範囲へ収まるかを判定する。種が同じでも離れた区画の間に経路を補わず、未設計の土地を挟む別々の生活場所として扱う。

`get-carrier-room-clearance-error.ts` は描画の身体部材の囲いを室内の立体へ照合する。`ashLidRestPlan` は灰箱と作業の床の用途を守る `section` と、卓の実形状を使う身体の `carrierSection` を分ける。身体側も棚・灯り・小物の障害物は保持し、床の箱と取り外して置いた蓋はそれぞれの状態で照合する。卓の実形状は描画と共用する `workTableSections` を読み、通路幅の床の占有は保つ。

`get-carrier-translation-error.ts` は描画する固定した姿勢の全身の部材の囲いを連続して平行移動し、`get-carrier-room-clearance-error.ts` は始点と終点を同じ位置にして共用する。移動の両端の室内への収まりと、各部材の全区間の障害物への接触を照合する。`get-ash-transport-error.ts` は身体と箱を同じ変位で移し、握りの候補と手前の身体の待機位置への接続も検査する。固定姿勢の空間の案に限り、歩行・持上げの動作を生成しない。

`solve-held-box-pose.ts` は入力した姿勢を保って両手の目標を解き、身体と腕の箱への離隔を検査する。立位の `getNativeBoxGripCandidate` は既存の idle を渡す。`get-ash-gait-error.ts` は資料が指す運搬アニメの全描画姿勢を渡し、各姿勢の身体と箱の経路を検査する。元の骨の長さと脚の動きを維持し、姿勢間の接地や速度、移動方向、荷重をこの照合から推定しない。

`world/town/get-carry-step-direction.ts` は経路の変位を身体の向きへ戻し、前進・後退・左右の横移動を判定する。`scripts/lib/get-ash-step-plan-error.ts` は各区間の記録と照合し、前進の再生を後退へ、前進・逆順の再生を横移動へ流用する入力を拒否する。未割当の区間は資料に null として残し、各描画姿勢の空間の検査と、方向に合う実際の足運びを区別する。

`get-carry-gait-frame.ts` は同じ周期のフレーム番号を前進・逆順へ対応させ、負の時刻や周期の境界でも有効な番号を返す。`get-held-box-gait-pose.ts` は対応する元の運搬姿勢を取り、箱への両手の到達を解く。資料の動作と再生方向は対で検証し、検査は前進と逆順の全姿勢で室内の経路を照合する。フレームの順序を変える処理から、移動速度・接地や荷重まで正しいと推定しない。

`get-side-step-offsets.ts` は横移動の一周期の足の目標と身体の変位を求める。`get-native-side-step-pose.ts` は膝を曲げる余地を持つ元の姿勢から、`solve-foot-target.ts` で元の骨の長さを保って両足を解く。`get-held-box-side-step-pose.ts` がその姿勢で両手を同じ箱へ解き直す。骨の平行移動には `rig.ts` の順序を固定した骨の一覧を共用し、未知の骨名への型変換を足さない。`get-ash-gait-error.ts` は既存クリップの各姿勢と、横移動の標本姿勢の検査を分けて組み合わせる。

`get-side-step-plan.ts` は横移動の区間を歩幅の上限以下の完結した周期へ分け、`get-side-step-state.ts` が進行に対応する身体の位置と周期・位相を求める。始点と終点は元の値へ一致させ、終点は両足が揃う位相にする。設定の検査は方向ごとに一度だけの最大歩幅ではなく、各区間へ配分した実際の歩幅で姿勢を照合する。時間や速度の計算をこの配分へ混ぜない。

`lib/engine/get-rest-to-rest-profile.ts` は単位距離と時間に対する進行・速度・加速度と、その最大値を定義する。`get-side-step-timing.ts` が各区間の周期と設計した上限から時間を求め、`get-timed-side-step-state.ts` が同じ進行を身体の位置と足の位相へ渡す。開始前と到着後は端点で静止する。時間の上限の検査と姿勢の立体・重心や荷重の検査を混同しない。

`get-padded-frame-layout.ts` は画素の倍率を変えず透明な描画範囲と原点を一緒に広げる。`get-padded-pose-frame.ts` は手続き的な姿勢の画像と足元の原点を対で返す。通常の固定フレームと素材の配置は維持し、余白を使う姿勢だけがこの経路を選ぶ。

収納の資料の入力は `shelf-frame-schema.ts` と `shelf-item-schema.ts` で形と単位名の対応を定義する。`get-shelf-item.ts` は不正な収納物を Error で返し、既存の検査の入口 `shelfDimensions` だけが例外へ変換する。物の収まり、箱の内寸と取り出す経路は同じ `world/town/` の計算で照合し、入力の文字列を数へ強制変換しない。

`world/town/get-cloth-drying-layout.ts` は物干しの横棒に掛ける布の保守的な囲いと受け皿の平面を求める。設定の `cloth-drying-schema.ts` が実寸の入力を検証し、`audit-cloth-drying.ts` が室内物干しの検査へ組み込む。`get-cloth-storage-error.ts` は同じ部屋の棚を解決し、乾いた全枚数の折り畳んだ寸法を照合する。物干しの枠の占有と、布の立体・収納、乾燥能力を分けて扱う。

`lib/engine/get-box-layout-error.ts` は容器の内側へ置く固体の囲いの収まり、重なりと必要な間隔を検査する。`get-dish-drying-layout.ts` が受け皿と格子、水切りの器の配置へ使い、`get-dish-storage-error.ts` が同じ器の外形を箱の内寸へ使う。`audit-dish-drying.ts` は入力スキーマと部屋の家具への参照を解決して設定の全体検査へ接続する。中空の器の入れ子と物の支持は、この囲いの検査から推定しない。

`get-bowl-profile.ts` は鉢の同じ外形から平らな底・内外の断面と内側の使用容量を求める。`get-drying-dish.ts` が資料の外形と断面を照合し、口の厚みの中央の接触円と外形の囲いを分けて渡す。収納で `box_floor` を指定する物は底へ直接置く配置に限定し、囲いの重なりだけがない浮いた配置や未設計の積重ねを通さない。

`get-slat-grid-layout.ts` は水切りの枠・棒・脚の同じ実寸の部材を返す。原点は枠の下面で、脚が受け皿の底へ下がる。`get-ring-slat-support.ts` は棒の中心線と口の中央の円の接触を求め、中心の周囲に余裕を残す支持矩形を検査する。`get-drying-grid-layout.ts` が同じ格子の棒を各鉢へ渡す。`get-drying-dishes.ts` は各物の形の照合と接触円の組立てをまとめ、外形の囲いと接触の半径を混同しない。

`get-seated-contacts.ts` は元の着席フレームと同じ根元の補正・向きから靴と衣服を含む膝を室内へ移す。`get-seated-leg-error.ts` は床への接地と卓の部材への立体の離隔を照合し、非有限な値や欠けた接触点を成功にしない。設定の `audit-seated-meal.ts` は住民と本人の椅子を解決し、`get-dining-seat-geometry.ts` と `get-native-dining-seat-error.ts` で全描画フレームへつなぐ。靴をプリミティブ配列の順番で拾わず、描画が返す `footwear` と `knees` を使う。

食卓と本人の席の入力は `household-meal-schema.ts` にまとめ、資料の形と着席の検査へ共用する。`get-tableware-inventory.ts` は同じ家の台所の一つの食器の定義を解決し、`get-place-setting-boxes.ts` が本人と席・向きへ割り当てる。`get-place-settings-error.ts` は元の寸法で卓上の囲いと間隔を検査し、`audit-place-settings.ts` が全体検査へ接続する。元の資料を変更せず、居間に寸法や物を複製する代わりに ID を保持する。

`get-seated-native-pose.ts` は着席の根元と元のフレームを一か所で組み立て、接地と手の準備姿勢で共用する。`get-seated-reach-pose.ts` が同じ姿勢の片腕を固定長で解き、`get-seated-arm-clearance-error.ts` が両腕・掌と袖口を静的な障害物へ照合する。設定の `get-place-reach-error.ts` は本人と前へ座る位置・回転後の食器を解決し、全員の物を残したまま各描画フレームの上方の準備点を照合する。物へ触れる指と手首、姿勢間の全区間、身体自身の干渉は別に扱う。

`get-seated-withdrawal-error.ts` は各元のフレームの掌と肘から始まる低い引戻しを検査する。`certify-seated-arm-segment.ts` は区間への固定長の到達を照合し、`can-clear-seated-arm-interval.ts` が既存の肘の速度の上限と腕の部材の速度の上限で中点の囲いを広げる。未解決の区間を分け、限度で拒否し、通過した区間の列を入力から独立した値で返す。`get-dining-reach-space.ts` は引戻しと上方の準備点へ、同じ卓と全員の食器を渡す。`get-seated-withdrawal-frame.ts` が引戻しと肘の切替えに同じ元の姿勢と終点を渡す。`certify-seated-elbow-swivel.ts` は掌を固定した肘の切替えを、`get-two-bone-pole-speed-bound.ts` の射影の最小距離と速度の上限で照合する。線分の細分と全区間を覆う結果は、ゲームへ依存しない `certify-linear-interval.ts` で共有する。

`get-diner-arm-preparation-error.ts` は引戻し・肘の切替え・持上げを順に検査し、`get-diner-object-reach-error.ts` が前進の終点から各物の上方への移動をつなぐ。前進の指定がない案は持上げの終点から照合する。`get-seated-reach-path-error.ts` は同じ元の着席フレームを固定して各直線区間を照合する。資料の工程の前提が欠ける入力はスキーマと検査の境界で拒否する。時間と身体自身の干渉、物への接触と実行時の食事は別の未完了の範囲である。


## 前腕の自己干渉と形状の離隔の共有

`lib/graphics/ray/can-separate-surface-from-primitive.ts` は丸い先細りの面と描画部材の離隔を求める。最初に `lib/engine/are-expanded-bounds-separated.ts` が有限で向きの正しい囲いと移動の余地を照合し、全方向へ余地を加えても外形が離れる組だけを確定する。接触と範囲の重なりはここでは確定せず、`can-separate-surface-envelopes.ts` のカプセル・断面の囲い、必要なら `can-separate-surface-fields.ts` の符号付きの面の区間検査へ進める。

円錐の面と変化の上限は `get-cone-separation-field.ts` から取る。移動の余裕を面の囲いと判定の両方へ加え、負の余裕は拒否する。形状に変化の上限がない場合は、外接範囲を障害物として保守的に扱う。囲いとカプセルは同じ一組の照合の中で共有し、姿勢をまたぐ結果の保持を追加しない。

元の腕と脚の丸い先細りの面は、描画を変えずに変化の上限を形状のメタデータへ持たせる。`get-forearm-self-clearance-error.ts` は動かす腕の部材だけを本人の固定した部材から除き、前腕・掌と切る前の袖口を照合する。肩の付根と上腕、動く盾はこの照合の対象として成立済みとしない。着席姿勢の実際の不整合と未採用の候補は [[room-h1-1#元の着席姿勢の前腕と脚の食い込み]] にある。


## 資料の着席開始姿勢の適用

`with-seated-rest-arms.ts` は左右の掌の目標を椅子の座標から元の骨格へ変換し、元の骨長で解いて両腕の肘と手首だけを置き換える。`get-seated-native-pose.ts` は資料の `rest` が渡された場合だけこの姿勢を使い、未指定の実行時の着席と根元の計算は保持する。`get-seated-rest-error.ts` が全着席フレームの開始姿勢について前腕の自己干渉と卓・食器の離隔を照合する。

`get-diner-arm-preparation-error.ts` は開始姿勢を検査してから引戻しへ渡す。引戻し・肘の切替え・持上げと物の上方への前進は同じ `rest` を渡し、段階の境目で反対の腕を戻さない。これは設計案の計算であり、元のクリップや実行時のすべての着席へ一律に補正をかける処理ではない。


## 着席の前腕の連続した自己干渉の照合

`get-seated-arm-clearance-error.ts` は `selfClearance` が指定された場合に `get-seated-forearm-self-error.ts` を呼ぶ。動かす前腕の面へ、肘と掌の速度の上限から求めた同じ移動の余裕を加え、固定した本人の部材へ照合する。静的な姿勢では両前腕を調べ、移動区間では動かす前腕から固定した反対の腕と全身を調べる。固定した部材に移動の余裕がないという理由で、動く腕との組を検査から除外しない。

資料の開始姿勢を指定した引戻し・持上げと前進、肘の向きの切替えと上方の準備姿勢はこの照合を使う。`get-diner-hand-lift-error.ts` が持上げ用の向け先と、持上げ後の固定した掌での切替えを結ぶ。`get-seated-pole-path-error.ts` が各元のフレームで切替えの全区間を照合する。`get-diner-hand-advance-error.ts` は同じ持上げの終点から資料の前進位置へ、`get-diner-object-reach-error.ts` はその位置から各物へ接続する。

`get-primitive-capsule-bounds.ts` は個別の囲いを優先し、未指定の SDF は描画が光線を制限する外接球を使う。空の補助の囲いを離隔の証明にせず、SDF に球の拡大率を適用しない。カプセルで分離を証明できなくても、`get-primitive-capsule-field.ts` がその囲いの符号付きの面を渡し、移動する先細りの面を精密に照合できる。未確認の頭や髪の面へ任意の変化の上限を付けず、証明済みの囲いを障害物として保つ。


## 椅子の実物の部材の共有

`world/town/get-chair-sections.ts` は座面、脚、背もたれと足置きの回転した部材を返す。`world/scene/construction/chair.ts` はこの部材へ既存の素材と表面の細かさを割り当てて描く。寸法のない既存の椅子の脚の内寄せと背の厚み、背のない揺り椅子の扱いも呼出し側で明示し、共用によって元の形を変えない。

`get-dining-seat-geometry.ts` は同じ関数から椅子の部材を得る。`get-native-dining-chair-error.ts` は各元の着席フレームと、指定された両手の開始姿勢を `get-seated-chair-frame-error.ts` へ渡す。`get-native-dining-seat-error.ts` が元の姿勢を、`get-diner-arm-preparation-error.ts` が資料の開始姿勢を照合する。枠への離隔は前腕だけでなく全描画部材を対象とし、四本の脚がない入力を拒否する。座面の支持はこの検査へ混ぜない。

`to-heading-local-cuboid.ts` は実物の部材の全角を同じ身体の原点と向きで変換し、`lib/graphics/ray/can-separate-primitive-from-cuboid.ts` が身体の部材の囲いと、変化の上限が分かる面を使って離隔を照合する。分からない面へ任意の上限を付けず、カプセルの囲いを使う。細分しても離隔が証明できない場合は未解決として拒否する。


## 着席した男性の裾の形状

`world/scene/figure/get-folded-garment-geometry.ts` は腰と膝から、腰の区間と腿に沿う区間を組み立てる。`get-tunic-geometry.ts` と `build-coat-tails.ts` が同じ形状を使い、上着は開口と裏地・縁の材質を追加する。椅子の寸法で衣服を切り取らない。立位と膝をつく形状は従来の描画へ渡す。

`lib/graphics/ray/get-elliptical-frustum-field.ts` は断面を圧縮した中実または中空の面と保守的な変化の上限を返す。`get-union-field-primitive.ts` は各面の有効範囲を保持して一つの描画部材へまとめる。材質の進行と裏地の判定は形状の離隔の上限と分ける。

`get-native-dining-garment-seat-error.ts` は明示された住民の全着席フレームを `get-seated-garment-seat-error.ts` へ渡す。プリミティブの番号で衣服を推測せず、描画が返す `tunicParts` と `coatTailParts` を使う。対象と限界は [[room-h1-1#男性の裾を腿へ沿わせる]] に従う。


## 支持面へ沿う腿の衣服

`world/scene/figure/get-supported-thigh-field.ts` は腿の下面を身体の支持高さへ沿わせ、下腿は元の曲面を保つ。`create-leg-limb.ts` は座り姿勢のズボンだけにこれを使い、`build-leg.ts` が片脚の膝・靴・ズボンの部材を取得する。`legs.ts` は左脚、右脚の順に取得し、左右が揃った結果と `trouserParts` を返す。立位と膝をつく形状は元の描画を保つ。

形状は下面を支える腿と、切らない下腿のそれぞれの保守的な囲いも返す。`can-rest-garment-on-seat.ts` は同じ囲いで座面の内部への侵入を拒否し、支持面への接触は離隔を広げずに認める。`get-seated-garment-seat-error.ts` が男性の胴衣・上着の裾と同じ実際の座面へ照合する。身体の支持力の証明とは区別する。


## 着席したスカートの経路と各層

`get-skirt-dimensions.ts` が立位と着席で共用する元の外見の寸法を返す。`get-draped-skirt-profile.ts` は腰から裾までの基準長を、腰から尻、腿の上、膝の前の垂れへ配分する。`get-draped-skirt-sections.ts` は各区間を同じ楕円の断面の面へ変換し、白い縁は裾の帯の区間へ限定する。`get-draped-skirt-geometry.ts` が描画部材と区間ごとの囲い、布に沿った材質の進行を返す。立位と膝をつく形状は従来の描画を使う。

`build-draped-overskirt.ts` は同じ経路へ前開き・裏地・縁を加える。`clothes.ts` は基布・重ね布・白い縁の実際の描画部材を `skirtParts` として返す。`get-seated-skirt-seat-error.ts` が全層とズボンを実物の座面へ照合し、欠けた層と別の衣服の成功を拒否する。資料の対象住民は `get-reviewed-dining-body-error.ts` が解決し、全フレームの照合を共用する。


## 住民の外見と設定資料

住民の設定資料は `appearance_source` で実際の描画用の定義を参照する。`scripts/lib/audit-resident-appearance-sources.ts` は本人の名前を `RESIDENTS` へ解決し、同じ位置の `RESIDENT_LOOKS` が存在することを検査する。元の服装の複写と、別の住民や元の定義だけを指す参照を拒否する。日課と同様、実行時の定義と資料の別々の写しを保守しない。


## 家庭の飲用水と運搬の案

`potable-water-supply-schema.ts` は家庭の供給と施設の受渡しの案を分ける。`audit-potable-water-supply.ts` が部屋の前提と未完了のゲートを確認し、`get-potable-water-handling-limit.ts` で家・部屋・担当者と施設の所属を解決する。施設の用途と未完了の状態は `get-potable-water-collection-error.ts` が照合する。

`get-potable-water-vessel-error.ts` は同じ配置済みの容器の ID と飲用専用の流れ、仮の荷重と汚水経路への流用を照合する。容器の外形と内側の体積の検査は既存の `auditTransportContainers` を共用する。汚物の material_routes の型と荷重モデルへ飲用水を混ぜず、図形と仮の重量の成功から水質・日課と供給能力の完成を推定しない。


## 井戸の受取り床と元の通行格子

`water-landing-schema.ts` は受取り・一人分の待機・退出の配列と格子を持つ。`get-water-collection-landing-error.ts` が格子と区画の一致、順序ごとの通行幅、元の地面の照合を組み立てる。`get-water-landing-grid-error.ts` は範囲と使用面、`get-water-landing-flow-error.ts` は他の段階の利用者を避ける経路の幅を確認する。

`get-water-landing-ground-error.ts` は同じ床の全範囲を現行の通行格子へ投影し、`lib/engine/get-grid-rectangle-clearance-error.ts` で途中も含む全セルを調べる。井戸の衝突半径は `world/town/well-dimensions.ts` を既存の描画と共用し、二つの値を別々に調整しない。屋内の壁や家具の格子と同一視せず、この受取り床から井戸の敷地全体を自動で埋めたり現行の地面を変更したりしない。


## 受取り床へ立つ住民の水平な範囲

`world/scene/get-standing-footprint-error.ts` は buildBody が返す全ての実際の描画部材の保守的な囲いを、同じ向きと縮尺で床へ移す。中心の点だけで通さず、髪や衣服・手足を含む全範囲を確認する。屋外の FIG と FIG_PPU は `world/scene/figure/display-scale.ts` を描画と照合で共用し、actors.ts の公開する名前は維持する。

`water-landing-body-schema.ts` が対象住民と空手のクリップ、区画ごとの位置と向きを持つ。`get-water-landing-body-error.ts` が登録された本人と全区画の割当を解決し、`get-water-standing-placement-error.ts` が各クリップの全フレームを照合する。井戸の名前付きの描画の立ち位置は `world/town/get-well-place.ts` を町の描画と資料の照合で共用する。歩行セルへの丸めとは分け、同じ位置を二つの定義へ写さない。


## 同じ部材から作る飲用水の壺と静的な把持

`get-water-vessel-profile.ts` は中空の胴と底・蓋・つまみ、耳取っ手の成立を計算し、`get-water-vessel-parts.ts` が同じ部材を返す。`get-water-vessel-definition.ts` が資料の配置済み容器へ結ぶ。内側の容量と全高、取っ手を含む範囲を別の調整用の写しへしない。

`get-water-vessel-grip-pose.ts` は部材を指定された身体の縮尺と接地した根元へ移し、両手を元の骨長で解く。`get-water-handle-grip-profile.ts` が実際の棒を囲う掌の開口を作り、`get-water-grip-bar-error.ts` が棒全体の開口内への包含と袖口の面への離隔を照合する。`get-water-jar-body-error.ts` と `get-water-handle-body-error.ts` は壺の胴と各棒を実際の全身へ照合し、認める接触だけを分ける。`get-held-water-vessel-pose.ts` は前腕の自己干渉も含めて組み立てる。

`get-water-standing-placement.ts` は空手と持った姿勢で同じ床と位置・向きを共用する。`get-water-vessel-grip-review-error.ts` が全静的フレームを照合し、`get-water-vessel-landing-error.ts` は解いた身体と壺を同じ受取り床へ渡す。

`get-water-vessel-primitives.ts` は同じ部材から既存の陶器のパレットの描画部材を作る。renderSkeletonFrame と getPaddedPoseFrame は extraPrimitives を通常の深度と輪郭の描画へ渡し、`append-primitives.ts` が身体の ID と衝突しない番号を付ける。床の囲いの検査も同じ追加部材を使う。追加のない既存の描画は元の部材列を保持する。


## 台所の壺の支持と持上げの始点

`get-water-vessel-support-parts.ts` は資料の壁棚から天板・背板と二本の支えを返す。`get-water-vessel-support.ts` が西壁への取付けと扉の回避、棚と同じ壺の収まりを解決する。`get-water-pickup-proposal.ts` が本人と製作者の前提、操作床・向きと棚上の壺の位置を解決し、検査と描画に渡せる形へ分ける。

`get-water-pickup-review-error.ts` は室内の身体の縮尺で待機と見回しの全フレームを解く。`get-water-support-body-error.ts` は靴を含む全身と実際の棚の部材、`get-water-pickup-floor-error.ts` は身体と壺の水平な囲いと周囲の家具を照合する。壺の区画だけは同じ三次元の支持の照合と組み合わせ、他の家具を除外しない。`get-horizontal-bounds.ts` は全ての囲いの四隅を回して床へ移す共通の計算である。


## 両手で持つ壺の鉛直な持上げ

`get-arm-grip-motion-bound.ts` は固定した肩と骨長、一直線に動く把持点から肘・手首・前腕の向きと実際の腕の表面の速度の上限を返す。`get-water-grip-motion-bounds.ts` が同じ二本の棒を解決し、`get-water-motion-interval.ts` は中点で解いた身体と壺、区間全体を覆う余裕へまとめる。

`get-water-motion-grip-error.ts` は掌の開口と回転する袖口の面、`get-water-motion-body-error.ts` は両前腕から本人への離隔、`get-water-motion-vessel-body-error.ts` は壺の全部材から全身への離隔を照合する。動く穴を持つ皮膚の中点だけを信用せず、切り欠く前の腕を保守的な囲いに使う。 同じ呼出しと姿勢の中では前腕・切断前の袖口と壺の棒の面を一度だけ組み立て、全身の各部材との照合へ共有する。姿勢をまたいで保持せず、移動の余裕と全ての部材の判定を維持する。

`get-water-motion-support-error.ts` は動く両腕と固定した全身から棚までを照合する。`get-water-vessel-support-motion-error.ts` は同じ部材の平行移動を掃引し、最初の支持面への接触と、内部への侵入を分ける。`get-water-motion-floor-error.ts` が身体と壺の区間全体の囲いを床へ照合する。`get-water-lift-interval-error.ts` はこれらを同じ区間で組み合わせ、`get-water-lift-review-error.ts` が全対象フレームを固定するごとに全区間を隙間なく認証する。フレーム間の補間と時間・力学はこの証明に含めない。


## 壺を持って棚から離れる後ろ歩き

`get-backstep-offsets.ts` は一方の足を引いてから他方を揃える順序と、身体の移動を打ち消す接地足の位置、足の持上げと腰の上下を返す。`get-native-backstep-pose.ts` が元の骨長と足先の向きを保って両脚を解く。`lower-native-pose.ts` は下げ幅がゼロなら同じ姿勢を返し、負や非有限な幅は拒否する。最初と最後の姿勢を、余計な変更を挟まずつなぐためである。

`get-native-backstep-cycle-pose.ts` は一巡の終点を次の始点へ渡し、最初の両足の接地に合わせる腰の下げ幅だけを一度適用する。`get-water-backstep-proposal.ts` が同じ持上げの終点、後退方向と操作床を解決し、`get-water-backstep-frame.ts` が足運びの身体と同じ壺へ両手を解く。

`get-water-backstep-review-error.ts` は各巡の全標本で同じ身体と壺を棚・周囲の家具と床へ照合する。これは連続した離隔、荷重と支持域、速度と加減速の証明ではなく、実行時の日課へもまだ渡さない。


## 家庭用水の在庫と容器の利用状態

[[game-system#家庭用水の在庫の設計]] の純粋な状態と操作は `water-stock-types.ts` にあり、`create-water-stock.ts` で開始し、`apply-water-stock-command.ts` を入口に使う。`get-water-stock-error.ts` は整数の記録範囲と水量の保存を検査する。保管・往路・水源・復路と手入れの状態の遷移は `move-water-vessel.ts`、受取は `fill-water-vessel.ts`、用途別の取出しと廃棄は `withdraw-water.ts` に分ける。状態と用途別の集計は読み取り専用で、失敗時に元の状態を書き換えない。

`water-stock-plan-schema.ts` は資料にある単一容器の利用者と用途・予備なしの案を読み、`get-potable-water-stock-plan-error.ts` が同居人と家・町の登録と前提、既存の運搬上限を照合する。設定資料の容量はリットルで持ち、正確なミリリットルで表せない上限は丸めず拒否する。

この規則はまだ日課・サーバーの永続在庫や操作の公開 API へ接続していない。将来の呼出し側が容器の固有 ID と実際の位置・受渡しを管理し、日ごとの必要量・水質と手入れ、廃棄先を確かめてから採用する。


## 茶器の断面と水切りの入替え

`get-cup-profile.ts` は既存の鉢の中空の断面へ、壁の中に根元がつながる一つの耳取っ手を加える。`get-cup-definition.ts` が資料の取っ手を含む外形と照合する。`create-cup.ts` と `create-cup-handle.ts` は同じ断面と棒の端点を既存の陶器の素材で描き、乾燥時も同じ形を伏せる。

`get-dish-drying-batches.ts` は全ての物が一つの組へ一度だけ入ることを確認する。`get-dish-drying-batch-layout.ts` が各組へ同じ受け皿と格子を渡す。`get-drying-dish-boxes.ts` が全外形の収まりと空気の間隔、`get-drying-rim-error.ts` と `get-drying-grid-support.ts` が胴の口の位置と格子の支持を照合する。取っ手を含む囲いの中心を、杯の口の中心へ流用しない。

`get-tableware-group.ts` は同じ台所の指定された組を食事または茶の在庫として解決する。`get-tableware-inventory.ts` は全在庫の固有 ID の検査を維持したうえで、指定の組と既存の席への配膳を結ぶ。茶器と水切りの入替え・茶の配膳の日課への採用はまだ行わない。


## 調理炉の鉄板と同じ煙道の描画

`get-cooking-top-box.ts` は炉の正面から板を求め、火室の上端への一致と左右の壁の受け幅を照合する。`get-cooking-hearth-parts.ts` が既存の火室と煙道を保って石材から板の体積を除き、板が煙道へ入る場合は拒否する。`get-hearth-render-parts.ts` は調理板を持つ炉と通常の炉を同じ部材の契約へまとめる。

`get-cooking-hearth-definition.ts` は部屋の水平位置を建物の共通座標へ移し、上階の実際の煙道を解決する。高さはその階の床からの値である。`audit-cooking-hearth.ts` が製作者の登録と前提、配置の矛盾と未確認の設計ゲートを検査する。`get-cooking-top.ts` は設定の記録を描画用の寸法へ変換し、間取りの出力と室内の縮尺へ cookingTop を渡す。

室内の炉は `add-interior-hearth.ts` が形と灯りを組み立てる。`create-interior-hearth-geometry.ts` が個別設計の炉と既存の当てはめ式の炉を区別し、`create-authored-hearth-geometry.ts` が石材・鉄板と空洞のある煙道を、`create-legacy-hearth-geometry.ts` が従来の形を描く。片方だけの火室や煙道を持つ不完全な定義は、既存の形へ黙って置き換えない。


## 湯沸かしの片口・架け柄と一回分の水

`get-pouring-pot-profile.ts` は中空の断面と片口が始まる高さ、固定した架け柄と蓋を結び、同じ全外形と使用容量を返す。`get-pouring-pot-handle.ts` は鉄の橋と木の握りの同じ中心線を返す。`get-pouring-pot-point.ts` は開いた口の上部だけを片口へ広げ、容量を数える下部の断面は保つ。

`create-pouring-pot-body.ts` は同じ断面と片口を描く。`get-pot-handle-geometry.ts` は木の握りの穴が鉄棒を占めない形を作り、低い多角形の分割でも穴の内側を確保する。`create-pouring-pot-handle.ts` と `create-pouring-pot-lid.ts` を `create-pouring-pot.ts` が同じ器へ組み立てる。蓋が別置きのときは器の上へ重ねて描かない。

`get-pouring-pot-stations.ts` は炉の原点と鉄板の高さから二つの置場と器全体の囲いを計算する。`get-pouring-pot-station-error.ts` は底の支持と、器全体・煙道・別置き域の離隔を判定する。`get-pouring-pot-layout.ts` はこの順で呼び、同じ結果か拒否理由を返す。`get-pot-storage-error.ts` は冷めて乾いた空の器と蓋・架け柄を、同じ棚と箱の内寸へ照合する。`get-hot-water-service-definition.ts` が設定を解決し、`audit-hot-water-service.ts` が製作者と担当者・重さ・容量と未確認の設計ゲートへ結ぶ。

`prepare-water-batch.ts` は同じ在宅の在庫から一度取り分け、杯への予約と未割当の残りを保持する。`get-hot-water-batch.ts` は同じ杯の空洞の容量と、最大まで補給して在宅にある場合の計算を照合する。加熱や配膳を実行した意味にはせず、日課と実際のサーバーの状態へはまだ渡さない。

## 注湯用の杯と作業台

`scripts/lib/get-hot-water-cup-layout.ts` は hot_water_service の杯の配置を、同じ資料の水の割当と dish_drying の実物へ結ぶ。台の格子寸法と work_surface の支持構造、取っ手を含む杯の囲いを照合する。`audit-hot-water-service.ts` が設定検査へ接続し、空間の成功と身体・熱・清潔な面への切替を区別する。配置の原点は [[room-h1-2#杯へ湯を受ける台]] の台の上面であり、室内への描画では家具の位置へ一度だけ加える。

## 一回分の水の移し替え

`prepare-water-batch.ts` は家の在庫の更新と一回分の WaterBatch を分けて返す。`apply-water-batch-command.ts` は一回分だけを受け取り、杯への移動・割当の取消・未割当の廃棄を純粋に計算する。`get-water-batch-error.ts` が入力の収支と割当の残りを検査し、不整合を補正して通さない。家庭の在庫をこの関数へ持ち込まないことで、杯ごとの重複消費を避ける。意味と境界は [[game-system#一回の支度へ取り分ける水]] に従う。

## 傾いた湯沸かしの姿勢と下端

`get-pouring-pot-pose.ts` は測った片口の先端を指定位置へ合わせる回転と本体の位置、同じ回転を持つ握りの位置を返す。`get-posed-pot-bottom.ts` は前傾した胴の輪と、棒の端を包む球から器の下端を安全側へ求める。`get-hot-water-pouring-review.ts` が台の上の同じ杯の胴中心へ結び、全ての杯の口より上に残ることを設定検査へつなぐ。`create-posed-pouring-pot.ts` は同じ回転を既存の器へ適用し、蓋を外した形だけを描画する。静止姿勢と経路・身体・熱の境界は [[room-h1-2#片口を杯の上へ向ける姿勢]] に従う。

## 注湯姿勢へ届く骨格と操作面

`get-hot-water-reach-frame.ts` は台の座標を器と足元へ一度だけ加え、`get-pouring-pot-reach-pose.ts` が同じ固定した木の握りへ元の骨長で両手を解く。`get-hot-water-reach-space-error.ts` が台の天板・脚と杯の囲いを native body の全ての部分へ照合し、他の家具と壁を格子で避ける。`get-hot-water-reach-review-error.ts` が指定した全ての静止フレームと前腕の自己干渉を設定検査へ結ぶ。検査の範囲は [[room-h1-2#注湯姿勢の両手と立つ場所]] に従い、掌の接触や器と身体の全干渉を省略して握れる扱いにしない。

## 木の握りの掌と袖口

`get-pouring-pot-grip-pose.ts` は到達する骨格を保ち、`get-pouring-pot-wooden-bar.ts` が同じ木の全長と外径を native figure の座標へ渡す。`get-round-bar-grip-profile.ts` は丸い棒の向きに合わせた掌の開口を求め、`get-round-bar-contact-error.ts` が全体の収まりと手首より前の離隔を検査する。既存の nativeArmSurfaces へプロフィールを渡し、手首より後ろの腕や袖口の形を変えない。静止姿勢の全てのフレームへ接続し、指・力・熱と器全体の検査との境界は [[room-h1-2#木の握りと掌・袖口の接触]] に従う。

## 湯沸かし全体の native body への離隔

`get-pouring-pot-native-point.ts` が胴と全ての棒の同じ剛体変換を担い、`get-pouring-pot-native-parts.ts` が回転した胴の全体を包む囲いと各棒を渡す。`get-pouring-pot-body-error.ts` が胴を全ての native body へ照合し、`get-pouring-pot-bar-body-error.ts` が各棒と身体を調べる。木と鉄の芯に限る掌の例外には、両掌の開口と袖口の平面、上腕の独立した離隔が必要で、他の棒と腕をまとめて除外しない。形と置場の関係は [[room-h1-2#湯沸かし全体と身体の離隔]] にある。

## 保持する握りからの傾きと未成立の動作

`get-pouring-pot-held-pose.ts` が握りの中心から器全体の位置を求め、`get-pouring-pot-tilt-pose.ts` が器の下端を共通の高さへ保つ傾きの候補を返す。姿勢の値は `pouring-pot-pose-types.ts` の読み取り専用の契約を使う。`get-hot-water-posed-frame.ts` が正常な終点と候補へ同じ把持・全身・台と杯・自己干渉の検査を渡す。`get-hot-water-tilt-candidate-frame.ts` は途中の不成立をエラーで返し、終点だけの成功から動作を採用しない。

胴の大きな囲いで判別できない場合に限り、`get-pouring-pot-body-fields.ts` が中身を詰めた外側の円すい台へ分け、`can-separate-fields-from-primitive.ts` が全ての部分の離隔を証明する。円すい台は片口の張出しも全方向へ包み、空洞を離隔の抜け道にしない。候補の状態と未完了の条件は [[room-h1-2#直立から傾ける途中の未成立案]] にある。

## 骨長と接地を保つ上体の前傾

`lean-native-upper-body.ts` は骨盤から上の鎖の位置と world-space rotation を一緒に回す。骨盤・脚・足の位置と回転、休止時の体格を保持し、衣服と頭を別の補正で追わせない。既存の手の接触を持つ姿勢へ非ゼロの前傾を加える場合は拒む。`get-hot-water-tilt-candidate-frame.ts` が接触を解く前に適用して同じ全身検査へ渡し、前傾の解除は設定資料の区間へ従う。候補と完了の境界は [[room-h1-2#足を保った上体の前傾案]] にある。

## 個人の寝台と骨組み・寝具の出所

`bed-dimensions-schema.ts` と `bed-dimensions.ts` が強制変換を使わず寝台の寸法を読み、同じ `bedParts` で骨組みとマットレスを組む。`get-room-bed-definition.ts` は常用寝台 ID から実際の家具を解決し、`audit-sleeping-materials.ts` が所有者と本人の逆参照、各供給元の職と町・依存先を設定検査へ結ぶ。

`add-measured-bed.ts` は同じ部品を既存の木と寝具の素材で描き、室内の measured bed と資料の確認に共有する。既存の一般の寝台の描画は維持する。`get-authored-room-use.ts` は資料の「寝」を runtime の「寝間」へ明示して対応させる。個別の仕様と未完了の範囲は [[room-h1-3#寝台の骨組みとマットレス]] と [[room-h1-4#寝台の骨組みとマットレス]] にある。

## 枕と掛布の made-bed 配置

`bed-types.ts` が寝台と寝具を読み取り専用の値で持ち、`bed-parts.ts` が骨組みと寝具の検査を終えてから部品を返す。`get-bed-frame-parts.ts` が従来の脚・枠・床板とマットレスを維持し、`get-bed-linen-layout-error.ts` と `get-bed-linen-parts.ts` が頭側を基準とする枕・掛布の支持と離隔を求める。`scale-bed.ts` と `scale-bed-linen.ts` は全ての寸法を同じ縮尺へ一度だけ変換し、寝具の固有 ID を保つ。

資料は `bed-dimensions-schema.ts` で入れ子まで検証し、`get-bed-linen-definition.ts` は検証済みの値を変換する。`add-measured-bed.ts` は枕・掛布を既存の寝具の素材で描く。従来の室内の布の素材は `interior-cloth-materials.ts` へ共有し、色を複製して新しい配色を作らない。寝具の所有と未設計の動作は [[room-h1-3#整えた寝台の枕と掛布]] と [[room-h1-4#整えた寝台の枕と掛布]] にある。

## 個人の衣服箱の容量と支持

`personal-storage-schema.ts` が個人収納と入れ子の収納案を読み、`audit-personal-storage-packing.ts` と `get-personal-storage-packing-error.ts` が所有と固有 ID・作り手を配置検査へ結ぶ。`get-storage-box-packing-error.ts` は描画でも使う `storageBoxInterior` と同じ内寸で包みの外形・間隔・底の支持を調べる。家具の床の占有が収納の外寸であり、箱の外側の容積を中身の容量へ使わない。閉じた案の境界と未検証の使用工程は [[room-h1-3#衣服箱の内寸と持ち物]] と [[room-h1-4#衣服箱の内寸と持ち物]] にある。

## 床の衣服箱から蓋を外す経路

`get-ground-box-lid-plan.ts` は床に置く蓋の制約を保持し、`get-box-lid-plan.ts` へ渡す。共通の検査は既存の `storageLidPlan` に床置きの箱と取っ手のない板を渡し、同じ部品・連続移動を調べる。収納物を実寸の静止した障害物へ変換し、箱の側板や中身を蓋と一緒に動かさない。`get-personal-box-lid-review.ts` が資料から同じ箱を解決し、`get-room-storage-section.ts` が壁と他の家具・階の高さへ結ぶ。階の構造は `floor-levels-schema.ts` を資料全体の構造検査にも共有する。

取っ手を持つ既存の箱の開閉は保持し、取っ手のない蓋へ架空の把持部を足さない。板の幾何と、手や身体が使えることの境界は [[room-h1-3#衣服箱の蓋の経路]] と [[room-h1-4#衣服箱の蓋の経路]] にある。

## 荷の種類から独立した両手の到達

`get-native-bimanual-reach-pose.ts` は接地した靴の root と世界座標の二点を一度だけ同じ人物座標へ変換し、骨長と肩を保って両手を解く。注湯の鍋と衣服箱の板は同じ計算を使い、それぞれの接触・身体との離隔は別に検証する。`get-personal-box-reach-frame.ts` は本人の体格と設定資料の低い姿勢を用い、箱と同じ板の各静止状態の縁を目標へ渡す。床へ置いた板を拾い直せない不成立を成功へ補正しない。現在の候補と未解決の範囲は [[room-h1-3#蓋の縁へ届く本人の低い姿勢]] と [[room-h1-4#蓋の縁へ届く本人の低い姿勢]] にある。

## 衣服箱の蓋の専用の受け台

`get-box-lid-support-error.ts` は板全体と支持面の高さ・広さを照合し、`get-box-lid-plan.ts` は支持面も移動の障害物へ含める。`get-personal-box-lid-support.ts` が本人の専用の台を解決し、描画と同じ `workTableSections` の天板と全ての脚を部屋の障害物へ結ぶ。高さが未確定の他の家具は従来どおり床から天井まで塞ぎ、台の高さだけを任意に通れる空間へ置き換えない。個別の用途と未解決の身体条件は [[room-h1-3#衣服箱の蓋を受ける低い台]] と [[room-h1-4#衣服箱の蓋を受ける低い台]] にある。

## 蓋へ届く身体と固定家具の離隔

`get-personal-box-fixed-clearance-error.ts` は同じ箱の底・側板と収納物、蓋受けの天板・脚、壁と他の家具を静止した障害物へまとめる。収納物の内側の原点から外側への変換は `get-storage-box-content-bounds.ts` を蓋の移動検査とも共有し、底板と側板の厚みを一度だけ加える。

`get-native-fixed-cuboid-clearance-error.ts` は全ての描画部位を同じ人物座標で照合し、腕や袖口へ例外を設けない。水平な天井を本人の上端へ照合する。動く蓋の掌との接触はこの固定家具の検査に含めず、別の未解決の条件として保持する。現在の不成立は [[room-h1-3#蓋の縁へ届く本人の低い姿勢]] と [[room-h1-4#蓋の縁へ届く本人の低い姿勢]] にある。

## 板と内部の容量を保つ蓋の取っ手

`get-storage-lid-handle-parts.ts` は取っ手の横棒と支柱を板の中心からの位置へ置き、全てを板で支える。`get-personal-box-lid-handle.ts` が資料の寸法を渡し、`get-personal-storage-box-error.ts` は同じ部品を検証してから取っ手を除いた内部へ包みを照合する。総高へ取っ手を含めても、収納量へ二重に足さない。

`get-box-lid-plan.ts` は取っ手も蓋の移動部品へ含める。`get-personal-box-hand-targets.ts` は同じ状態の実際の横棒へ手の目標を置き、独立した浮いた目標を作らない。固定家具への全身の離隔は維持し、掌と動く取っ手の接触は未解決として分ける。現在の案と旧案の境界は [[room-h1-3#蓋の西側の木の取っ手]] と [[room-h1-4#蓋の西側の木の取っ手]] にある。

## 横棒に垂直な前腕と全体の接触証明

`solve-two-bone-on-plane.ts` は任意の平面を既存の高さ固定の二骨解法へ回し、固定した二本の長さを保つ。`solve-arm-grip-on-plane.ts` が本人の骨長と掌の位置へ戻し、`get-bimanual-bar-grip-pose.ts` は横棒に垂直な前腕と掌の開口を解く。

`get-storage-lid-bridge.ts` は実際の支柱と唯一の横棒を解決し、`get-personal-box-native-bridge.ts` が長方形の断面全体を含む囲いへ直す。`get-certified-bar-body-error.ts` は棒全体の掌と手首の証明に加え、上腕と他の全ての部位を照合する。注湯の棒の検査にもこの同じ条件を使う。

`get-personal-box-grip-frame.ts` と `get-personal-box-grip-clearance-error.ts` は同じ静止姿勢で固定家具と動く板・支柱・横棒を照合する。`get-personal-box-handling-error.ts` は宣言された接触案の全ての端を通常の設定検査へ結び、連続動作や荷重の未検証は補完しない。個別の境界は [[room-h1-3#横棒全体を囲む掌の静止した接触]] と [[room-h1-4#横棒全体を囲む掌の静止した接触]] にある。

## 蓋の途中の姿勢と接地点の固定

`storage-lid-parts-at-offset.ts` は同じ固定した箱と蓋・取っ手から任意の位置の部品を返し、`get-storage-lid-motion-state.ts` は宣言した一区間の重みでその位置を求める。端の描画も同じ処理を使う。`get-personal-box-reach-pose.ts` と `get-personal-box-grip-pose.ts` は部品の位置だけから本人の到達と掌を解き、端と途中に別の姿勢の計算を持たせない。

`get-native-ground-contacts.ts` は描画する靴と衣服を含む膝の接地点を世界座標へ直し、`get-native-planted-contact-error.ts` は接地したまま滑る案も拒む。`get-native-planted-footwear-error.ts` は同じ靴の丸い形の両端と半径を室内座標で比較し、最下点だけが残る回転も拒む。`get-personal-box-motion-frame.ts` はその条件と同じ掌・固定家具・可動部の離隔を照合する。`get-personal-box-vertical-review-error.ts` が宣言した縦の標本を通常の設定検査へ結ぶ。有限の標本と区間全体の証明の境界、未解決の横移動は [[room-h1-3#蓋の上下の標本と床を滑らせない支持]] と [[room-h1-4#蓋の上下の標本と床を滑らせない支持]] にある。

## 平面を保つ肘と腕の区間全体の移動上限

`get-two-bone-plane-speed-bound.ts` は固定した肘の平面へ上腕を投影し、既存の二骨の区間到達と速度の上限を求める処理へ渡す。平面が動く経路、途中の到達不能や特異な曲がり方は拒む。`get-planar-arm-grip-motion-bound.ts` は本人の骨長と掌までの長さを用い、`get-native-arm-motion-bound.ts` が手首と元の袖・掌の曲面の制御点へ同じ上限を広げる。この変換は既存の壺の腕の区間検査にも共有する。

`get-personal-box-arm-interval-bounds.ts` は本人の上下の区間の座標と横棒・肩を固定した条件を照合し、通常の縦の標本検査にも区間全体の到達と上限の存在を要求する。上限と実際の曲面の制御点、未証明の離隔の境界は [[room-h1-3#蓋の上下の標本と床を滑らせない支持]] と [[room-h1-4#蓋の上下の標本と床を滑らせない支持]] にある。

## 上下の全区間を覆う外部との離隔の証明

`get-personal-box-fixed-obstacles.ts` は静止と区間の検査へ同じ箱・中身・受け台・壁と家具を渡す。`get-personal-box-interval-context.ts` が固定した人物座標と速度の上限を解決し、`get-personal-box-interval-geometry.ts` は中点からの移動範囲と実際の部品を求める。

`can-separate-limb-from-cuboid.ts` は孔を開ける前の腕と袖口を移動範囲ごと囲み、`get-arm-interval-cuboid-error.ts` が床・天井と物へ照合する。移動範囲を足す箱の計算は `get-expanded-cuboid.ts` を共有する。`get-moving-boxes-non-arm-error.ts` は固定した頭・衣服・脚へ動く板と支柱を照合し、`get-planar-bar-interval-error.ts` は横棒全体の掌と手首の条件・上腕と他の部位への離隔を保つ。

`get-personal-box-interval-slice-error.ts` がこれらを一つの小区間へ求め、`get-personal-box-continuous-review.ts` は `certifyLinearInterval` で全区間を隙間なく覆う。精度の上限や残る穴を合格へ置き換えない。通常の縦の設定検査はこの証明も要求する。外部の物への離隔と自己離隔・荷重の境界は [[room-h1-3#上下の区間全体の家具と可動部への離隔]] と [[room-h1-4#上下の区間全体の家具と可動部への離隔]] にある。

## 描画と同じ衣服の曲面と前腕の自己離隔

`get-loft-segment-separation-field.ts` は、描画する楕円の区間の軸・幅と奥行の変化から、その区間の範囲で実際の場の微分の上限を求める。`get-loft-separation-fields.ts` は全区間の証明がそろう場合だけ渡す。`loftSd` は入力を写し、同じ曲面と証明が入力の後の変更で食い違わないようにする。

`separationFields` は描画する形の補助情報であり、実際の曲面や材料を変えない。胴・襟・首巻きなどがこの区間を渡し、曲面と箱・別の曲面の離隔が粗い囲いを精査する。証明のない形へ一律の微分の上限を付けない。

`get-forearm-pair-surfaces.ts` と `get-forearm-pair-self-clearance-error.ts` は両側の腕と袖口を孔と切断のない曲面で囲み、反対の腕との相対的な移動を加える。形だけで照合できるよう、関連する計算は描画の ID や素材を必要としない。現在の姿勢と全区間の境界は [[room-h1-3#衣服と反対の腕を避ける上下の姿勢]] と [[room-h1-4#衣服と反対の腕を避ける上下の姿勢]] にある。

## 低い姿勢の横移動候補

`get-eased-side-step-offsets.ts` が既存の靴の振出しに身体の緩やかな移動を合わせ、`get-native-low-side-step-pose.ts` が骨盤の上昇と元の骨長を保つ脚の解を返す。`get-native-low-step-ground-error.ts` は実際の靴の持上げと衣服を含む膝の床への離隔を照合する。端では元の姿勢をそのまま返し、区間と繰返しの境目を一致させる。

`get-personal-box-lateral-context.ts` は資料の南向きの蓋の経路と本人を解決し、`get-personal-box-lateral-frame.ts` は同じ蓋と脚から掌を解く。`get-personal-box-grip-from-reach.ts` は静止と足運びで同じ横棒全体の接触を用いる。`get-personal-box-lateral-support-error.ts` は資料の位置から求めた支持の靴を室内へ固定し、検査対象のずれに合わせて基準を動かさない。`get-personal-box-lateral-review-error.ts` が有限の標本の支持・接触と全身の離隔を通常の設定検査へ結ぶ。全区間と釣合い・荷重は [[room-h1-3#膝を床から離して足を順に移す候補]] と [[room-h1-4#膝を床から離して足を順に移す候補]] の未解決の条件に残す。

## 取り外す蓋を使わない前面収納の別案

`front-access-storage-schema.ts` は個人収納の前面引き戸の別案と置換後の格子を読む。`get-front-access-storage-layout-error.ts` は元の箱と蓋受け以外の壁・入口・寝台を保ち、前の使用面が床であることを求める。`get-front-access-storage-error.ts` は元の包みの固有 ID と実寸を保つ。`get-front-access-storage-room-error.ts` は実際の建物の水平な天井と元の壁・他の家具へ照合し、未設計の屋根や梁へ検査を広げた扱いにしない。

`sliding-cabinet-types.ts` と `get-sliding-cabinet-spec-error.ts` は板・脚・二つの溝と指掛けの寸法を持ち、`get-sliding-cabinet-frame-parts.ts` と `get-sliding-cabinet-panel-parts.ts` は実際の立体を返す。`get-sliding-cabinet-plan.ts` は両方の戸を別々の溝で閉位置から指定の開位置まで動かし、固定板・もう一方の戸と包みを避ける全経路を照合する。`get-front-access-storage-review.ts` は内側の容量と底板の支持を照合し、`get-front-access-storage-retrieval-error.ts` は各包みを持ち上げて下の案内を越し、開いた側から西へ出す全経路を照合する。`draw-sliding-cabinet-parts.ts` は同じ板と孔を既存の木の素材で描く。本人の片手・杖と力の成立は [[room-h1-3#前から開ける収納への変更案]] と [[room-h1-4#前から開ける収納への変更案]] の残る条件に従う。

## 前面収納へ片手を近づける静止した候補

`get-native-single-hand-reach-pose.ts` は本人の接地した元の姿勢を基準に、選んだ肘と手首だけを元の骨長で解く。肩と反対の腕・脚、元の回転と骨長を保ち、既存の掌の接触条件を持つ姿勢へ重ねて適用しない。到達の成功は掌の接触と力の証明ではない。

`get-sliding-cabinet-leaf-definition.ts` は板と指掛けの孔の立体を共有し、描画する孔と手前の到達点がずれないようにする。`get-front-access-approach-frame.ts` は本人と資料の距離・立つ位置から各静止した候補を作る。`get-front-access-approach-error.ts` は同じ戸・案内・包みと部屋の全身の離隔、動かす前腕・袖口と本人の衣服・反対の腕の自己離隔を各標本へ求める。反対の腕の用途、指掛けの接触と力、立つ位置の間の足運びは [[room-h1-3#立った本人が片手を近づける静止した候補]] と [[room-h1-4#立った本人が片手を近づける静止した候補]] に残す。

## 片手で握る木の取っ手の別案

`raised-cabinet-handle-types.ts` と `get-raised-cabinet-leaf-parts.ts` は無孔の戸と実在する二本の支柱・縦の棒を返す。`get-raised-cabinet-plan.ts` と `get-raised-cabinet-leaf-sweep-error.ts` はその全てを一体で動かし、もう一方の戸と取っ手、案内・包みと部屋の障害物へ全経路を照合する。北の戸を後ろの支柱へ通す旧案は否定例として残す。

`get-vertical-cuboid-grip-bar.ts` は実際の木の全ての角を含む棒を本人の座標へ移す。`get-single-bar-grip-pose.ts` は選んだ一方の掌だけに同じ棒全体の接触を求める。`get-certified-single-bar-body-error.ts` はその前腕と袖口の接触条件に加え、上腕と反対の腕・他の部位の離隔を求める。両手の接触を一方の手の省略で代用しない。

`get-front-access-handle-plan.ts` は本人の二つの取っ手の ID と部屋・包みへ結び、無孔の戸と実際の支柱を用いた取り出しの経路も再照合する。`get-front-access-handle-frame.ts` は各静止した本人と棒を同じ位置へ置く。`get-front-access-handle-frame-error.ts` と `get-front-access-handle-error.ts` がその掌の接触と全身・選んだ腕の自己離隔を設定検査へ結ぶ。残る力・足運びと杖の条件は [[room-h1-3#孔の代わりに木の取っ手を握る別案]] と [[room-h1-4#孔の代わりに木の取っ手を握る別案]] にある。

## 取っ手の準備姿勢と立ったままの足運び

`get-native-grounded-foot-pose.ts` は、元の靴の浮きを除いてから指定する持上げ量を足し、骨盤を下げて両脚を解く。靴の踵から爪先の向きと元の骨長を保つ。`get-native-side-step-pose.ts` の既存の横歩きも同じ脚の処理へ渡し、既存の支持と到達の条件を保持する。`get-eased-side-step-offsets.ts` は低い姿勢と立位で同じ緩やかな身体移動を用いる。`get-native-foot-clearance-error.ts` は実際の両靴の高さ、`get-native-body-floor-error.ts` は全身の保守的な囲いが床を避けることを求める。

`get-front-access-handle-standing-pose.ts` は片方の靴が浮いた元の立位を両足の支持へ数えず、資料の準備姿勢を掌より先に解く。`get-front-access-handle-step-context.ts` と `get-front-access-handle-step-frame.ts` は戸ごとの距離と向きへ小移動を割り当て、同じ掌の接触を解く。`get-front-access-handle-step-support-error.ts` は検査対象の身体位置に合わせて基準をずらさず、資料の位相の靴全体を固定する。`get-front-access-handle-step-error.ts` が両方向の有限の標本へ足の支持と持上げ・全身の離隔と掌の条件を求める。標本の検査は `get-front-access-handle-step-cycle-error.ts` に一歩ずつ渡し、資料から独立して作る開始と中間の支持姿勢をその一歩の中だけで共有する。別の一歩・人物・検査へ保持せず、`get-front-access-handle-step-contact-error.ts` で同じ靴の全体を照合する。未検証の全区間・力と杖の条件は [[room-h1-3#両足を床へ置いた準備と戸に沿う足運び]] と [[room-h1-4#両足を床へ置いた準備と戸に沿う足運び]] に残す。

## 立位の脚先の全区間と膝の速度の上限

`get-eased-side-step-speed-bound.ts` は実際の身体の横移動と靴の振出し・持上げの曲線の微分から速度の上限を求める。`get-native-grounded-foot-target.ts` を実際の脚の解と検査の両方で用い、元の靴の浮きを引く処理まで一致させる。`get-native-step-leg-chain.ts` は実際に解く前の股関節と元の膝の点・骨長を用いる。

`get-two-bone-ball-range.ts` は目標点が動ける球全体を二つの骨の到達範囲の内側へ置き、曲げる側の投影が零になる場合を拒む。`get-two-bone-ball-speed-bound.ts` は同じ二つの球の交わりの式から膝の速度を囲む。`get-native-side-step-leg-slice.ts` は中点と速度の上限で靴の曲線の小区間全体を囲み、`get-native-side-step-leg-intervals.ts` は両脚の成立した区間を端から端まで隙間なく求める。途中の到達や曲げる側を未証明のまま省略しない。

`get-front-access-handle-step-reach-review.ts` は本人の両方向の実際の距離と足の高さを用い、繰返す各巡に共通する脚の局所座標を照合する。返す膝・脚先の速度は人物の局所座標、身体の速度はその横移動の上限であり、混同して世界座標の囲いへ渡さない。これは進捗に対する上限であり、実時間と本人の能力を表すものではない。床と家具・衣服などの全区間の離隔は [[room-h1-3#立位の足運びの脚先と曲げる側の全区間]] と [[room-h1-4#立位の足運びの脚先と曲げる側の全区間]] に残す。

## 立位の靴と脚の全区間の外部離隔

脚の立位の分岐を検査するときは、丸める前の fold の値も有限であることを求める。膝の不正な高さで比較が成立しない場合を、分岐を保てる証拠に数えない。

`buildLegs` と `buildBody` は描画する同じ脚と靴の部位の参照を返す。形・半径・色や描画順を変えず、別の簡易な人物を検査の正解へ使わない。`standing-leg-fold-limit.ts` は立位の脚の分岐を共有し、`get-native-standing-leg-topology-error.ts` は描画の fold の感度と両膝の移動上限から、区間全体で同じ分岐が残ることを求める。

`get-native-eased-shoe-envelopes.ts` は同じ踵と爪先・足首が一緒に移る規則と靴の曲線の全範囲から、元の浮きを除いた両靴を囲む。`get-native-shoe-envelope-error.ts` は床・水平な天井と固い物へその囲い全体を求める。`get-native-leg-interval-external-error.ts` と `get-native-leg-capsule-external-error.ts` は、靴以外の脚の実際の部位の囲いを、骨の移動上限だけ広げて照合する。靴を単に検査から除外せず、靴の別の全区間の条件を先に成立させる。

`get-heading-local-translation-bounds.ts` は身体の全移動に対して固定物が通る相対的な範囲を囲む。`get-front-access-handle-leg-obstacle-context.ts` は固定した部屋・他の戸と包みをその範囲へ結び、選んだ戸と全ての支柱・棒は本人と同じ量だけ移る局所座標へ置く。`get-native-side-step-leg-external-context.ts` と `get-native-side-step-leg-external-slice.ts` は同じ脚先と膝の上限を用い、`get-native-side-step-leg-external-intervals.ts` は一巡全体を隙間なく覆う。`get-front-access-handle-leg-clearance-review.ts` が両方向を設定検査へ結ぶ。繰返す脚の曲線を固定物の全移動の範囲へ求めるため、巡の間の相関を省いて通しやすくしない。裾とスカート・上半身と自己離隔、杖と荷重の範囲は [[room-h1-3#立位の靴と脚の床・家具への全区間の離隔]] と [[room-h1-4#立位の靴と脚の床・家具への全区間の離隔]] に従う。

## 立位の衣服の裾と上半身の全区間

`get-front-access-handle-local-bar.ts` は取っ手の実寸と本人の位置から一定の局所座標を求める。`with-native-leg-pose.ts` は同じ骨盤の枠と元の骨格を要求し、独立に解いた脚だけを準備姿勢へ渡す。脚以外の骨と掌は動作の位相によって解き直さない。

`get-native-rigid-upper-reference-error.ts` は同じ準備と握りを再構成し、無関係な基準姿勢を拒む。`get-native-side-step-kinematic-slice.ts` は脚と衣服の検査へ共通の膝の移動上限を渡す。`get-native-rigid-upper-topology-error.ts` は描画の丸める前の fold と膝の高さから衣服の立位の形が小区間全体で残ることを求める。全区間を証明できた場合だけ、`get-native-rigid-upper-external-error.ts` が同じ上半身の実部位を部屋の全相対移動と戸の支柱へ照合する。

`get-front-access-handle-external-obstacle-context.ts` は固定物の全相対移動、一緒に動く板と支柱、掌の接触棒を分ける。脚には棒も障害物として保持し、上半身は元の棒全体の接触の検査を保持する。`get-front-access-handle-upper-clearance-review.ts` は脚の全区間の検査の宣言も要求する。自己離隔、杖、力と日課の残件は本人の資料に従う。

## 戸を握る前腕の全区間の自己離隔

`get-native-rigid-forearm-self-slice.ts` は同じ脚の小区間と移動上限を用い、固定した上半身へ実際の中点の脚だけを組み立てる。衣服の立位の形が変わり得る区間を拒み、膝と脚先の移動上限の大きい方を前腕と身体の離隔へ加える。反対の腕と衣服も残し、掌の孔を開ける前の前腕・袖口の外形を使う。

`get-native-rigid-forearm-self-intervals.ts` は基準の握りの一致を求め、成立した区間を端から端まで隙間なく覆う。`get-front-access-handle-forearm-self-review.ts` は本人と両方向へ適用し、脚と上半身の全区間の検査の宣言も要求する。同じ腕自身の接続は検査対象外であり、上腕の付け根や脚同士を含む全身の自己離隔の代わりにしない。

`get-cabinet-room-bounds-error.ts` は開閉両端の板・支柱と取っ手を部屋の断面へ照合する。直線移動と凸な部屋の囲いでは両端の成立を使えるが、空の部材や非有限の囲いを検査成功とはしない。収納組立ては同じ固定障害物を戸の移動と包みの取出しへ渡す。

## 前面収納上の替えの掛布

`get-folded-textile-size.ts` は元の厚みへ全層数を掛け、折返しと覆いに設定した外包の余裕を加える。圧縮と不正な分割数、数値の発散を拒む。布の変形を解く処理ではなく、名目上の外包を扱う。

`get-storage-spare-blanket-definition.ts` は本人の寝床と使用中の掛布へ結び、替えを別の固有 ID として返す。`get-front-access-spare-blanket-placement.ts` は組立てより先に [[architecture#収納上面の寝具の外包]] の共通の配置検査へ渡す。棚内の三つの持ち物は保持する。`get-front-access-spare-blanket-review.ts` は組立て済みの同じ結果を返し、循環して組立て直さない。掛布そのものを置く・取り出す身体、実物の畳み方・荷重・交換の日課は本人の資料に残す。

## 初回作成画面のキーボード操作

`character-screen.tsx` の初回作成はブラウザのモーダルダイアログで背後を操作対象から外す。`keep-dialog-tab-focus.ts` はその時点で見えていて有効な入力だけを拾い、両端で Tab の向きを折り返す。保存待ちはダイアログ自身へフォーカスを保つ。`neck-color-labels.ts` は描画用の色 ID を画面読み上げの名前へ対応させ、表示する説明文は追加しない。既存キャラクターの編集は従来の小さなモーダルを保持する。

## 使用中と替えの掛布の裁断面

`get-hemmed-textile-cut-size.ts` は仕上がりの幅と長さの両端に、設定した各辺の総余裕を加える。幅と長さだけを扱い、数値の発散や余裕が丸めで消える場合を拒む。`get-blanket-cutting-review.ts` は本人の寝台と替えの識別を解き、同じ向きに広げた実寸の裁ち片を原布へ配置する。裁断面を共通の補助軸へ写して既存の配置検査で平面の重なりを照合し、外縁の余白も求める。補助軸を原布や縁の物理的な厚みには使わない。`audit-sleeping-materials.ts` が宣言された裁断案を部屋の検査へ結ぶ。原料重量と製作・納品の成立は本人と供給者の資料に残す。

## 掛布の供給者側の受渡し

`textile-orders-schema.ts` は供給者の工程と原布の割当先、最終使用者と次の受取人、未成立の案を表す。`get-sleeping-textile-cuttings.ts` は宣言された掛布と枕の側布の裁断を検査し、`get-sleeping-textile-orders-error.ts` と `get-textile-cutting-orders-error.ts` は各裁断面と同じ原布を使い、羊毛・紡ぎ・織布・仕立ての各工程と次の相手を照合する。`audit-sleeping-materials.ts` で必要な工程の欠落・重複と向き違いを拒み、一般の構造検査も宣言された配列を検査する。`get-textile-stages.ts` は両方向の検査へ同じ受渡しの定義を返す。`get-textile-order-error.ts` は一つの宣言を受取人の裁断案へ戻し、`audit-textile-orders.ts` が全宣言と ID の重複を設定検査へ結ぶ。必要な工程以外に紛れた宣言も検査対象にする。`get-textile-order-workplace-error.ts` は紡ぎの部屋・糸車の使用面・利用者を両方向の工程検査へ結び、共同の部屋の users は参照の型と設計の前提にも含める。共同の設備の利用者を雇用の割当へ変換しない。重量・在庫と製作・納品の完了はこの経路の成立から導かない。


## 枕の側布の裁断面

`world/town/get-seamed-box-textile-panels.ts` は詰物を含む直方体の外包から六面と各辺の縫い代を求める純粋な計算であり、実際の布の変形や縫製を証明しない。`scripts/lib/get-pillow-cover-cutting-review.ts` は本人の寝台と枕から寸法を取り、`get-pillow-cover-layout-boxes.ts` で使用中と替えの面の固有 ID を照合してから、原布内の配置と隙間・外縁を検査する。通常の寝具の検査からも呼び、側布の面を失った案を参照検査の成功へ隠さない。


## 収納上面の寝具の外包

`world/town/get-cabinet-top-package-placement.ts` は収納上面への直接支持と外縁・天井・室内の障害物への離隔を扱い、掛布と枕の側布で共用する。`scripts/lib/get-front-access-top-storage.ts` は両方の外包を同じ面で照合し、`get-front-access-handle-plan.ts` の topObjects へ渡す。この同じ配列を戸と付属品の全移動、棚内の取出し、姿勢と全移動の障害物へ使う。

`get-storage-spare-pillow-cover-definition.ts` は本人の裁断案の替えの六片と原布を解決し、仮の布厚による体積を名目外包が失わないことを確認する。`get-covered-textile-box.ts` は保護する木箱の板と蓋を引いた内寸と側布の候補の外包を照合し、閉じた箱の実物の部材を返す。`get-north-hinged-lid-envelope.ts` は蓋の厚みを含む閉状態から垂直までの全回転の囲いを求め、配置の検査が室内と掛布へ照合する。蓋の途中の高さの極大も含み、端点の検査では代用しない。体積と名目外包の検査は、縫った側布が実際に折って収まる証明や蝶番・接合と開閉する身体の成立とは区別する。これらの外包を通常の私室へ自動描画せず、設計の未成立を保持する。


## 寝具の原料の有限の予算

`world/town/get-required-textile-input-mass.ts` は一グラム単位の必要量を歩留りから切り上げ、途中の整数の積を失わないよう計算する。`get-textile-material-budget.ts` は原毛・準備した羊毛・糸・原布・裁断片と各差分を同じ収支へ結ぶ。`scripts/lib/get-sleeping-textile-material-budget.ts` は既に照合した裁断片の面積を使い、補助軸を物理的な厚みや材料量へ混ぜない。

`textile-material-budget-schema.ts` と `textile-wool-lots-schema.ts` は未計測の条件と有限の予算案を表す。`get-textile-wool-allocation-error.ts` は受取人の原布と羊毛の工程から同じ予算の割当へ進み、`get-textile-wool-lot-review.ts` と `get-wool-lot-allocation-budget.ts` は供給者側の全ての割当から原布へ戻って必要量を合算する。`audit-textile-wool-lots.ts` を通常の工程の検査へ結び、各原布の単独の成功で全体の超過を隠さない。供給者の受取人と部屋は `get-textile-design-prerequisites.ts` から設計の前提にも含める。実在庫への採用と実物の工程の成立はこの収支から導かない。


## 原毛の手入れ場の局所の平面と給排水の予約

`wool-preparation-schema.ts` と `wool-preparation-stations.ts` は、原毛と処理用水・洗い・すすぎ・手洗い・屋根内の乾燥・清潔な保管・汚水の一時保管を別の家具と使用面へ結ぶ。`get-wool-preparation-operator-error.ts` と `get-wool-preparation-facility-review.ts` は持ち主と担当・水の受取りの利用者を照合し、家庭菜園・飲用水の受取り・動物の世話へ兼用した区画を拒む。原料予算から処理場へ進む参照と、`audit-wool-preparation.ts` から原料予算へ戻る参照を通常の設定検査へ結ぶ。処理場の担当・受水する設備・持ち主も設計の前提へ含め、局所の配置だけで供給のつながりを省略しない。

`world/town/get-wool-preparation-water-budget.ts` は、一回の洗い・すすぎの各入替えと手洗いの予約を合計し、給水と汚水の一時保管の両方の余裕を同時に確認する。蒸発や浸透を処理能力に数えず、手入れの間隔を増やす場合も全量を予約する。これは量の案の検査であり、槽の実際の内寸と給排水の道具、敷地・構造・換気と身体、汚水の最終処理と連続した製作を証明しない。


## 羊毛の処理用の槽の容量と外形

`get-rectangular-liquid-capacity.ts` は名目内寸から上の空間と内容物の占有を除き、整数の立方ミリメートルで計算して水量へ切り捨てる。側面と底の厚みを含む外形も同じ定義から返す。`get-wool-preparation-vessels-error.ts` は各槽の水量と対応する家具の占有を照合し、給水・汚水の槽だけで洗いとすすぎの容量を代用しない。寸法案と実物・身体の残件は [[facility-h7-wool-preparation#槽の内寸と使える水量]] にある。


## 羊毛の作業区画内の床のつながり

`get-wool-preparation-zones-error.ts` は原毛・汚水の側と準備後の側の重なりを拒み、`get-wool-preparation-zone-error.ts` が各側の家具と使用面の包含、区画内の床のつながりを照合する。`lib/engine/get-connected-grid-cells.ts` は指定された格子内の四方向の連結を求め、塞がれた開始点を別の床へずらさない。全体の入口からの到達性は既存の配置検査に残す。区画内の連結と荷物を持つ身体・衛生の工程の区別は [[facility-h7-wool-preparation#原毛の側と準備後の側の通路]] にある。


## 生き物の経路の入力境界

`get-monster-route-input-error.ts` は座標・領域と半径の構造上の成立を調べ、`get-monster-route.ts` が地形の照会より先に呼ぶ。非有限の座標を格子の走査へ渡して例外にしたり、領域外の端点を通れる地形だけで受け入れたりしない。休憩する中心の範囲と身体の離隔の区別は [[game-system#野外の生き物の移動の足場]] に従う。


## 経路の被覆と探索の計算上限

`get-grid-segment-coverage.ts` が全区間を覆うセルか上限による拒否を返す。元の `get-grid-segment-cells.ts` は同じ被覆からセルを返し、不正入力では従来どおり例外を投げる。生き物の半径のない区間は返る Error を受け取り、空のセル列を通過の証明にはしない。地形の関数が投げる予期しない例外はこの処理で捕捉しない。

`get-monster-grid-layout.ts` は有限な領域と倍率、開始と終端の格子座標の表現範囲、探索するセル数を照合する。`get-monster-grid-route.ts` の正方形の配列と `get-monster-fallback-home.ts` の長方形の走査で共有し、実際の格子の形に対して確保と地形の照会より先に検査する。休憩地点は全セルの配列を作らず、元の行順で調べる。探索上限は `world/core/monster-motion-rules.ts` にあり、現行の経路と元の格子の被覆・身体の判定は変えない。


## 未配置の都市の区画案

`town-district-plan-schema.ts` が町の局所の案を読み、`get-town-district-grid-errors.ts` が矩形の占有と図の一致、道へ面する位置と入口からの連結を照合する。`audit-town-district-plan.ts` が生活の役割と門前の参照、未配置の設計ゲートを照合し、設定検査へ組み込む。部屋の grid の一致検査は保持し、都市の district-grid は対応する区画案と別に一致を求める。設計の範囲と未完了の扱いは [[town-hue#未配置の区画案]] と [[town-quynhon#未配置の区画案]] に従う。


## 実装前の住民と既存の実行時の参照

`resident-proposal-schema.ts` は外見と一日の意図を持つ案を読み、`get-resident-proposal-error.ts` は都市の未配置の区画、マップの逆向きの登録、世帯と寝間の一致を照合する。`audit-resident-appearance-sources.ts` と `resident-routine-source.ts` は同じ案を検査し、実行時の住民・日課と同名なら拒否する。案がない既存の参照の検査と、本人の寝台・収納の検査は維持する。最初の世帯と未設計の範囲は [[resident-ルードヴィヒ]] と [[building-hue-ludwig]] にある。


## 都市の区画内の建物と土地の予約

`get-building-district-reservation.ts` は全平面と周囲の余地を同じ寸法から求め、局所の区画の内側へ照合する。`get-town-district-reservation-errors.ts` は宣言された全ての建物を都市と区画ごとに照合し、`audit-town-district-plan.ts` から呼ぶ。未配置の町の向きと原点がないまま実際の敷地としない。最初の予約と残件は [[building-hue-ludwig#区画内の土地の予約案]] にある。


## 一棟の共有する戸口と板の所有

`audit-building-layout.ts` が建物の資料を検証し、扉の所有、各階の配置、外への接続を順に照合する。`building-dimensions-schema.ts` は計画矩形の寸法を検証し、`audit-building-envelope.ts` と `building-layout-schema.ts` が共有する。後者は階と所属室の一覧も読み取り、検査で使う `Layout` の型もそのスキーマから導く。不正な計画矩形と一覧を型の強制変換で通さず、扉の所有の検査結果を保持して入力の不備を返す。比較する接続先の選別は `get-room-connection-scope-error.ts` が行い、所属の規則は `.docs/settings/README.md` の「一棟の共通座標」に従う。戸口の走査は `get-grid-boundary-opening.ts` が確認した、実際のグリッド内の開口に限る。

`audit-building-floors.ts` は階をまたぐ登録と建物の部屋一覧を照合し、`audit-building-floor.ts` は一階分の占有と各室の接続の検査をまとめる。`get-floor-room-placement.ts` が所属階と種別を確かめ、部屋の原点と矩形グリッドは `room-layout-schema.ts` で検証する。`floor-occupancy.ts` の `FloorOccupancy` は一階分の平面の占有を保持し、境界外と共有を許さない重なりを報告する。部屋の接続や扉の操作はこの集計とは分けて照合し、平面の占有が通ったことを立体の整合とは扱わない。

`audit-room-layout-connections.ts` は一室の接続と戸口セルを照合する。接続の読み取りと `Connection` の型は `room-connection-schema.ts` に置く。`audit-room-connection.ts` は接続先の所属、検証した原点、逆向きの宣言を解決する。`get-reciprocal-room-connection.ts` は両端を照合し、階段では家具記号と使用位置の両方が逆向きに対応するものを選ぶ。戸口は `audit-connected-room-door.ts`、階段の平面位置と使用面は `audit-connected-room-stair.ts` が調べる。戸口の両側の開口・縮尺・向きは `are-room-doorways-facing.ts` で照合し、接続自体の不備として報告する。外へ出られるかの探索も同じ接続スキーマを使い、不正な一覧を未検証の型変換で通さない。

`audit-building-access.ts` は `is-room-passage-connected.ts` で両方向の幾何が成立する室間の接続だけを探索する。`get-room-connection-opening.ts` は実際の境界の開口と幅・縮尺を照合し、`get-exterior-room-connection-error.ts` は外へ出る探索の起点を判定する。通行の規則と検査の限界は `.docs/settings/README.md` の「一棟の共通座標」に従う。

`stair-sections-schema.ts` は資料の読み取りと `audit-stair-sections.ts` の断面の検査で共有する。床高の入力も既存の `floor-levels-schema.ts` を使い、構造の不備を幾何の計算の前に報告する。`get-stair-section-connection.ts` は同じ建物の上下階の部屋と接続・家具を検証して読み、`get-stair-section-frame.ts` が高さと平面の実寸を組み合わせる。

`audit-stair-section.ts` は踏面・蹴上げと手すりの余白、頭上高、上下の踊り場の検査を順にまとめる。`stair-headroom.ts` は踊り場の高さと、下側の天井に覆われる最も高い踏面から最小の頭上高を求める。`get-first-covered-stair-tread.ts` は元の積と厳密な比較を使う二分探索で、その踏面を特定する。段数分の配列や関数の引数を作らない。`audit-missing-stair-sections.ts` は設計を通過する建物で断面が欠けている接続を調べる。部屋一覧と接続は既存のスキーマを使い、階や接続の型を強制変換して計算へ渡さない。

戸口と部屋の敷地の投影は `project-site-door-pose.ts` と `project-room-site-rectangle.ts` に分ける。資料を読む入口が縮尺と所属を検証し、共通変換の数値の不備を各入口の返し方へ対応させる。共通空間の要件と残件は [[spatial-model]] にある。

`get-room-doorway-review.ts` が境界と幅、連続した戸口セルを照合する。経路に使う開口の読み取りと `room-doorway-inventory.ts` の `RoomDoorwayInventory` がこの判定を共有する。戸口の集計は検証した開口のセルだけを列挙し、重複と未接続を報告する。

`get-room-door-portals.ts` が室の出入口を一棟の座標と階へ移し、`get-building-door-portals.ts` が所属する全室を解決する。`audit-building-door-inventory.ts` は同じ戸口の両側を一つにまとめ、板の定義と所有室が過不足なく一致することを検査する。`audit-building-layout.ts` から呼び、既存の各室の板の回転検査と併用する。ルードヴィヒの戸口の所有と、身体と立体・日課の残りは [[building-hue-ludwig#戸口と扉を持つ室]] にある。


## 開位置の板と戸枠を残した平面の通行

`door-leaf-geometry-schema.ts` は資料の読み込みと通行検査で板・金具の同じ形を共有する。`get-room-door-threshold.ts` は戸を持つ室を解決し、有効幅と両側の枠を求める。`get-door-frame-boxes.ts` は奥まった開口も含む両脇の枠を持ち、隣室が所有する場合も検査する室の座標へ移す。

`get-room-open-door-obstacles.ts` が開位置の板と枠を残し、`get-open-door-polyline-error.ts` が円の全折れ線を、格子の家具・壁と実際の板・枠の矩形へ照合する。`audit-open-door-passages.ts` は各戸口から共通の通過点への対応と全戸口の網羅を設定検査へ結ぶ。身体と操作の残件は [[building-hue-ludwig#開いた扉を避ける通行の案]] にある。


## 未実装の住民の時間予約と場所

`world/town/resident-day-plan-schema.ts` は勤務日の予約を定義し、`get-resident-day-budget.ts` は時間の連続と一巡・場所を変える移動・夜中の接続を純粋に照合する。`scripts/lib/get-proposed-resident-day-error.ts` はその結果と勤務日に必要な行為を確かめ、`get-proposed-day-place-error.ts` と `get-proposed-day-room-error.ts` で区画の用途と室の利用権・寝間と職場・飲用水の収納を結ぶ。`get-proposed-resident-travel-error.ts` は室を端に持つ移動の列を照合し、`get-proposed-room-route-error.ts` は途中の室の利用権と同じ建物への所属を確かめて既存の `auditBuildingLayout` へ渡す。`get-room-route-connection-error.ts` はその平面の対応と経路の順序・屋外へ出る室を結ぶ。資料の規約は `.docs/settings/README.md` の「未実装の住民の一日の時間の予約」にある。実行時の日課と位置は変更しない。


## 食器洗いの水の予約と名目上の容器

`dishwater-capture-schema.ts` は勤務日の片付けと洗い鉢・水切り・専用の排水容器を結ぶ。`get-dishwater-operator-error.ts` は担当と家具の所有・手入れ、室と勤務日の整合を照合する。`get-dishwater-capture-error.ts` は通常の資料検査から呼び、未知の排水先を補わずに容量の予約と未通過のゲートを守る。

`rectangular-liquid-vessel-schema.ts` は原毛の槽と食器の容器の名目上の形を共有する。`get-furniture-liquid-capacity.ts` は純粋な `world/town/get-rectangular-liquid-capacity.ts` の容量と外形を家具の占有へ照合し、`get-dishwater-room-budget.ts` は洗い鉢と受槽の容量を同じ家具へ照合する。`get-dishwater-equipment-error.ts` は飲用・洗浄・乾燥・排水の置場を区分する。`get-dishwater-capture-budget.ts` は開始時の排水を消さず、一度の水と全回数の保管を別に確かめる。実際の在庫や排水の状態を更新する処理ではない。最初の案と残件は [[room-hue-ludwig-1#食器を洗い排水を保管する案]] にある。


同じ食事室の開始残量と補給・使用の予約は `kitchen-water-cycle-schema.ts` が持つ。`get-kitchen-water-plan-review.ts` は同じ持ち主と容器・食器の排水の予約を結び、`get-kitchen-water-cycle-error.ts` が検査を組み立てる。`get-kitchen-water-bindings-error.ts` と `get-kitchen-water-event-error.ts` が勤務日の全ての該当作業と汲水・移し替えの完了時刻を照合する。`world/town/get-water-stock-cycle.ts` は `advance-water-stock.ts` で時刻順に残量を追い、補給前の使用・あふれ・同時刻の曖昧な順序と翌朝への残量の断絶を拒む。当日の終了時刻と翌日の開始時刻も同じ時点として照合し、両方へ別々の水の操作を予約しない。実在庫と供給を発生させず、手洗いと洗濯や排水の搬出まで成立したとは扱わない。対象の予約と残件は [[room-hue-ludwig-1#食事と食器に回す水の残量の案]] にある。


## 身体の経路の掃引と設定資料

円の身体が折線の全区間を通れるかの共通の計算は `lib/engine/get-circle-polyline-clearance.ts` に置く。呼び出し側がセルの支持の判定と矩形の障害物を渡し、計算側は床の失敗か接触した障害物の位置を返す。戸や待機床・牧草地などの意味と文言をエンジンへ持ち込まない。

格子の掃引の判定は `get-swept-grid-clearance-failure.ts` が失敗の理由または成功を返す。`get-swept-grid-window.ts` が有限な入力・実際の走査範囲と上限を先に検証し、走査量に比例する配列を作らずに同じ行優先の順序で読む。最初の侵入で止まり、地形への問合せの順序も保つ。 行の終端で座標を折り返して各セルの剰余・除算を除き、呼出し元へ渡すセルは毎回別の組にする。基点が負のゼロでも従来の整数加算と同じ正のゼロを渡す。入力・範囲・失敗の種類は `grid-sweep-types.ts` にまとめる。移動候補が壁に当たる通常の探索では例外を毎回生成せず、診断を要する呼出し元には `get-swept-grid-clearance-error.ts` が従来と同じ Error を返す。両方で幾何・走査範囲と接触の判定を共有し、地形の読取りが投げた例外を通常の障害物へ変換しない。モンスターの候補の足場もこの判定を直接使い、身体の半径や細かい経路格子を元の地形の判定の代わりにしない。

設定資料の戸口と二重門はこの計算を使い、障害物の位置をその資料の戸板・枠の名前へ戻す。繰り返した座標を許すか、待機床をどの用途では障害物にするか、外の床をどこへ予約するかは資料の検査側で決める。これにより同じ掃引の修正を共有しつつ、戸の開閉や家畜の操作などの規則を汎用の計算へ混ぜない。


## 二重門の所在と連続した操作の分離

`world/town/` の stock-lock は門と個体・操作者の所在の遷移を検査する。`scripts/lib/get-stock-lock-visit-phases.ts` は同じ記録を身体の歩行・手元操作・押引きの連続した動作列へ結び、記録の重複や省略と位置の飛躍を拒む。幾何の検査は同じ戸板と枠・身体の定義を使う。家畜の観測と誘導の成立や実行時の操作を、この資料の動作列から推定しない。規約は [[README#二重門の操作位置をつなぐ動作列]] にある。


## 二重門の敷地と全体の障害物

`get-stock-lock-site-geometry.ts` は局所の格子と操作床・道の接続点を同じ縮尺で町へ投影する。`get-stock-lock-pasture-partition.ts` は残る草地の境界と前室の外側の境界、草地から回す矩形を求める。道の添字と同じ地図・接続点を照合してから、終端の全幅と全予約を屋根・他の土地と道・川へ検査する。終端の道を前室の検査から除外しない。

`get-stock-lock-site-footprint.ts` が同じ前室を全体の障害物へ渡す。住民の経路と他の建物の接近路にも置いた後の前室を見せ、設備だけの局所検査で通したことにしない。これは資料の候補の検査であり、実行時の地形と動物の移動範囲・描画を切り替えない。規約は [[README#二重門の敷地候補と牧草地の分割]] にある。


## 羊の描画と静止した待機の占有

`world/town/sheep-shape.ts` は現行の羊の胴・頭・目・脚を持ち、`sheep-mesh.ts` は同じ順序と材質で描画する。傾きも `livestock-graze-pitch.ts` を実行時と照合で共有する。`get-sheep-body-radius.ts` は純粋な数値の部品を `lib/engine/get-yaw-pitch-box-radius.ts` へ渡し、任意の向きと草を食べるまでの傾きを覆う円を求める。Three.js の XYZ の回転では向きを変えてから傾く順序を扱い、表示した角度の点だけで全区間を代用しない。Float32 の頂点の丸めに対する外側の余地を含める。

`get-stock-lock-waiting-circles.ts` は実際の地図の全個体と縮尺を配置へ結び、`get-stock-lock-waiting-error.ts` は前室と両側の床・柵と他の個体への離隔を検査する。通常の移動範囲は変更せず、静止した配置の照合と実際の集合・維持を区別する。資料の条件は [[README#二重門を使う間の羊の静止した待機]] にある。


## マップ定義と所在・営業の参照

`world/maps/index.ts` は地上と屋内の地図を組み立てた定義を持つ。通行は `walkable.ts`、座標の距離は `cell-distance.ts` にあり、定義表の読み込みを必要としない。セルとマップの型は同じディレクトリの `types.ts` に置く。

名前付きの場所・直接のセル・タイルの指定の解決は `get-spot-cell.ts` にまとめる。地図を構築するときはその地図の場所の表を渡し、通常の参照では `cell-of-spot.ts` が定義表から場所を渡す。構築処理から定義表を読む参照関数へ逆依存させない。

住民の通常の仕事場は `resident-work-spots.ts` に一度だけ作り、`npcs-at.ts`・`npc-cell.ts`・`spots-on.ts` と店番の判定が共有する。店全体の営業は `shop-open.ts`、閉店までの参照は `minutes-to-close.ts` が同じ店番の規則を使う。公開されているかの判定と隣接マップの参照も、それぞれの定義元を直接読む。互換用の再公開を入口へ戻さない。


## 共有状態と品物の操作の分割

パーティの上限と分配の規則の定数は `world/core/party/rules.ts`、保存する名簿の型は同じ場所の `types.ts` にある。加入・離脱・報告と経験値の分配は各関数のファイルを直接読む。状態を持つ Durable Object と、保存や通信を含まない規則を分ける。

採集資源の状態の型は `world/core/nature/types.ts` にあり、残量の参照・採取・返却は `left-at.ts`・`take-one.ts`・`give-one.ts` が扱う。回復した残量と次の回復の基点は `get-recovered-node.ts` が一緒に求め、各操作で時計の解釈を分けない。遅延した回復と返却の規則は既存の予約処理から呼び、入口に計算を戻さない。採集の予約と配送は引き続き既存のコーディネーターに置く。


## 世界の升目と現在地の参照

`world/maps/grid.ts` は升目と壁・方角の定義だけを持ち、`square-of.ts`・`square-at.ts`・`across.ts` が同じ表を読む。ワールドマップの点・未公開の都市は `world-map.ts` にあり、座標を別の表示用一覧に複製しない。道の参照は `world-roads.ts` がマップの実際の接続を読む。

`world-node-of.ts` は屋外の点を直接返し、屋内なら扉と階段の接続を辿って建物のある通りを示す。最初の接続先が別の階や循環した枝でも、地上への別の接続を調べる。見つからない場所を隣の屋外マップへ置き換えず、既に調べた場所を再び辿らない。地図上の印と下部の屋内の名前は [[ui#3.3 ワールドマップ（開閉・M）— §1]] に従う。

倉庫の定義は `world/core/storage/rules.ts`、空の持ち物の生成は `empty-storage.ts`、預け入れと引き取りは同じフォルダの各操作に置く。入口のファイルと同名フォルダのどちらを解決するかへ依存せず、利用側は定義元を明示して読む。


## 補間と回転の計算の参照

補間は `lib/engine/smooth.ts` と `lerp.ts` を直接参照する。地図の配置や描画の組み立てを、計算の再公開の窓口にしない。身体の回転も同じ依存の向きとし、描画の組み立てを経由せず各計算を読む。式と数値の計算順序は呼出し元によって変えない。


ノイズの整数の混合は `lib/engine/hash2.ts`、格子の値の補間は `vnoise.ts`、周波数ごとの重ね合わせは `fbm.ts` に分ける。後二つは座標・倍率・種を同じ読取り専用の入力で受け、描画のピクセルの部品を経由せず直接参照する。混合の整数化と補間の計算順序・重みを保ち、ファイルの分割で生成する地形や色を変えない。


合成する有界の形状の距離は `lib/graphics/ray/get-bounded-union-distance.ts` が評価する。各部材の値とレベル・六面の領域による切り取りを同じ順で読み、部材ごとの配列を作らず最小値を蓄積する。全ての部材を読み、非数や例外を早期終了で隠さない。離隔の空間分割の上限と不確実な場合に拒む規則は変えない。


## 食事と茶の卓上の割当

`table-place-settings-schema.ts` は両方の配置の共通の形を持ち、`table-service-keys.ts` が資料の二つの入口を定義する。`audit-place-settings.ts` は先に全ての入口を `get-table-service-plan.ts` で読み、出所と所有者・占有の不正や早すぎる設計完了の申告を拒む。その後で各正常な配置の元の全動作を `get-place-reach-error.ts` へ渡す。別の配置の不正を読む前に、重い動作の照合を始めない。茶では杯だけの組を要求し、同じ持ち主・席・元の寸法・囲いを照合する。食事に含まれない器を無視してよいことを、茶の杯の割当の欠落を許す意味にしない。元の台所と利用者の設計依存は `get-table-service-prerequisites.ts` が両方から集める。配置の検査は、食事と茶の間の片付けと清掃・配膳や回収、実行時の日課の採用を証明しない。


## 平行移動の衝突の入力

矩形と直方体の連続した衝突は、相対外形・開始点・終点・障害物・許容差を名前付きの入力で受ける。矩形は開閉する境界も明示できる。直方体は正の体積の重なりを扱い、面で接するだけの場合を衝突に変えない。直方体の平行移動した外形は `lib/engine/translated-cuboid.ts`、関連する三次元の点の型は `cuboid-motion-types.ts` に置く。矩形の四隅の回転半径は同じ順で直接求め、走査用の配列を作らない。


## 固定長の関節の計算の入力と補助

関節の解は根元・目標・二節の長さ・曲げる向け先を、区間の検査は根元・開始点と終点・長さを読取り専用の名前付きの入力で受ける。関連する入力の形と解は `lib/engine/two-bone-types.ts` に置く。目標が同じ位置にある場合と、曲げる向け先が軸と重なる場合の決定の仕方を保つ。

高さを固定した解は二つの水平な円の交差へ分け、同じ中心の円も別に照合する。速度の上限の組立ては距離と曲げる面の範囲を求めた後に呼ぶ。特異な面や伸び切った関節を、便宜上の有限の速度へ置き換えない。三次元の共通の演算と型は [[architecture#三次元の演算と型]] に従い、描画の数値演算を逆向きに参照しない。


直方体の移動の照合は、三軸の変位が全てゼロのときだけ `lib/engine/cuboid-stationary-hits.ts` の静止した厳密な面の判定へ進む。静止した部材ごとに移動の区間と軸の配列を作らない。動く場合の三軸の交差区間・接触と許容差の規則は維持する。


## 三次元の演算と型

和と差・倍率・内積と外積・正規化・補間、列で表す行列とその転置による点の変換は `lib/engine/` の一関数のファイルを直接参照する。描画側に同じ演算を持たず、`ray/vector.ts` を再公開の窓口として残さない。行列が列を持つことと、転置による投影を区別し、身体の向きや部材の座標で取り違えない。

`vector3-types.ts` の Vector3 と ReadonlyMatrix3 は読み取る入力の形である。Vector3Tuple と Matrix3 は、演算の新しい配列や描画の組立てを所有する側が扱う形とする。演算の結果は新しく作り、入力や内部に保持した可変の配列を返さない。描画の既存の所有者へ渡すためだけの配列の複製は増やさない。正規化のゼロの扱いと補間の計算順序は、従来の描画と関節の計算を保つ。

人物の描画版は `world/scene/sprite-render-version.ts` に持ち、保存画像の鍵と事前生成の人物画像の資料で共用する。地面のソースの指紋とは別の仕組みであり、人物の描画結果を変更したときに版を更新する。事前生成の画像は資料の rendererVersion が現在の版と一致する場合だけ使い、版がない旧資料も含め、一致しなければ通常の生成へ戻す。構造が正しい資料であることと現在の描画に適合することを区別する。


## 材質・輪郭と画像の境界

ピクセルを保持するクラスは `lib/graphics/pixel-buffer.ts`、色の変換は `hex-to-rgb.ts`、色の型は `pixel-types.ts` に分ける。地面の変更検知は色の変換も含め、窓口から定義を分けた後の実装を漏らさない。バッファの既存の描画とデータの共有の API は、この分割で変更しない。

`to-texture.ts` は既存の標本化・向きと色空間のテクスチャを作り、`create-textured-material.ts` は一つの材質とテクスチャを所有する。`get-textured-material.ts` がピクセルの弱い参照を鍵に共有可能な設定の材質を保つ。透明な切抜きや既定以外の面は無条件に共用せず、破棄された材質を返さない。古い材質への遅い破棄で同じ設定の置換後の材質を消さない。単色の材質は `create-color-material.ts` から別に作る。

メッシュの輪郭は `outline-shape.ts`、平面の輪郭は `outline-sprite.ts` が、それぞれ元の共有材質と個体ごとの状態を保持する。世界の gfx・pix・outline を描画の基盤の再公開の窓口にせず、利用側が定義元へ直接依存する。図形の境界の型は `ray/primitive-bounds-types.ts` に分け、指定済みの外形と円柱の軸の端の扱いは保つ。


モンスターの経路の格子を作るときは、各マスの中心をスカラーで求め、直後に展開するだけの点の配列を作らない。`create-monster-navigation-free.ts` の地形のセルを読む関数は一つの生成の中で共用し、返す述語は各問い合わせでその時点の地形を読む。地形の結果を保存したり、中心と身体の掃引の照合を省いたりしない。


形状の離隔の証明では、外形が非有限または反転していたら、別の軸の隙間や補助の囲いを根拠に安全と扱わない。`can-separate-primitive-from-cuboid.ts` と `can-separate-surface-from-primitive.ts` は、詳細な照合へ進む前にも外形の妥当性を保つ。外形が有効で離れている場合の早期の証明は維持する。


描画する図形と表面材質の型は `lib/graphics/ray/primitive-types.ts` にまとめる。単色の表面材質は `create-solid-surface-material.ts`、布や帽子の表面の座標から濃淡を作るハッシュは `hash-surface-point.ts` が持つ。型だけを読む配置検査は材質の関数を読み込まず、利用側は各定義元を直接参照する。旧 primitives の公開窓口は残さない。


正射影の光線との交点と表面の法線は `lib/graphics/ray/get-*-ray-intersection.ts` と `get-*-surface-normal.ts` に形状ごとに置き、人物の描画は定義元を直接読む。円錐の座標系は `create-cone-frame.ts` が組み立て、`get-cone-frame.ts` が共用を管理する。座標系は図形の外の弱い参照のキャッシュで保持し、両端の座標の編集・差替えに追従する。座標系とその軸は凍結し、上面の法線は独立した配列を返す。クリップ・SDF の照会の順序を保つ。配置の離隔の証明と、画素を描くための交点を同じ安全判定として扱わない。


注湯の姿勢の検査は `scripts/lib/get-hot-water-station-solids.ts` の同じ天板・脚・杯の囲いを、身体と保持した鍋の両方に使う。`get-hot-water-pot-space-error.ts` が剛体変換を揃え、`world/scene/figure/get-pouring-pot-obstacle-error.ts` が胴と片口の全外形と全ての架け柄を照合する。姿勢の入力型は hot-water-frame-types にまとめ、検査同士の型を得るためだけに呼出し元へ戻る参照を作らない。


円錐の交点は `get-cone-local-ray.ts` で光線を座標系へ投影し、`get-cone-side-intersection.ts` と `get-cone-top-intersection.ts` の候補から手前を選ぶ。側面の二根の順序、接線と高さの境界、正の半径と光線の距離の条件を保持する。底面を新しく閉じず、配置の中実の離隔の形状と描画の面を混同しない。投影後の値は一回の照会だけで使い、図形や光線へ途中の値を書き戻さない。


カプセルの交点は `get-capsule-ray-coefficients.ts` で軸への投影と側面の係数を求め、`get-capsule-end-entry.ts` で丸い端の入口を扱う。軸と平行な光線は `get-capsule-parallel-intersection.ts` で二つの端の交点を比べる。端点の登録順を画面の手前の順序へ使わない。未交差は内部の計算では null として負の交点から区別し、描画へ返す既存の未交差の値は保つ。


球・カプセルと円錐の法線は、各式が使う幾何の値と読み取り専用の点だけを受け取り、材質や描画 ID を必要としない。戻す法線は呼出し側の配列とし、入力とキャッシュを変更しない。カプセルの軸の長さの二乗がゼロの場合は、交点の球と同じ中心から法線を求める。中心のように方向が定まらない点には独自の方向を足さず、基盤の正規化と同じゼロを返す。


人物画像の生成は `scripts/lib/create-sprite-bake-plan.ts` で、現在の入力と完成時の資料・選択範囲を凍結した計画へ分ける。部分生成では対象外の人物の既存の見た目と動作を保持し、現在の入力の定義を未生成の画像へ写さない。再開は `get-sprite-bake-resume-error.ts` が入力全体と完成資料・選択を照合し、動作の辞書の挿入順だけを意味の差として扱わない。

`prepare-sprite-bake.ts` は新しい対象の確定ファイルを外してから未完成の計画を記録し、`complete-sprite-bake.ts` は同じ計画の全対象の非空の通常ファイルが揃ってから完成資料を置き換える。PNG からの符号化と JSON の書込みは一時ファイルを経て確定名へ移す。中断した書込みや未完成の計画は配信の資産に含めない。生成コマンド本体は `scripts/tsconfig.bake.json` でも型検査し、ブラウザー側は描画の直前に版・寸法・動作のコマ数と本人の見た目を計画へ照合する。生成計画とファイルの整合の検査を、全画像の再生成済みの意味へ広げない。


同じローカル出力先の生成は `with-sprite-bake-lock.ts` が、入力の読取り・計画とファイルの準備から生成・完成資料まで囲む。所有記録は出力の兄弟のディレクトリに置き、出力を全消去しても失わない。親の実体のパスへ揃え、出力そのものがリンクや通常のファイルなら使用しない。各処理は一意な自分の参加記録を作ってから他の参加者を見る。生存または判別不能な参加者があれば開始しない。同時開始で両方が拒否される場合もあるが、待ち時間の終了を所有権の獲得とは扱わない。

`is-sprite-bake-claim-blocking.ts` は時刻の古さを停止の根拠にしない。同じ端末の PID が存在しないと確認できた一意な記録だけを回収し、別端末・不明な形式・権限等で判別できない記録は保つ。端末の記録はローカルな所有者を区別する補助であり、共有のネットワークファイルシステムを使う分散ロックを保証しない。解放は自分の記録だけを外し、古い解放で後から取得した処理の記録を消さない。作業と解放が共に失敗した場合は両方の理由を保持する。

符号化の途中の画像名には、現在の所有者の一意な実行トークンを含める。親の停止後に古い符号化の子プロセスが残っても、再開した処理の一時画像と同じファイルへ書かせない。停止した親は確定名への移動と完成資料の発行を続けられず、途中の画像は引き続き配信しない。


`run-sprite-bake.ts` は計画・準備・完成資料の順序を組み立てる。`scripts/bake/` のブラウザー・ページ・一画像の生成はそれぞれ資源の所有範囲を分ける。新規生成は符号化コマンドの確認とブラウザーの起動後に既存の対象を外す。再開の計画が不一致なら、それより前に拒否する。全ページは成功・失敗とも終了まで待ち、複数の失敗も残す。`with-scoped-cleanup.ts` は処理と終了処理の両方が失敗した理由を保持する。

`get-sprite-bake-draw-input.ts` は再利用する画像の判定より前に対象を検証する。ブラウザーの入口 `render-sprite-bake-png.ts` は描画の定義を静的に参照し、ページから読み込む一か所だけを動的なモジュール境界にする。`commit-sprite-bake-strip.ts` は符号化先を実行のトークンで分け、非空の通常ファイルを確認してから確定名へ移す。これは符号化した画像の形式や全コマの見た目の承認ではない。


WebP の符号化は非同期の子プロセスで行い、その間もブラウザーとの通信を処理する。一ページ内は PNG の書込み・符号化の完了・確定名への移動を待って次の画像へ進む。符号化の失敗は完成資料の発行へ進めず、前の確定画像と別の実行の書込み先を保つ。


事前生成の適合判定は `get-resident-baked-strips.ts` が人物・見た目・コマの寸法・動作の長さを照合して行う。適合しないものは通常の描画へ戻す。`get-sprite-strip-url.ts` は描画版・見た目・コマの寸法と動作の長さを HTTP の画像 URL に含める。IndexedDB の版が正しくても、再利用したファイル名だけではブラウザーが古い画像を返す場合があるためである。完成資料の取得は HTTP キャッシュを再検証し、一回の起動内の共有と取得時間の上限は保つ。


モンスターの経路の正方形の障害物格子は `create-monster-navigation-grid.ts` が所有する。実際に確保する格子の寸法と予算を `get-monster-grid-layout.ts` で検証してから、新しいバッファを行順に埋める。長方形の領域の外側の余白は障害物にし、地形へ問い合わせない。毎回の通行判定とその順序を保ち、地形の結果をキャッシュしない。`get-monster-grid-route.ts` はこの格子で経路を探し、同じ座標へ戻す。


React との共有の定義は `components/game/game-context.ts` に一つだけ置く。Provider は参照を渡し、`use-game.ts` は必須の参照、`use-game-state.ts` は外部ストアのセレクターによる購読を受け持つ。`use-player-if-any.ts` はゲームを持たない開発用の道具表示でも呼べる。状態の型は `world/state.ts` の定義元から読み、接続の集約ファイルによる再公開を残さない。


注湯の器の空間の検査は `get-hot-water-pot-space-error.ts` が床と台・杯を受け持つ。床への食込みは、器の姿勢に共通の `get-posed-pot-bottom.ts` の全体の下端で拒否し、台や杯の囲いを迂回しても通過させない。部屋の床を基準とした座標を使い、身体と握り・姿勢の到達の検査と混同しない。


湯沸かしの静止保持は `get-hot-water-holding-frame.ts` が部屋の holding_review から姿勢を作り、注湯と同じ `get-hot-water-posed-frame.ts` の全検査へ渡す。`get-hot-water-frame-context.ts` は同じ部屋・器・杯・操作者を解決する。`get-hot-water-holding-review-error.ts` は `hot-water-animation-schema.ts` が定める待機と見回しの全フレームを扱う。注湯側の既存のコマの順序と器全体を杯より上へ置く条件を変更しない。所有・世帯と荷重の前提は `get-hot-water-operator-errors.ts` へ分け、設定検査はこれらをまとめて照合する。


器の部屋への収まりは `get-pouring-pot-world-bounds.ts` が胴・片口と全ての柄の半径を部屋の座標で囲み、`get-hot-water-pot-grid-error.ts` が床への投影の全範囲を占有格子へ照合する。壁・範囲外と他の家具の占有を拒む。例外は当該の作業台のセルだけとし、`get-hot-water-pot-station-error.ts` が天板・脚と杯の立体を引き続き照合する。`get-hot-water-pot-space-error.ts` は床・格子・作業台の検査をまとめる。投影の占有の照合と、実際の壁と家具の立体の設計・描画の照合は区別する。


炉の形は `world/town/hearth-chamber.ts` が火室、`hearth-parts.ts` が同じ火室と煙道を除いた石材、`scale-hearth.ts` が部屋の縮尺への変換を持つ。描画・煙道の接続・設定の断面検査はそれぞれの定義元から直接参照し、火室と石材へ渡す座標・向き・寸法・底の高さを名前付きの入力でそろえる。関連型は `hearth-types.ts` に置く。


町と室内の描画、野外、開発用の素材一覧は `world/scene/construction/` の部材・素材・登録処理を定義元から直接参照する。描画全体や、野外の部材・人物・テクスチャ・生活小物を再公開する経由モジュールは置かない。人物は `figure/look.ts`・`animation.ts`・`render.ts`・`sheets.ts`、地図の実行時は `runtime/`、間取りは `world/town/floorplan/floor-plan.ts` を定義元として参照する。光源・窓・店とアニメーションなどの登録状態は同じ `registry.ts` の実体を共有し、参照経路ごとに作り直さない。


アイテムの実体は `world/core/items/catalog.ts`、種類と品質・装備欄は `items/kinds.ts`、関連型とアイコン名は `items/types.ts`・`items/icons.ts` に置く。ID の判定、買取の基準価格、売却の可否、装備欄の解決はそれぞれ `is-item-id.ts`・`sell-price.ts`・`sellable.ts`・`slots-for.ts` が持つ。呼出し元は各定義元を直接参照する。店の作り手・親しさと品質別の買取価格は `maker-at.ts`・`shop-friend.ts`・`sells-for.ts`、サーバーが確認した価格と店番の入力型は `shop-command-types.ts`、持物の重量は `inventory-weight.ts`、状態遷移の型は `transition.ts` を直接参照し、`apply.ts` のコマンド実行を経由した再公開に依存しない。


状態の型と公開定数は `world/state.ts`、乱数は `lib/engine/random.ts`、描画の形状構築は `lib/graphics/geometry-builder.ts`、地形の定義は `world/maps/layout.ts` から直接参照する。`world/game.ts` はゲームの組み立て、`world/scene/pix.ts` はゲームの色と画素、`gfx.ts` は画素スプライトの描画を持ち、これらの定義を経由して再公開しない。開発用のパネルは `dev/debug-panel.tsx` の読み込み時だけ固有の CSS と診断用の設定を有効にする。


都市の供給一覧は `scripts/lib/town-supply-systems-schema.ts` で形を読み、`get-town-supply-reference-errors.ts` が参照先の役割と所属・設計ゲートを照合する。`audit-town-supply-systems.ts` が一覧内の ID と未解決の仕事を確認し、`scripts/check-settings.ts` へ接続する。原料から製粉とパンの仕事の対応は [[facility-square-windmill]] と [[town-phanthiet]] に持ち、数量や描画の回転から稼働を推定しない。


未配置の風車の作業場は `scripts/lib/windmill-yard-schema.ts` で役割と門へ入る条件を読む。`get-windmill-yard-boundary-errors.ts` は囲いと連続した門の開口、`get-windmill-yard-zone-errors.ts` は機械と食品の保管・使用面の分離を照合する。`audit-windmill-yard.ts` が既存の占有・到達性・使用面と通路幅の検査も呼び、平面の通過を設備の設計完了にしない。


風車の羽根は `world/scene/construction/windmill-rotor-shape.ts` の梁と布・軸の寸法を描画と設定検査で共用する。`get-windmill-rotor-sweep.ts` は矩形の最も遠い角を使って全回転の囲いを求め、`scripts/lib/get-windmill-yard-rotor-error.ts` が機械の予約から原点を取り、共通のメートル換算と余白を含めて囲いの内側へ照合する。現行の町の配置を、未配置の作業場へ自動で移す処理は持たない。


風車の敷地候補の収集は `scripts/lib/get-windmill-yard-site-reviews.ts` が資料ごとの所属マップへ結び、個別の照合は `get-windmill-yard-site-review.ts` が `windmill-yard-site-schema.ts` から読み、格子を `get-windmill-yard-site-geometry.ts` で外の座標へ投影する。`get-windmill-field-partition.ts` が現行の一つの畑から交差する部分と残る全域・面積を求め、`get-windmill-field-reservations.ts` が元の予約の一致を確認して残る農地へ置き換える。`get-windmill-site-reservations.ts` は入力を変えず新しい予約の Map を作り、候補の順序で畑を分ける。割当てを拒んだ候補も占有を隠さず、別の干渉の検査へ残す。`scripts/check-settings.ts` は結果を他の設備と同じ占有へ登録し、経路と配置へ渡す。`get-windmill-yard-site-errors.ts` は自分の占有だけを除いて、共通の屋外の予約の検査へ渡す。実行時の地形・畑・歩行格子と在庫はこの設計検査から変更しない。


ゲームの時刻は `world/core/jst-minutes.ts` が日本の分へ変換し、`parse-time.ts`・`format-time.ts` が入力と表示、`within.ts` が日付をまたぐ営業や日課の範囲を受け持つ。明るさ・朝夕の色・時間帯の名前は `daylight.ts`・`dusk.ts`・`phase.ts` が同じ時刻からそれぞれ求める。頼まれごとと親しさの一日の判定は `day-of.ts`、その境界の定義は `clock-rules.ts` へ結び、表示の時間帯の名前と混同しない。各呼出し元は定義元から直接参照する。


ショップのタブは `components/game/tabs.tsx` が状態と操作の入口、`tabs-list.tsx`・`tabs-trigger.tsx`・`tabs-content.tsx` がそれぞれの部品を持つ。各呼出し元は定義元から参照し、既存の Base UI の選択・フォーカスとキーボード操作を保つ。共通クラスは引数の className と同じ順で結合し、渡された属性・ref・操作を残して描画へ渡す。

ツールチップは `components/game/tooltip.tsx` が表示状態の入口、`tooltip-provider.tsx` が共通の表示待ち時間、`tooltip-trigger.tsx` が対象、`tooltip-content.tsx` が説明のパネルを持つ。呼出し元は定義元を直接参照する。配置の属性は Positioner に渡し、Popup の属性と分ける。既存の初期値・属性・表示クラスを保つ。

成長の定数は `world/core/growth-rules.ts`、関連型は `growth-types.ts` に置く。必要経験値・能力値の消費ポイント・到達時の獲得ポイント・初期能力値・経験値の加算は、それぞれ `exp-to-next.ts`・`stat-cost.ts`・`points-for-level.ts`・`starting-stats.ts`・`gain-exp.ts` が持つ。呼出し元は定義元を参照し、初期能力値は型キャストを使わず全能力を明示する。経験値の加算は入力を変更せず、従来の上限と端数処理を保つ。

生活スキルの上限・節目と表示文言は `world/core/life-rules.ts`、経験値の型は `life-types.ts` が持つ。経験値のしきい値は `life-thresholds.ts` が一度だけ組み立て、読取り専用の列として `life-exp-at.ts` と `life-level.ts` が共用する。加算と合計上限は `gain-life.ts` と `life-total.ts`、初期値と旧保存の変換は `empty-life.ts` と `life-from-proficiency.ts`、忘却は `forgotten-life-exp.ts` に分ける。製作経験・採集量・品質への習熟・次の節目は各定義元から参照し、一覧と保存の能力順は維持する。

持ち物の型は `world/core/bag-types.ts`、枠数は `bag-rules.ts` が持つ。照合・積み重ね・追加・削除・枠の移動はそれぞれ定義元の一関数から呼ぶ。追加と削除の入力は持ち物・品・個数・任意の印を名前で渡す。新品への印と耐久値の付与は `stack-with-mark.ts`、既存の品の受渡しは `put-stack.ts` と分け、消耗した道具の耐久値を新品へ戻さない。

作り手の癖の表は `world/core/makers.ts`、型は `maker-types.ts` が持つ。標準の作り手・癖の参照・品名・使用効果・価格・流通する品質は `usual-maker.ts`・`trait-of.ts`・`display-name.ts`・`effect-of.ts`・`price-of.ts`・`qualities-of.ts` に分ける。各利用箇所は定義元を参照し、表の並び順と既定の作り手・品質・価格の丸めを保つ。

取引で出す枠の検証と取出しは `world/core/get-trade-out-goods.ts` が持つ。重複する枠・空の枠・取引できない品・不足する個数を断り、入力の持ち物を変更しない。所持金の検証は `trade-out.ts` で先に行い、失敗理由の順序と受渡しの記録を保つ。受取りも全品の格納と重量の検証を終えてから確定する。

取引の提案と保存記録の型は `world/core/trade-transaction-types.ts` に置く。提案と品列の比較は `same-proposal.ts` と `same-stacks.ts`、保留は `prepare-trade.ts`、確定と取消は `finish-trade.ts` が持つ。保留・確定の入力は名前で渡し、同じ版の再試行で既存の記録を返すこと、古い要求と異なる内容を断ること、確定時に持ち物と所持金だけを反映することを保つ。

取引全体の事前検証は `world/core/check-trade.ts` に参加者・各自の提示と時刻を名前で渡す。距離と枠数は `trade-rules.ts`、提示の型は `trade-types.ts`、初期提示は `empty-offer.ts` が持つ。`taken-of.ts` は共通の GameEvent の判別された受渡しイベントから品列を読み、type の文字だけで別のイベントを受渡しの形と仮定しない。双方の送付と受取の順序を保ち、元の状態を変更しない。

周囲への発言と叫び声の対応表は `world/server/map-room/chat.ts`、受付は `handle-speech.ts` に置く。連投の試行は `world/core/get-speech-attempt.ts` が受理できるかと保存する履歴を返し、拒否した試行も保存してから配信を判断する。`can-receive-speech.ts` は各送信の直前に受信者を調べ、本人、未参加、終了した接続を除く。通常の発言は発言者の位置が分かる場合だけ距離を調べ、位置がなければ配信しない。叫び声は位置の有無によらず部屋全体を対象にする。通知の失敗は既存の通知処理で受け止め、次の対象への配信を続ける。

糸の交換の対応表は `world/server/map-room/threads.ts`、申込みは `handle-thread-ask.ts`、返答は `handle-thread-answer.ts` に置く。申込み先の到達位置がない場合は距離の拒否を返し、保存・通知へ進まない。有効な返答では申込みを消費し、一つの時刻で双方の糸を作る。返答者への保存と結果送信、申込者への保存と結果送信の順を保つ。接続には識別子、送信、状態参照と更新だけを要求し、糸の生成は `world/core/thread-of.ts` に任せる。

パーティの招待は `world/server/map-room/handle-party-invite.ts`、脱退は `handle-party-leave.ts`、分配変更は `handle-party-mode.ts` が受け持つ。`get-party-invitation-rejection.ts` は既存のパーティのリーダーかどうかを満員より先に判定する。招待は接続の招待先を保存してから相手へ通知し、その場で所属を変えない。脱退はパーティの保存先、接続の所属、本人の保存状態の順に更新してから表示を外す。分配の変更権限は保存先に任せる。これらの受付は必要な状態参照・送信・接続の更新だけを引数の型へ表す。

パーティの対応表は `world/server/map-room/party.ts`、招待への返答は `handle-party-answer.ts` に置く。有効な招待を消費してから辞退と既存の所属を調べ、新規の場合は `initialize-party.ts` で招待者を先に登録する。返答者の登録は `join-party-member.ts` が受け持ち、名簿が拒否した場合は本人の所属を保存せず満員を返す。名簿への追加、本人への保存結果の送信、接続の所属の反映を元の順に進める。`read-party-member.ts` は加入時の本人の保存状態から名簿用の値を作る。加入先の参照は `party-join-types.ts` の必要な RPC だけで渡す。

パーティの定期確認は `world/server/map-room/handle-party-look.ts` が一度の照会で名簿と会話を受け取る。同じパーティの会話番号だけを引き継ぎ、名簿から本人が消えていれば `clear-party-membership.ts` で接続の所属、本人の保存状態、表示の順に後始末する。通常の脱退もパーティの保存先から離れた後に同じ処理を使う。照会が失敗しただけでは所属を消さない。表示を送ってから会話を送り、会話は本人の保存済み所属が接続の所属と一致するときだけ送る。`send-party-chat.ts` は接続の状態参照と送信だけに依存する。

パーティ会話の対応表は `world/server/map-room/party-chat.ts`、受付は `handle-party-speech.ts` に置く。本人の保存済み所属と接続の所属を先に照合し、不一致なら名簿の発言受付や履歴の取得へ進まない。保存先が発言を拒否した場合も履歴を取らず拒否だけを通知する。受理後の履歴取得は `deliver-party-chat.ts`、接続の終了の確認と公開用の項目への変換は `send-party-chat.ts` が受け持つ。各処理は `party-chat-types.ts` の状態参照と送信だけを持つ接続を受け取る。

対面取引の対応表は `world/server/map-room/trade.ts`、決定と交換の受付は `handle-trade-confirmation.ts` に置く。`get-trade-confirmation-participants.ts` が現在の双方の取引と所有者を照合し、双方の確定を通信前に予約する。`settle-map-trade.ts` は事前検査、保存先での進行、状態通知、終了を順に呼ぶ。保存状態の読取りと検査は `prepare-trade-settlement.ts`、提示の品列と各参加者の版から提案を作る処理は `get-trade-proposals.ts` が持つ。`advance-trade-settlement.ts` は所有者順で担当を一つ決め、登録後の進行を保存境界ごとに呼ぶ。予約開始前の例外と開始後の応答喪失を区別し、保存済みの処理は逆送付で補償せずアラームの回復に任せる。確定後の状態通知は `publish-settled-trade.ts`、同じ取引だけの終了と通知は `close-settled-trade.ts` に置く。必要な RPC の型は `trade-settlement-types.ts` で限定する。

対面取引の招待は `world/server/map-room/handle-trade-ask.ts`、取消は `handle-trade-cancel.ts` が扱う。招待先の到達位置がない場合は距離の拒否として扱い、招待を保存・送信しない。招待の受付は必要な接続の識別子と送信、相手の状態参照だけを受け取り、参加状態の読取りも接続全体を要求しない。`same-trade.ts` で相手と共有の取引識別子を照合し、同じ相手との次の取引を古い処理が閉じない。取消と確定後の終了通知で同じ照合を使い、確定処理を始めた取引は取消操作で外さない。

対面取引の招待への返答は `world/server/map-room/handle-trade-answer.ts` が受け持つ。返答時の辞退・参加状態・距離の判定は純粋な `get-trade-answer.ts` に置き、辞退、参加状態、距離の順で理由を決める。受入れた場合は同じ時刻で確認した双方の停止地点を返し、受付は位置を計算し直さず保存する。停止地点は元の経路から写す。`reject-trade-invitation.ts` は招待者の招待を外し、返答者が別に始めた取引を取消通知で閉じない。受諾時だけ共有の識別子を作って双方の取引を開く。`create-open-trade-side.ts` は参加者ごとに独立した提示と承認の初期状態を作る。入力は `trade-answer-types.ts` に置き、必要な接続の読取り・保存・送信だけを要求する。

対面取引の提示の受付は `world/server/map-room/handle-trade-offer.ts` が持つ。持ち物を読む前に提示の版を進め、読取り後に `get-current-trade-offer.ts` で双方の接続、取引識別子、相手、提示の版と状態を照合する。一致した双方の取引を得てから表示用の品を作り、両方の承認を外す。相手だけが決定済みでも新しい提示を受け付けるが、本人の決定後や双方の確定処理中は変更しない。

対面取引の表示メッセージは `world/server/map-room/get-trade-view.ts` が参加者ごとの向きで作る。操作に使う提示枠の配列は本人の分だけを写し、相手の枠番号を送らない。`show-trade.ts` は双方の提示と姿があることを確認してから順に送る。最初の送信失敗では次の送信へ進まず、呼出し元へ失敗を返す。確定後の状態通知で使う全件の送信結果待ちとは区別する。

対面取引の提示品の写しは `world/core/get-trade-offer-presentation.ts` が作る。持ち物・所持金と提示を受け取り、枠数の上限、空の枠、個数不足、取引できない品、重複する枠、所持金不足を検査する。この段階では品物を予約せず、通信の後に同じ取引かを確認する処理は部屋に残す。確定時の保存先での再検証も省かない。

風車の敷地に添える接続路は `scripts/lib/get-windmill-road-approach.ts` が南の実寸の開口と既存の道の終端から求める。作業場と接続路の全幅を一緒に農地から差し引き、全ての残存片と面積を保持する。接続路の各区間も他の計画から見える予約へ登録し、最初の区間の自分の開口と最後の区間の接続先の道だけを対応する干渉の例外とする。地形・搬送する身体・収量を検証済みにせず、未採用の案として検査する。

戦闘計算の型は `world/core/combat-types.ts`、損失を免除するレベルは `combat-rules.ts` が持つ。命中率・通常攻撃・戦技と術・戦闘不能時の経験値の損失は `hit-chance.ts`・`swing.ts`・`art-swing.ts`・`death-penalty.ts` に分ける。戦技の入力は名前で渡し、会心時に回避の乱数を消費しないことと、術では威力の乱数だけを使うことを含め、判定と乱数の消費順を維持する。

能力値の計算は `world/core/derive.ts` が装備補正・補正済み能力値・防御の集計を組み立て、`get-derived-stats.ts` が共有の式を持つ。関連型は `stats-types.ts` に置く。品質による基礎性能は `equipment-attack.ts` と `equipment-defense.ts`、能力補正は `scaling.ts`、補正前の条件の値と不足判定は `standing.ts` と `unmet.ts` が持つ。条件の定義順を保ち、未知の名前を型キャストで通したり無視したりせず不正な定義として検出する。

プレイヤー状態の型は `world/core/player-types.ts`、初期値と時間・外見の定数は `player-rules.ts`、保存とプロフィールの検証は `player-schema.ts` に置く。初期化は `new-player.ts`、厳密な復元は `parse-player.ts`、新品への代用を明示した互換入口は `load-player.ts` が持つ。旧保存の変換は `from-v2.ts`・`get-v2-player-base.ts`・`to-legacy-hotbar-entry.ts` に分け、旧装備を袋へ返せるかと旧ショートカットを照合する。自然回復は `settle.ts` と `recover-vital.ts`、満腹と温まりは `full-now.ts` と `warm-now.ts`、装備した首巻きの表示は `worn-neck.ts` が持つ。保存形式と既定値の順序・回復時刻の境界を保ち、読めない保存を新品へ置き換えない入口は維持する。

頼まれごとの定義表は `world/core/errands.ts`、型は `errand-types.ts`、受注数と日ごとの上限は `errand-rules.ts` に置く。材料と届け先の必須項目は `bring-errand.ts` と `deliver-errand.ts` が持つ。日替わりの選定は `get-errand-requests.ts` と `hash-errand-day.ts` が担当し、保持する結果は直近の一日分に限る。`errand-today.ts` と `errands-on.ts` は同じ選定を読み、一覧は住民の定義順を維持する。受注の期限・名前・会話の進行条件は `todays.ts`・`errand-label.ts`・`errand-progress.ts` と `get-errand-phase.ts` が持ち、材料が揃ったことを完了と取り違えない。

依頼完了時の親しさは `world/core/get-errand-friendship.ts` が持込みと配達で分ける。配達の依頼元と受取人の増加は順に反映し、変更された相手だけを完了イベントへ載せる。材料が不足する場合や期限切れ・完了済みの場合は、報酬や親しさを更新しない。

戦闘の通知と受領記録の型は `world/core/combat-delivery-types.ts`、内容の比較は `same-combat-command.ts`、重複と世代・取引の予約を確認した受領は `receive-combat.ts` が持つ。受領の入力は名前で渡し、既読の再送では新しい受領記録やイベントを作らない。保存入口も結果と受領記録を分割代入せず、同じ応答の属性として扱う。

売買の見積りと受領記録の型は `world/core/shop-receipt-types.ts`、要求と見積りの比較は `same-shop-command.ts` と `same-shop-quote.ts`、現在の予約・品を確認する適用は `get-shop-quote-result.ts` に置く。`receive-shop.ts` は保存済みの結果を先に読み、廃止された品の古い受領も再実行せずに再送へ返す。新しい見積りはコマンドと単価を検証し、成功と拒否の両方を記録する。

採集の要求と受領記録の型は `world/core/gather-receipt-types.ts`、受領の判定と適用は `receive-gather.ts` が持つ。入力は状態・直前の受領・要求・時刻と予約を名前で渡す。同じ ID と抽選の再送は現在の場所の定義を読み直す前に記録済みの成功・拒否を返し、新しい抽選では場所と乱数の範囲を検証する。保存入口は結果と受領記録を同じ応答の属性から読む。

採集場所の表は `world/core/gather.ts`、型は `gather-types.ts`、距離と基本の消費は `gather-rules.ts` に置く。木・きのこ・薬草・花・釣り場の生成は `tree-node.ts`・`mushroom-node.ts`・`herb-node.ts`・`flower-node.ts`・`fish-node.ts` が持つ。場所の参照は `node-of.ts`、成果の重みと習熟・道具の追加分は `yield-of.ts` が扱う。座標と定義順、節目で開く物・重み・回復量と時刻、抽選値の使い方は保つ。

風車の敷地と接続路の検査用地形の測定は `scripts/lib/get-windmill-site-terrain.ts` が担当する。`lib/engine/scalar-field-range.ts` を使い、格子内部の極値と切られた境界を含む標高の範囲を共通の縮尺でメートルへ換算する。入力の領域と地形を変更せず、地形の保持範囲外は拒否する。道路の配置案を反映した地形を使い、実行時の元の道に対応する地形とは区別する。設定検査の `--terrain-report` は測定だけを出力し、設計ゲートと未照合状態を変更しない。


風車の接続路の中心線の標高の予約は `windmill-approach-section-schema.ts` を通して平面案へ結び、`scripts/lib/get-windmill-approach-section.ts` が作業場・曲がり角・道の中心をつなぐ。道の標高は設定検査と同じ地形から読み、区間の実寸と高低差・勾配は `get-windmill-section-segment.ts` が求める。通常の設定検査で予約の最大勾配と作業場の地形への埋込みを照合し、`--terrain-report` で断面を出力する。これは中心線の予約の検査であり、全幅の舗装・排水や実行時の移動を生成しない。


風車の道への継目は `scripts/lib/get-windmill-road-seam.ts` が最終区間の幅と向きから求め、`scalar-field-range.ts` で線の内部も含む標高の範囲を読む。中心線の標高との差は切土・盛土が必要になる最大の高さとして断面の出力へ添え、工事の土量や全幅の接続完了として扱わない。


風車の接続路の施工面の予約は `scripts/lib/get-windmill-approach-surface.ts` が水平な曲がり角の西端と道路の継目から求める。最初の区間との重なりは水平に保ち、それより西を道の全幅の横断形状へなじませる。`get-windmill-approach-surface-height.ts` は道路側の端では元の地形の高さを返し、中間は横断位置ごとの線形の配分で求める。継目の標高の全範囲から最大の縦断勾配を照合し、中心線だけで全幅を通過させない。これは設定の未採用の施工面であり、地形・歩行格子は変更しない。


店の定義表は `world/core/shops.ts`、関連する型は `shop-types.ts`、種別の表示名は `shop-kind-names.ts` が持つ。ID の判定は `is-shop-id.ts`、店番から店を選ぶ処理は `shop-of-keeper.ts`、買い取りの種類別の倍率と切捨ては `shop-buys.ts` から直接参照する。店番の店は営業中を先に探し、見つからなければ元の定義順の最初の店を返す。型の強制変換と再公開でこれらの処理を定義表へ戻さない。


水瓶を持つ一姿勢の身体との離隔は、`world/scene/figure/create-native-body-frame.ts` で解いた姿勢の人体形状を一度だけ作り、前腕・瓶・取っ手の各検査で共用する。`get-native-body.ts` は look と skeleton の参照が異なる準備済みの形状を拒否し、単独の検査では従来どおり形状を作る。共有は一回の同期した検査の中に閉じ、人物やフレームをまたぐキャッシュにはしない。姿勢・動作の全フレームと離隔の検査条件は保持する。 静止した受取りと後退の各標本でも、同じ解いた姿勢から作る人体を棚と床の検査で共用する。床の照合では瓶の形状も従来どおり追加する。握りの有無が異なる持上げ区間の人体を、この共有へ混ぜない。

手足と髪の距離場の囲いは `lib/graphics/ray/get-limb-envelope.ts` が関節の球を一度走査して求める。球の中心・半径と軸方向の範囲の式、距離場と細分する判定は変更しない。境界を作るだけの一時配列を減らすことと、判定の対象や精度を減らすことを区別する。


棚の検証は `scripts/lib/create-front-access-plan-frame.ts` で一回の呼出しに閉じた固定計画の読取りを用意する。`get-front-access-handle-plan.ts` は同じ部屋・建物・収納のときだけ共有し、実際の組立ては `calculate-front-access-handle-plan.ts` が最初に必要になった位置で一度行う。最初の検査の順序は保ち、手・足・全身の各標本と区間の検査は毎回行う。入力を変えた次の検証や別の所有者には計画を持ち越さない。


取引所の型は `world/core/exchange-types.ts`、上限・期間と手数料の率は `exchange-rules.ts` に置く。新しい銘柄の読取りは `parse-symbol.ts`、表記への変換は `symbol-key.ts`、新しい注文の拒否理由は `order-failure.ts`、預かる額は `escrow-for.ts`、初期状態は `empty-exchange.ts` が持つ。新規の銘柄の表記を厳しく検証することと、保存済み注文の返却時に旧表記を読み戻すことは別の契約にし、後者へ現在の取引可否を押し付けない。品質の数値の判定は `is-quality.ts` を使い、強制変換で型を与えない。


取引所の約定の入口は `world/core/place.ts` に置き、`create-exchange-placement.ts` が呼出し元の状態を複製して一回の約定用の状態を作る。`get-matching-orders.ts` は相手注文を価格・時刻で選び、同順位では元の順序を保つ。`fill-exchange-order.ts` は一件の数量・予算・手数料と配送を反映し、`finish-exchange-order.ts` が残りの注文と返金を確定する。取消は `cancel.ts`、期限切れは `expire.ts` に分ける。取消と期限切れは `give-back-order.ts` から返却し、保存済みの印を `held-exchange-item.ts` で復元する。`credit-exchange-inbox.ts` と `record-exchange-fill.ts` は約定・取消が作った作業用の複製だけを更新し、呼出し元の状態は変更しない。日別の記録は `get-exchange-day.ts` で同じ日付の境界を使う。板の問い合わせは `book.ts` と `get-book-side.ts` が価格別の数量と両側の順序をまとめる。


## 復帰位置と糸の訪問権限

保存する経路と接続の型は `world/core/location-types.ts` に置く。`location-at.ts` は歩き終えた経路区間だけを経過時間から求め、`town-location.ts` は世界を移ったときの新しい町の経路を作る。接続の所有権の確認と保存は Player DO の入口に残す。

糸の型と保持上限は `world/core/threads.ts`、保存済みの公開識別子の計算は `thread-key.ts`、相手の糸の生成は `thread-of.ts` に置く。`keep.ts` が同じ相手の置換と古い糸の除外を行い、`may-visit.ts` が自分の町と保持した糸の町への訪問を判定する。識別子の計算順序を分離で変えず、保存済みの糸を別の相手として扱わない。


## 生き物の傷と戦闘の占有

マップのチャンネル内の生き物の状態と公開値の型は `world/core/wild/types.ts` に置く。`empty-wild.ts` が初期状態を作り、`about.ts` は復帰時刻、`fighting.ts` は戦闘相手の占有期限を判定する。`hp-of.ts` は不在・回復中と、戦闘が途切れたときの全快を同じ状態と時刻から求める。

`hit.ts` が占有と復帰時刻を確かめてから命中を反映する。外れでも占有を始め、別の相手の占有中は元の状態を返して拒む。討伐時には傷と占有を外し、定義された復帰時刻を保存する。`view-wild.ts` は同じ判定でマップの公開値を作る。サーバー側の要求の再送と報酬の保存は引き続き `world/server/begin-strike.ts`・`advance-strike.ts`・`deliver-strike.ts`・`recover-strikes.ts` が担当し、保存の型は `wild-record.ts` が持つ。


## 武器の形と金属の組立て

`world/core/items/weapon-shapes.ts` と `remade-weapons.ts` は形の基礎値、`weapon-metals.ts` は金属の係数と呼び名・説明の断片を持つ。`weapon-types.ts` が形と金属から品目 ID を導く。`weapon.ts` が元の丸め順序で品目を作り、`weapons.ts` は全ての組合せを明示した定義表を持つ。形や金属を増やして組合せが欠けた場合は型検査で検出し、途中まで埋めた表を完成した Record として型変換しない。形の資料は `/dev` の品目一覧で展開済みの武器へ対応する。

`forge-of.ts` と `iron-forge-of.ts` が素材と節目を返し、`weapons-of.ts` は形の名前全体を使って対応する武器を選ぶ。保持する鉄の武器の ID は `iron-weapon-id.ts` で作り、`is-shape-id.ts` と `is-weapon-id.ts` は定義表の所有キーへ型を絞る。識別子・定義順・品目の値・素材の順序を、分割によって変えない。


## 品目の定義を組み立てる入力

`world/core/items/catalog.ts` は各品目の名前付きの入力を持ち、`food.ts`・`dish.ts`・`medicine.ts`・`brewed-medicine.ts`・`tool.ts`・`material.ts`・`gear.ts`・`crafted-gear.ts` へ渡す。関連する入力の型は `factory-types.ts` にまとめる。重さと希少度の省略時の値、回復の式、積み重ねる数、製作品の印と元の use・equip の参照は分離で変えない。

品目 ID の一覧は `item-ids.ts` で定義表の所有キーへ絞って作り、列挙結果を型変換しない。品目の識別は既存の `is-item-id.ts` に揃える。定義表からこの識別処理へ戻る実行時の循環参照を作らない。


## 部屋の識別と表示・計測の小さな処理

町と定員の定義は `world/channels.ts` に残し、部屋の名前は `room-name.ts` と `parse-room.ts`、故郷は `hometown-of.ts`、入室先の選択は `choose-channel.ts` に置く。通信の形は `protocol.ts` に残し、経路の受入れは `valid-path.ts` と `adjacent-cells.ts`、経過時間による到達範囲は `cells-reached.ts` に分ける。

会話と画面の状態の型は `state.ts` が持ち、文字の表示量は `revealed.ts` と `fully-shown.ts` が同じ速度で求める。計測の操作は `lap-start.ts`・`lap.ts`・`lap-end.ts` に分け、`diagnostics.ts` の一つの時計を共有する。既存の全体履歴と開発時の場面の公開先は同じグローバルオブジェクトへ結び、`expose-scene.ts` は開発時だけ更新する。


## 町の定義と判定の所有者

建物と世帯の表は `world/town/houses.ts`、品物の実寸は `fit.ts`、日課は `routines.ts`、登録した室内は `interiors.ts` に残す。世帯・階数・寝床・席と入室可否、家具の展開と床への収まり、外観の選択はそれぞれの関数のファイルが持つ。`floorplan/floor-plan.ts` は一度求めた間取りの同じ参照を返し、`plan-of.ts` は個別の建物から求める。外観の選択も元の建物順と近隣の比較順を保ち、一度確定したものを再計算しない。

室内の組立ては `interior-plan.ts`、歩けるセルは `is-interior-cell-open.ts` と `interior-rows.ts` が持つ。共有する地図の大きさと投影倍率は `interior-rules.ts` に置き、登録した室内から組立てへ戻る循環参照を作らない。入口・家具・階段の通行条件と寸法を分割で変えない。`slot-at.ts` と `spot-at.ts` は日課の同じ索引と来客順を共有する。活動姿勢の座標変換は `project-activity-pose.ts`、台詞の条件判定と選択は `lines/fit.ts` と `pick.ts` が持つ。棚・炉・持替え・蓋は操作ごとの名前付き入力を使い、関連する形の型だけを元のファイルで共有する。


## 会話と通知・描画用の小さな変換

会話の店の状態・依頼の選択・操作の選択・台詞の選択は `world/parts/keeping-shop.ts`・`errand-choices.ts`・`choices-for.ts`・`lines-for.ts` が持つ。台詞には名前付きの入力で状態・住民・既読の保存先と時刻を渡し、既読の読取りは `read-spoken-names.ts` に分ける。出来事の通知は `tell.ts`、交流が終了した理由の文言はそれぞれの `*-closed-text.ts` に置く。分離によって表示文言や通知・履歴の順を変えない。

プロフィールの下書きは `world/client/profile-draft.ts` の同じスキーマで読み、読取りと書込みは `read-profile-draft.ts` と `write-profile-draft.ts` に分ける。敵の更新は `current-creature.ts` と `merge-wild.ts` が同じ個体の版を比較し、遅い更新を捨てても別の個体の新しい情報を失わない。ピクセルの定義表は `world/art/pixel-art.ts` に残し、文字配列の変換と空き装備枠の影は `sprite.ts` と `silhouette.ts`、品目用の色の変換は `items/` の関数の定義元を直接参照する。


## サーバーの操作と保存形式の境界

`world/server/` のコーディネーターの操作は、受付・確定・配送・再試行ごとのファイルに置く。元の `*-coordinator.ts` は保存する相手と呼び出し先の型、再試行の定義を共有する。引数が多い操作は名前付きの入力を受け、Durable Object の入口は従来の RPC 名と保存単位のまま呼び出す。Void が渡す context は入口の第一引数に残し、多い操作入力だけを次のオブジェクトにまとめる。呼び出す側と再試行用の相手の型も同じ入力を使う。DO の定義ファイル・識別子・保存版・インスタンス名はこの分割で動かさない。

戦闘の支払後の反映は `apply-reserved-strike.ts` が担当し、要求を照合した所有者を明示して渡す。支払の拒否は元の HP と復帰時刻を返し、受入れた命中だけがその対象の状態と公開順を進める。効果のキューは元の命中の結果と一緒に保存してから、別の配送で先頭から受領を確認する。店の再補充の作り手は `shop-maker.ts` が店名を定義の所有キーに絞ってから求め、未定義の店名を通常の作り手へ代用しない。


## ゲーム規則の一括した更新

製作の材料選択は `world/core/take-craft-inputs.ts` が品質の低い順と同品質のスロット順で行い、材料が不足したら途中の所持品を返さない。`craft-command.ts` は、材料をそろえた結果へ成功・失敗、手数料と経験を適用する。採集用具の摩耗は `wear-gathering-tool.ts` が元の所持品と装備を変更せずに求め、`gather-command.ts` が収穫を入れられたときだけ採用する。配送品は `receive-items.ts` がすべて収まる場合だけ受け入れる。

戦闘の支払いの受付と再送の照合は `combat-payment.ts`、支払えるかの判定は `get-strike-payment.ts` が担当する。復帰した生存番号、占有、倒れている状態とスタミナの判定順を保ち、再送で二度支払わない。会話・商売の友好と採集用具の選択も、直前の計算結果を受け取って次の値を返す。


## 描画の場と図形・色の計算

符号付き距離の計算は `lib/graphics/ray/limb-sd.ts`・`frame-sd.ts`・`loft-sd.ts`、断面の型は `distance-types.ts` が持つ。ゲームの配置や UI へ依存させず、形状の境界・交差した区間とその位置、同じ入力から返す距離を保つ。

カメラの回転と歩く方向、セルと座標の変換、座った身体の支持とアンカー・原点の変換は、それぞれの関数へ直接参照する。座るアニメーションのフレーム位置は `world/scene/seated-anchor.ts` の非公開の弱い参照のキャッシュで共有し、呼び出しごとに作り直さない。グリッドの定義の照合は座標変換の定義元から参照しても実行する。

画素バッファの寸法と保存先の参照は生成後に固定する。RGBA 配列は描画の所有者が更新し、`to-texture.ts` は同じ配列を GPU のテクスチャへ渡す。地面の部分描画は同じ保存先へ帯を合成し、ワーカーが結果を返すときは ArrayBuffer を転送する。照会のたびに写しへ変えるとこの共有と転送の契約が変わるため、図形ビルダーの検査用の写しとは分ける。

屋根・壁・石・木・布のピクセルの生成は `world/scene/textures/` の操作ごとに分ける。多い引数は名前付きにし、省略時の値と色の計算・画素を描く順を保つ。スプライトのアトラスと帯状の並びは `figure/build-sheet.ts` と `build-sheet-strip.ts` が作る。分離を理由に素材や姿勢を変更しない。


## UI 部品と受け渡すプロパティ

ゲームの窓・チャット・申し込みと開発用 UI の部品も、公開する関数の定義元から直接参照する。サイドバーの状態と型・定義は `components/ui/sidebar-data.tsx` の一つの Context を共有し、Provider と利用するフックを別の Context で作らない。ロードの表示と取り外しのタイミングは `components/hud/loading-rules.ts` を共有し、画面の部品へ戻る循環参照を作らない。明朝体のロード用の部品は通常のゲーム画面へ流用しない。

プロパティは名前付きの入力から読み、残る属性は `lib/engine/without-keys.ts` で元を変更せずコピーする。必要な属性と列挙可能な Symbol、内側の値の参照を保つ。props の分離で既存の className を生の値で上書きしたり、子要素・ref・イベントを落としたりしない。CSS 変数はその名前を型に持つ style オブジェクトで渡し、型変換で隠さない。

開発用 UI の生成設定は維持するが、生成された経由モジュールを実行時の依存へ戻さない。クラス名の結合は `cn` の定義元を使い、使われていない `lib/utils.ts` は置かない。生成後もゲームと開発用の見た目を混ぜず、同じコード規約へ揃える。


開発用の定義表は `dev/sheet-list.tsx` と `dev/sheet-row.tsx` を入口とする。一覧、行、参照、プレビューはそれぞれの定義元を直接参照する。表の登録は `dev/sheets/registry.ts` に保ち、行索引と逆参照のキャッシュは検索する関数のモジュール内で保持する。アイコンの描画と拡大・切り抜きは `world/art/icons/`、表示用 URL は `world/art/icon-url.ts`・`ui-icon-url.ts`・`portrait-url.ts` に置く。接続開始の共有 Promise は `world/client/load-player-id.ts` の内部に置き、完了時と失敗時に同じ共有先を解放する。


地形の共有バッファと選択中の配置は `world/scene/world.ts` に保持し、配置の切替、計算済みフィールド、地形の参照と通行判定はそれぞれの定義元から呼ぶ。フィールド計算中の道路サンプルは、準備処理へ戻らず同じ共有バッファを直接読む。保存済みの地面画像の識別子は `ground-version.ts` に列挙した描画依存から作る。`ground-version.test.ts` は描画と地形の入口から依存先をたどり、分離された処理も識別子へ含まれることを確かめる。

人物画像の Worker の生成、破棄、要求の処理は `world/scene/helpers/sprite-pool/` に分ける。生成時に完了通知を受け取り、破棄時に代替 Worker の生成方法を受け取ることで、生成と要求の処理を相互 import しない。Worker の素材 URL は生成処理のファイル位置を基準に解決する。既存の失敗時の再試行、重複通知の抑止、遅れて届く結果の破棄は維持する。


`lib/engine/polyline.ts` は入力の点から照会用の区間を作り、private フィールドだけに保持する。元の点列を後で編集しても照会結果は変わらず、区間配列を公開しない。区間レコードとインスタンスを変更不可にし、距離計算はインスタンスと一回限りの入口で同じ処理を使う。曲線の座標列は `lib/engine/get-catmull-path.ts`、各座標の補間は `lib/engine/catmull-coordinate.ts` が受け持つ。空の入力は空の座標列を返し、分割数は正の整数に限る。地面画像の保存識別子にはこの補間処理と整数範囲の生成も含める。
