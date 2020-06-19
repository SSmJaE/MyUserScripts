// ==UserScript==
// @name         U校园答案++(改)
// @namespace    http://tampermonkey.net/
// @version      5.1.1
// @description  自动答题功能修复
// @author       SSmJaE
// @license      GPL-3.0
// @compatible   Chrome
// @compatible   Firefox
// @match        *://ucontent.unipus.cn/_pc_default/pc.html?*
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js
// @require      https://code.jquery.com/jquery-3.5.0.min.js
// @run-at       document-start
// ==/UserScript==
/*global GM_getValue, GM_setValue, $, unsafeWindow, GM_addStyle, CryptoJS*/
(function () {
    'use strict';
    /*UI---------------------------------------------------------------------------------------------------*/
    let auto = GM_getValue('auto', true)
        , randomMin = GM_getValue('randomMin', 1000)
        , randomMax = GM_getValue('randomMax', 8000);

    var container;
    function create_container() {
        container = document.createElement('div');
        container.id = "container";
        container.innerHTML = ` <div id="container-title">答案++</div>
                                <div id="container-content"></div>
                                <div id="container-config">
                                    <div class="config-row">
                                        <label for="auto">自动填题</label>
                                        <label class="switch">
                                            <input id="auto" type="checkbox">
                                            <span class="slider"></span>
                                        </label>
                                    </div>
                                    <div class="config-row">
                                        <label for="randomMin">延迟下限</label>
                                        <input id="randomMin" type="text" >
                                    </div>
                                    <div class="config-row">
                                        <label for="randomMax">延迟上限</label>
                                        <input id="randomMax" type="text" >
                                    </div>
                                    <div class="config-row">
                                        <button id="setting-save" type="button">Save</button>
                                    </div>
                                </div>`;

        if (!document.querySelector('#container')) {
            document.body.appendChild(container);
        }

        GM_addStyle(`
            #container {
                top: 100px;
                left: 100px;
                margin: 0 auto;
                z-index: 1024;
                border-radius: 4px;
                box-shadow: 0 11px 15px -7px rgba(0, 0, 0, .2), 0 24px 38px 3px rgba(0, 0, 0, .14), 0 9px 46px 8px rgba(0, 0, 0, .12);
                position: absolute;
                background: #fff;
                width: 250px;
                max-height: 800px;
                min-height: 150px;
                font-size: medium;
            }

            #container-title {
                background: inherit;
                height: 25px;
                margin-top: 10px;
                text-align: center;
                font-size: x-large;
                cursor: move;
            }

            #container-content {
                margin: 10px;
                color: orange;
                overflow-y: auto;
                max-height: 575px
            }

            #container-config {
                display: table;
                margin: 20px 50px;
                color: orange;
            }

            #container-config .config-row input {
                display: table-cell;
                width: 50px;
            }

            /* 滑块-------------------------------------------------------------------- */
            @keyframes slide_to_right {
                0% {
                    width: 36px;
                }

                70% {
                    left: 29px;
                }

                80% {
                    border-radius: 10px;
                }

                100% {
                    left: 26px;
                }
            }

            @keyframes slide_to_left {
                0% {
                    width: 36px;
                }

                70% {
                    left: -2px;
                }

                80% {
                    border-radius: 10px;
                }

                100% {
                    left: 1px;
                }
            }

            @keyframes widen_to_right {
                100% {
                    width: 36px;
                }
            }

            @keyframes widen_to_left {
                0% {
                    left: 26px;
                }

                100% {
                    left: 13px;
                    width: 36px;
                }
            }

            /* 限定label标签属性，也就是checkbox的包装器 */
            #container-config .switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 25px;
                margin: 2px 5px;
                border: black 1px solid;
                border-radius: 38px;
            }

            /* 不显示checkbox本身，通过点击外部的label实现点击input的效果 */
            #container-config .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            /* 未选中，滑条效果 */
            #container-config .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                transition: .4s;
                border-radius: 38px;
                background-color: rgb(251, 251, 251);
            }

            /* 未选中，点击时滑条效果 */
            #container-config input:not(:checked):active+.slider {
                background-color: rgb(187, 187, 187);
            }

            /* 选中时，滑条效果 */
            #container-config input:checked+.slider {
                background-color: #2196F3;
            }

            /* 滑块是通过before插入的，并没有在DOM中加入代表滑块的元素 */
            #container-config .slider:before {
                position: absolute;
                content: "";
                height: 23px;
                width: 23px;
                left: 1px;
                bottom: 1px;
                background-color: white;
                box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 0 rgba(0, 0, 0, 0.08);
                border-radius: 50%;
            }

            /* 未选中，点击时滑块效果 */
            #container-config input:active+.slider:before {
                border-radius: 38px;
                animation-name: widen_to_right;
                animation-duration: 0.2s;
                animation-fill-mode: forwards;
            }

            /* 右移效果 */
            #container-config input:checked+.slider:before {
                animation-name: slide_to_right;
                animation-duration: .4s;
                animation-fill-mode: forwards;
            }

            /* 已选中，点击时滑块效果 */
            #container-config input:checked:active+.slider:before {
                animation-name: widen_to_left;
                animation-duration: 0.2s;
                animation-fill-mode: forwards;
            }

            /* 左移效果 */
            #container-config input:not(:checked):not(:active)+.slider:before {
                left: 1px;
                animation-name: slide_to_left;
                animation-duration: .4s;
                animation-fill-mode: forwards;
            }`);

        document.querySelector("#auto").checked = auto;
        document.querySelector("#randomMin").value = randomMin;
        document.querySelector("#randomMax").value = randomMax;

        document.querySelector("#setting-save").addEventListener("click", function () {
            GM_setValue('auto', document.querySelector("#auto").checked);
            GM_setValue('randomMin', Number(document.querySelector("#randomMin").value));
            GM_setValue('randomMax', Number(document.querySelector("#randomMax").value));
            location.reload(true);
        });
    }

    /**实现拖动功能*/
    function make_draggable(handle, container) {
        function get_css(ele, prop) {
            return parseInt(window.getComputedStyle(ele)[prop]);
        }

        let initX, initY,
            draggable = false,
            containerLeft = get_css(container, "left"),
            containerRight = get_css(container, "top");

        handle.addEventListener("mousedown", e => {
            draggable = true;
            initX = e.clientX;
            initY = e.clientY;
        }, false);

        document.addEventListener("mousemove", e => {
            if (draggable === true) {
                var nowX = e.clientX,
                    nowY = e.clientY,
                    disX = nowX - initX,
                    disY = nowY - initY;
                container.style.left = containerLeft + disX + "px";
                container.style.top = containerRight + disY + "px";
            }
        });

        handle.addEventListener("mouseup", () => {
            draggable = false;
            containerLeft = get_css(container, "left");
            containerRight = get_css(container, "top");
        }, false);
    }

    function add_to_container(string) {
        document.querySelector('#container-content').textContent = string;
    }

    /*答案---------------------------------------------------------------------------------------------------*/
    function generate_random_float() {
        return Math.floor(Math.random() * (randomMax - randomMin)) + randomMin;
    }

    function solveInput(dom, st) {
        $(dom).trigger('click').trigger('focus').trigger('keydown').trigger('input');
        if (/input/i.test(dom.tagName)) {
            var setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setValue.call(dom, st);
            var e = new Event('input', { bubbles: true });
            dom.dispatchEvent(e);
        } else {
            var evt = new InputEvent('input', {
                inputType: 'insertText',
                data: st,
                dataTransfer: null,
                isComposing: false
            });
            dom.value = st;
            dom.dispatchEvent(evt);
        }
        $(dom).trigger('keyup').trigger('change').trigger('blur');
    }

    function solveCheckbox(dom) {
        if (!dom.checked) dom.click();
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const knownQuestionKeys = [
        "questions:shortanswer",//大填空（长篇
        "shortanswer:shortanswer",
        "questions:scoopquestions",//小填空
        "questions:sequence",//排序
        "questions:questions",//选择（多选、单选）、也可能是填空题目
        "questions:scoopselection",//下拉
        "questions:textmatch",//大意填空（长篇
        "questions:bankedcloze"//单填空，视听说选填A-E
    ];

    const questionSelectors = [
        'input[name^="single-"]',//1单选
        'input[class^="MultipleChoice--checkbox-"]',//2多选
        'input[class^="fill-blank--bc-input"]',//3小填空
        'textarea[class^="writing--textarea"]',//4大填空（式1）
        'div[class^="cloze-text-pc--fill-blank"]',//5大意填空（text match）
        'input[class^="cloze-text-pc--bc-input"]'//6单填空
    ];

    function parseJson(json) {
        if (json) {
            let r = json.content.slice(7)
                , o = CryptoJS.enc.Utf8.parse("1a2b3c4d" + json.k)
                , i = CryptoJS.enc.Hex.parse(r)
                , a = CryptoJS.enc.Base64.stringify(i)
                , contentJson = JSON.parse(CryptoJS.AES.decrypt(a, o, {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.ZeroPadding
                }).toString(CryptoJS.enc.Utf8));
            json = contentJson;
            console.log(json);
            create_container();
            make_draggable(document.querySelector('#container-title'), container);
        }
        return json;
    }

    async function answerAnalyse(json) {
        let answerNetType = 0, //json内定义的题目类型
            answerSheetType = 0,
            key = Object.keys(json)[0],
            questionBase = json[key],
            formatAnswers = '',
            stringAnswers = '';

        answerNetType = knownQuestionKeys.indexOf(key) + 1;//从1开始计算
        for (let [index, selector] of questionSelectors.entries()) {
            if (document.querySelectorAll(selector).length) {
                answerSheetType = index + 1;//从1开始计算
                break;//实际上的题目类型
            }
        }
        console.log('answerSheetType:' + answerSheetType + '  answerNetType:' + answerNetType);

        //答案提取与自动答题
        switch (answerSheetType) {
            case 1:
                if (answerNetType == 5) {//真单选
                    formatAnswers = questionBase.questions.map(question => question.answers[0].replace(' ', ''));
                    if (auto) {
                        for (let index in formatAnswers) {
                            await sleep(generate_random_float());
                            solveCheckbox(document.getElementsByName("single-" + (Number(index) + 1))[formatAnswers[index].toUpperCase().charCodeAt() - 65]);
                        }
                    }
                }
                break;
            case 2:
                if (answerNetType == 5) {//多选
                    formatAnswers = questionBase.questions.map(question => question.answers);
                    if (auto) {
                        for (let queIndex in formatAnswers) {
                            for (let index in formatAnswers[queIndex]) {
                                await sleep(generate_random_float());
                                solveCheckbox(document.getElementsByName("multichoice-" + (Number(queIndex) + 1))[formatAnswers[queIndex][index].charCodeAt() - 65]);
                            }
                        }
                    }
                }
                break;
            case 3:
                if (answerNetType == 5) {//假单选，真填空
                    formatAnswers = questionBase.questions.map(question => question.answers[0]);
                    if (auto) {
                        let e = document.querySelectorAll('input[class^="fill-blank--bc-input"]');
                        for (let index in formatAnswers) {
                            await sleep(generate_random_float());
                            solveInput(e[index], formatAnswers[index]);
                        }
                    }
                }
                else if (answerNetType == 3) {//真填空
                    formatAnswers = questionBase.questions.map(question => question.answers.join(" | "));
                    if (auto) {
                        let e = document.querySelectorAll('input[class^="fill-blank--bc-input"]');
                        for (let index in formatAnswers) {
                            await sleep(generate_random_float());
                            solveInput(e[index], formatAnswers[index].match(new RegExp("^.+?(?= \\||$)", "gm"))[0]);
                        }
                    }
                }
                break;
            case 4://大填空，会闪
                formatAnswers = questionBase.questions.map(question => {
                    // console.log(question.analysis.html)
                    let answer = question.analysis.html;
                    if (!answer.length) answer = questionBase.analysis.html;
                    return answer.replace(/<(.+?)>/gm, '').replace(/&.{1,6}?;/gm, '').replace(/^\d\.\s*/, '');
                });

                if (auto) {
                    let e = document.querySelectorAll('textarea[class^="writing--textarea"]');
                    for (let index in formatAnswers) {
                        await sleep(generate_random_float());
                        solveInput(e[index], formatAnswers[index]);
                    }
                }

                break;
            case 5:
                if (answerNetType == 7) {//大意填空
                    formatAnswers = questionBase.questions.map(question => question.answer.replace(' ', ''));
                    let e = document.querySelectorAll('div[class^="cloze-text-pc--fill-blank"]');
                    if (auto) {
                        for (let index in formatAnswers) {
                            await sleep(generate_random_float());
                            solveInput(e[index].firstElementChild, formatAnswers[index]);
                        }
                    }
                }
                break;
            case 6:
                if (answerNetType == 8) {//单填空
                    formatAnswers = questionBase.questions.map(question => question.answer.replace(' ', ''));
                    let e = document.querySelectorAll('input[class^="cloze-text-pc--bc-input"]');
                    if (auto) {
                        for (let index in formatAnswers) {
                            await sleep(generate_random_float());
                            solveInput(e[index], formatAnswers[index]);
                        }
                    }
                }
                break;
            default:
                switch (answerNetType) {
                    case 2://没遇到过
                        break;
                    case 4://排序，忘了哪里的了answerSheetType为默认，这个自动不了
                        formatAnswers = questionBase.questions.map(question => question.answer);
                        break;
                    case 6://下拉，同上
                        formatAnswers = questionBase.questions.map(question => question.answers[0]);
                        break;
                }
        }
        try {
            stringAnswers = formatAnswers.join(", ");
            add_to_container(stringAnswers);
        } catch (error) { console.log(error); }
    }

    let window = unsafeWindow;
    const realFetch = window.fetch;
    window.fetch = (url, init = null) => realFetch(url, init).then(response => {
        if (/.*\/course\/api\/v3\/content\//.test(url)) {
            let res = response.clone();
            res.json().then(json => {
                setTimeout(() => {
                    answerAnalyse(parseJson(json));
                }, 1000);//等待页面加载完，因为要确定answerSheetType
            });
        }
        return response;
    });
})();
