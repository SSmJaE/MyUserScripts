// ==UserScript==
// @name         U校园时长专门
// @namespace    http://tampermonkey.net/
// @version      0.2.2
// @description  一个简单、自动、定时切换页面的小工具，方便刷时长
// @author       SSmJaE
// @match        https://ucontent.unipus.cn/_pc_default/pc.html?cid=*
// @grant        none
// @license      MIT
// @compatible   chrome
// ==/UserScript==
const USER_SETTINGS = {
    switchInterval: 5,      //单位分钟，多久切换一次页面
    randomInterval: true,   //是否使用随机切换间隔，随机数小于switchInterval，大于等于一半
    switchLevel: 3,         //1，逐单元切换；2，逐版块切换；3，逐练习切换
    loop: true,             //所有单元过完，是否重头开始
}

function auto_next(selector, classFlag) {
    let flag = false
    for (let unit of document.querySelectorAll(selector)) {
        if (flag) {
            unit.click();
            flag = false;
        }
        if (unit.classList.contains(classFlag)) flag = true;
    }
}

function generate_interval() {
    let rate = 1;
    if (USER_SETTINGS.randomInterval) {
        rate = Math.random();
        if (rate < 0.5) rate = 0.5;
    }

    return USER_SETTINGS.switchInterval * rate * 60 * 1000;
}

setInterval(() => {
    switch (USER_SETTINGS.switchLevel) {
        case 3:
            auto_next('.layoutHeaderStyle--circleTabsBox-jQdMo a', 'selected');
        case 2:
            auto_next('#header .TabsBox li', 'active');
        case 1:
            auto_next('#sidemenu li.group', 'active');
        default:
            if (USER_SETTINGS.loop)
                document.querySelector('#sidemenu li.group').click();
    }
}, generate_interval());

setTimeout(() => {
    try {
        document.querySelector("div.dialog-header-pc--dialog-header-2qsXD")
            .parentElement.querySelector('button').click()
    } catch (e) { }
}, 5000);
