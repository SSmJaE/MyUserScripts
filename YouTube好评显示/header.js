// ==UserScript==
// @name            显示YouTube好评/差评比例(好评占比)
// @name:en         yet another simple YouTube video likes/dislikes ratio display
// @namespace       https://github.com/SSmJaE
// @version         0.7.0
// @description     治好了我每次看到好评和差评时都忍不住心算一下好评占比的强迫症
// @description:en  Show likes/dislikes ratio of YouTube video.
// @author          SSmJaE
// @author          andylizi
// @icon            https://www.youtube.com/s/desktop/07288e99/img/favicon_32.png
// @icon64          https://www.youtube.com/s/desktop/07288e99/img/favicon_96.png
// @match           https://www.youtube.com/*
// @run-at          document-body
// @license         GPL-3.0
// ==/UserScript==

const USER_SETTINGS = {
    // 多久检查一次是否有新的视频 (毫秒)
    // Time between checks for new video, in ms
    checkInterval: 5000,

    // 两次查询之间间隔多久 (毫秒). 太短可能会被封IP
    // Time between two requests in ms. Too short run the risk of IP being banned.
    requestInterval: 500,

    // 是否显示所有视频的好评率. 如果关闭, 只显示当前适配的好评率
    // Whether to show all videos' ratios or just the current one
    showAllRatios: true,

    // 是否显示彩色好评率. 关闭显示灰色
    // Whether to color-code the ratios
    /**
     * >= 99%    -> Blue
     * 90% ~ 99% -> Green
     * 80% ~ 90% -> Yellow
     * < 80%     -> Red
     */
    colorfulRatio: true,

    // 是否隐藏喜欢的具体数量
    // Hide the number on the like button
    hideLikeCount: false,

    // 是否隐藏不喜欢的具体数量
    // Hide the number on the dislike button
    hideDislikeCount: false,
};
