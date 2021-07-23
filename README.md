# Discord 人狼bot

## コマンドリスト

### ずっと使えるコマンド

|Command|Args|Description|Ex.|
|:---|:---|:---|:---|
|`w/start`||ゲームを開始します|`w/start`|
|`w/info`||各プレイヤーの生存と番号を確認します|`w/info`|
|`w/close`||ゲームを終了します|`w/close`|

### 初日前に使うコマンド

|Command|Args|Description|Ex.|
|:---|:---|:---|:---|
|`w/set`|`[Role] [Number]`|役職の人数を指定します|`w/set 人狼 2`|
|`w/jobs`||現在追加された役職を確認します|`w/jobs`|
|`w/join`||ゲームに参加することを宣言します|`w/join`|
|`w/ready`||ゲームの準備が完了したことを伝えます|`w/ready`|

### 昼の時間に使うコマンド

|Command|Args|Description|Ex.|
|:---|:---|:---|:---|
|`w/vote`|`[Number]`|番号の人に投票します|`w/vote 1`|
|`w/exile`||投票を締め切り、一番投票されている人を追放します|`w/exile`|

### 夜の時間に使うコマンド

|Command|Args|Description|Ex.|
|:---|:---|:---|:---|
|`w/select`|`[Number]`|夜に動作を行うプレイヤーはこれで対象を選択します|`w/select 2`|
