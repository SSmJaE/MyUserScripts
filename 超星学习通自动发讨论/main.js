// ==UserScript==
// @name         学习通自动发讨论
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  从当前所有回复中随机选取一条发布；当前回复中有自己的回复的话，不会二次发布
// @author       SSmJaE
// @match        https://mooc1-1.chaoxing.com/bbscircle/gettopicdetail?*
// @license      GPL-3.0
// @compatible   chrome
// ==/UserScript==

const BLACKLIST = [
    '刷分',
];

if (location.href.includes('order=1')) { //已经是时间倒序
    let hasReplied = false;
    for (let nameSpan of document.querySelectorAll(' div > div.oneTop > p > span')) {
        if (nameSpan.textContent == "你的名字")
            hasReplied = true;
    }

    if (!hasReplied) {
        let answers = [];//获取前n个回答，随机选取一个作为答案
        for (let answerElement of document.querySelectorAll('div.fr.secondRight h3')) {
            let text = answerElement.textContent;
            if (!BLACKLIST.includes(text))
                answers.push(text);
        }
        let index = Math.floor(Math.random() * answers.length);

        //再模拟填入
        document.querySelector('[id^=reply_count] > i').click();
        let textarea = document.querySelector("div.hfpl.clearfix textarea");
        textarea.click();
        textarea.value = answers[index];
        textarea.nextElementSibling.click();
    }
} else { //先时间倒序，看看有没有自己发布的回复
    document.querySelector('div div div div p a.dx.fr').click();
}
