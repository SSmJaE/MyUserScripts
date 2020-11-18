// ==UserScript==
// @name         云南省安全生产网络培训学院自动播放脚本
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  自动跳过已完成课程，视频完成后自动切换，不能后台
// @author       SSmJaE
// @match        http://yunan.zayxy.com/chipont/play.html?*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function calculate_real_seconds(string) {
        let [minute, second] = string.split(':');
        return parseInt(minute, 10) * 60 + parseInt(second, 10);
    }

    async function get_time() {
        for (let unit of document.querySelectorAll('#divClassList li div.tags')) {
            let [current, all] = unit.textContent.slice(4).replace(/\s*/, '').split('/');
            console.log(current, all);
            current = calculate_real_seconds(current);
            all = calculate_real_seconds(all);
            console.log(current, all);
            let diff = all - current;
            if (diff) {
                unit.click();
                await sleep((diff + 10) * 1000);
            }
        }
    }

    setTimeout(get_time, 5000);
})();