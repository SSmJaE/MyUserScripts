// ==UserScript==
// @name         闽南师范大学疫情防控动态时间
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       SSmJaE
// @match        http://dxg.mnnu.edu.cn/SPCP/Web/PersonActivity/MonitoringCard?*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/dayjs@1.9.6/dayjs.min.js
// ==/UserScript==

/* global dayjs */

const STATUS = [
    {
        selector: "body > div.container > div > div.infos > p:nth-child(2)",
        label: "姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：",
        value: "你的名字",
    },
    {
        selector: "body > div.container > div > div.infos > p:nth-child(3)",
        label: "学&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;号：",
        value: "123456789",
    },
    {
        selector: "body > div.container > div > div.infos > p:nth-child(4)",
        label: "所属学院：",
        value: "商学院",
    },
    {
        selector: "body > div.container > div > div.infos > p:nth-child(5)",
        label: "场地名称：",
        value: "校门",
    },
    {
        selector: "body > div.container > div > div.infos > p:nth-child(6)",
        label: "进出类型：",
        value: "进",
    },
    {
        selector: "body > div.container > div > div.infos > p:nth-child(7)",
        label: "扫描时间：",
        value: () => {
            let currentTime = dayjs().format("YYYY.MM.DD HH:mm");
            console.log(currentTime);
            return currentTime;
        },
    },
];

function changeStatus() {
    for (const status of STATUS) {
        const element = document.querySelector(status.selector);
        const value = typeof status.value === "function" ? status.value() : status.value;
        element.innerHTML = status.label + value;
    }
}

setTimeout(changeStatus, 1000);
