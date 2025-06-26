// 素材配置文件
const theme = "FlappyBird";

export const themeConfig = {
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
        frameWidth: 1024,
        frameHeight: 1024,
        totalFrames: 2
    },
    obstacle_top: {
        key: "obstacle_top",
        path: `./assets/${theme}/obstacle-top.png`,
        desc: "顶部障碍物"
    },
    obstacle_bottom: {
        key: "obstacle_bottom",
        path: `./assets/${theme}/obstacle-bottom.png`,
        desc: "底部障碍物"
    },
    bomb: {
        key: "bomb",
        path: `./assets/${theme}/bomb.png`,
        desc: "炸弹"
    }
};

export default themeConfig; 