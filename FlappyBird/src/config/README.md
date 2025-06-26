# 素材主题配置使用说明

## 添加新主题

1. 在 `assets/` 目录下创建新的主题文件夹，例如 `assets/MyNewTheme/`

2. 在新主题文件夹中放入以下素材文件：
   - `background.png` - 游戏背景
   - `player-spritesheet.png` - 玩家精灵图（动画序列）
   - `player.png` - 玩家静态图
   - `obstacle-top.png` - 顶部障碍物
   - `obstacle-bottom.png` - 底部障碍物
   - `bomb.png` - 炸弹

3. 修改 `src/config/AssetsConfig.js` 文件：
   - 修改文件顶部的 `theme` 变量值
   - 根据新素材调整 `player_spritesheet` 的配置




## 修改主题

要切换主题，只需修改 `src/config/AssetsConfig.js` 文件：
   - 修改文件顶部的 `theme` 变量值
   - 根据新素材调整 `player_spritesheet` 的配置


## 示例配置
```javascript
// 修改主题
const theme = "MyNewTheme";

export const assetsConfig = {
    theme: theme,
    background: {
        key: "background",
        path: `./assets/${theme}/background.png`,
        desc: "游戏背景"
    },
    player: {
        key: "player",
        path: `./assets/${theme}/player.png`,
        desc: "玩家静态图"
    },
    player_spritesheet: {
        key: "player_spritesheet",
        path: `./assets/${theme}/player-spritesheet.png`,
        desc: "玩家动态精灵图",
        // 可以根据实际素材调整帧数
        frameWidth: 640,    // 单帧宽度
        frameHeight: 360,   // 单帧高度
        totalFrames: 24     // 总帧数        
    }
    // ... 其他素材配置
};
```