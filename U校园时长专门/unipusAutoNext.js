// ==UserScript==
// @name         U校园时长专门
// @namespace    http://tampermonkey.net/
// @version      0.3.0
// @description  一个简单、自动、定时切换页面的小工具，方便刷时长
// @author       SSmJaE
// @match        https://ucontent.unipus.cn/_pc_default/pc.html?cid=*
// @grant        none
// @compatible   chrome
// @license      GPL-3.0
// ==/UserScript==
const USER_SETTINGS = {
    switchInterval: 5,      //单位分钟，多久切换一次页面
    randomInterval: true,   //是否使用随机切换间隔，随机数小于switchInterval，大于等于其一半
    switchLevel: 3,         //1，逐章节(chapter)切换；2，逐版块(section)切换；3，逐练习(tab)切换
    loop: true,             //所有单元过完，是否重头开始
    range: true,            //仅当开启range时，才能循环指定范围；同时开启loop和range，可以循环刷指定单元
    rangeStart: 1,          //此区间是闭区间，[3，5]即从第三单元的第一章刷至第五单元的最后一章
    rangeEnd: 8,            //end是终止单元(unit，1-8)，不要小于rangeStart，可以等于，如果等于，如[3,3]，则只刷第三单元
};

let startUnitIndex = (USER_SETTINGS.rangeStart - 1) * 6;
let endUnitIndex = USER_SETTINGS.rangeEnd * 6 - 1;
let startUnit;
function get_startUnit() {
    for (let [index, unit] of document.querySelectorAll('#sidemenu li.group').entries()) {
        if (index == startUnitIndex) startUnit = unit;
    }
}

function auto_next(selector, classFlag, switchLevel) {
    let flag = false;
    for (let [index, unit] of document.querySelectorAll(selector).entries()) {
        if (flag) {
            unit.click();
            flag = false;
            break;
        }
        if (unit.classList.contains(classFlag)) {
            flag = true;
            if (USER_SETTINGS.range)
                if (switchLevel == 1) {
                    if ((index < startUnitIndex)) {//跳转至开始单元
                        startUnit.click();
                        break;
                    }
                    if (index >= endUnitIndex) {
                        if (USER_SETTINGS.loop) {
                            startUnit.click();
                            break;
                        }
                    }
                }
        }
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

function recur() {
    setTimeout(() => {
        switch (USER_SETTINGS.switchLevel) {
            case 3:
                auto_next('.layoutHeaderStyle--circleTabsBox-jQdMo a', 'selected', 3);
            // fall through
            case 2:
                auto_next('#header .TabsBox li', 'active', 2);
            // fall through
            case 1:
                auto_next('#sidemenu li.group', 'active', 1);
            // fall through
            default:
                if (USER_SETTINGS.loop)
                    document.querySelector('#sidemenu li.group').click();
        }
        recur();
    }, generate_interval());
}

setTimeout(recur, generate_interval());
setTimeout(() => {
    get_startUnit();
    try {
        document.querySelector("div.dialog-header-pc--dialog-header-2qsXD")
            .parentElement.querySelector('button').click();
    } catch (e) { }
}, 5000);
