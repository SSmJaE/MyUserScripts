// ==UserScript==
// @name         pbl
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  try to take over the world!
// @author       SSmJaE
// @match        http://39.98.60.4/infoJudge?*
// @match        http://39.98.60.4/infoTeaJudge?*
// @grant        none
// ==/UserScript==

if (/http:\/\/39.98.60.4\/PingGu?.*/.test(location.href)) {
    document.querySelectorAll("table img").forEach((element) => {
        element.click();
    });
} else {
    document.querySelector("table textarea").textContent = "好";
    document.querySelectorAll("table span input:first-child").forEach((element) => element.click());
    document.querySelector(".icon-ok").click();
}
