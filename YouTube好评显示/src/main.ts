function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateRatio(up: number, down: number) {
    if (up <= 0 && down <= 0) {
        return null;
    } else if (up <= 0) {
        return 0;
    } else if (down <= 0) {
        return 100;
    }

    return Math.round((up * 1000) / (up + down)) / 10;
}

function colorRatio(ratio: number): string {
    if (ratio >= 99.0) {
        return "#1070ce";
    } else if (ratio >= 90.0) {
        return "#379a1b";
    } else if (ratio >= 80) {
        return "#bd9109";
    } else {
        return "#cf2000";
    }
}

const DATA_REGEX = /"likeStatus":"[^"]*","tooltip":"([\d,]+) *\/ *([\d,]+)"/;
const FEATURES = {
    READABLE_STREAM: typeof ReadableStream === "function",
    ABORT_CONTOLLER: typeof AbortController === "function",
    TEXT_DECODER: typeof TextDecoder === "function",
};

function parseIntLenient(str: string): number {
    const r = parseInt(str.replace(/[^\d]+/g, ""));
    return isNaN(r) ? 0 : r;
}

/**
 * Inserts a node before a reference node.
 * Credit: https://stackoverflow.com/a/4793630
 *
 * @param newNode
 * @param referenceNode
 */
function insertAfter(newNode: Node, referenceNode: Node) {
    referenceNode.parentNode!.insertBefore(newNode, referenceNode.nextSibling);
}

async function fetchRatio(url: string): Promise<number | null> {
    function tryExtract(str: string): [number, number] | null {
        const match = DATA_REGEX.exec(str);
        if (match === null) return null;
        const up = parseIntLenient(match[1]);
        const down = parseIntLenient(match[2]);
        return [up, down];
    }

    /** Fetch & check data chunk by chunk. */
    async function streamImpl(
        response: Response,
        controller: AbortController,
    ): Promise<number | null> {
        const stream = response.body!.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        while (true) {
            const { value: chunk, done } = await stream.read();
            const decoded = decoder.decode(chunk, { stream: !done });
            buffer += decoded;

            const result = tryExtract(buffer);
            if (result !== null) {
                // We've got everything we want
                controller.abort();
                return calculateRatio(result[0], result[1]);
            }

            if (done) {
                if (buffer.includes('"videoPrimaryInfoRenderer"')) {
                    return null; // sentimentBar disabled
                }
                throw new Error("Unable to locate like/dislike data from the response body");
            }
        }
    }

    async function fallbackImpl(response: Response): Promise<number | null> {
        const text = await response.text();
        const result = tryExtract(text);
        if (result === null) {
            if (text.includes('"videoPrimaryInfoRenderer"')) {
                return null; // sentimentBar disabled
            }
            throw new Error("Unable to locate like/dislike data from the response body");
        }
        return calculateRatio(result[0], result[1]);
    }

    /** @type {RequestInit} */
    const fetchOptions: RequestInit = {
        mode: "same-origin",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        cache: "force-cache",
    };

    // https://caniuse.com/streams
    // https://caniuse.com/textencoder
    // https://caniuse.com/abortcontroller
    if (FEATURES.READABLE_STREAM && FEATURES.ABORT_CONTOLLER && FEATURES.TEXT_DECODER) {
        const controller = new AbortController();
        const response = await fetch(url, {
            signal: controller.signal,
            ...fetchOptions,
        });

        return await streamImpl(response, controller);
    } else {
        const response = await fetch(url, fetchOptions);
        return await fallbackImpl(response);
    }
}

async function processVideos(): Promise<void> {
    for (const link of document.querySelectorAll("#thumbnail[href]:not(.ratio-added)")) {
        if (link.closest("[hidden]") !== null) continue; // Skip hidden

        const line = link.closest("#dismissible")!.querySelector("#metadata-line") as HTMLElement;
        const injectPoint = line.querySelector("span:last-of-type");
        if (injectPoint === null) continue; // Playlists have a empty metadata line

        const ratio = await fetchRatio(link.getAttribute("href") as string);
        if (ratio === null) continue;

        const span = document.createElement("span");
        DOMTokenList.prototype.add.apply(span.classList, injectPoint.classList as any); // Copy class list
        span.textContent = ratio + "%";
        if (USER_SETTINGS.colorfulRatio) {
            span.style.color = colorRatio(ratio);
        }

        link.classList.add("ratio-added");
        insertAfter(span, injectPoint);
        await sleep(USER_SETTINGS.requestInterval);
    }
}

function processMainVideo(): void {
    const buttons = document.querySelector(
        "ytd-video-primary-info-renderer #menu #top-level-buttons:not(.ratio-added)"
    );
    if (buttons === null || buttons.closest("[hidden]") !== null) return;

    const texts = Array.from(buttons.children).map((e) =>
        e.querySelector("#text"),
    ) as HTMLElement[];
    const [up, down, share, ..._rest] = texts;

    const ratio = calculateRatio(
        parseIntLenient(up.getAttribute("aria-label") as string),
        parseIntLenient(down.getAttribute("aria-label") as string),
    );
    if (ratio !== null) share.textContent = ratio + "%";

    if (USER_SETTINGS.hideLikeCount) up.textContent = "";
    if (USER_SETTINGS.hideDislikeCount) down.textContent = "";
    buttons.classList.add("ratio-added");
}

(async (interval) => {
    try {
        while (true) {
            processMainVideo();
            if (USER_SETTINGS.showAllRatios) {
                await processVideos();
            }

            await sleep(interval);
        }
    } catch (err) {
        console.warn("Unexpected error while processing video rating", err);
    }
})(USER_SETTINGS.checkInterval);
