
import { UiohookKey } from "uiohook-napi"

export const uioEventEnum = {
    4: "keydown",
    5: "keyup",
    6: "click",
    7: "mousedown",
    8: "mouseup",
    9: "mousemove",
    11: "mousewheel"
}

export const getKeyByValue = (value) => {
    return Object.keys(UiohookKey).find(key => UiohookKey[key] === value);
}

export const parseSequence = (seq) => {
    let optSeq = []

    let r = 0
    let inputSeq = ''
    while (r < seq.length - 1) {

        if (uioEventEnum[seq[r].type] === 'keydown'
            && uioEventEnum[seq[r + 1].type] === 'keyup' && seq[r + 1].keycode === seq[r].keycode) {

            const parseKey = getKeyByValue(seq[r].keycode)
            if (String(parseKey).length === 1) {
                inputSeq += String(parseKey)
                r += 2
            } else {
                optSeq.push({ type: uioEventEnum[seq[r].type], value: parseKey })
                r += 1
            }

        } else {
            if (inputSeq !== '') {
                optSeq.push({ type: 'input', value: inputSeq })
                inputSeq = ''
            }
            
            if (seq[r].type === "delay") {
                optSeq.push({ type: "delay", value: seq[r].value })
                r++
                continue
            }

            const key = uioEventEnum[seq[r].type]
            if (key === 'click' || key.startsWith('mouse')) {
                let value = { x: seq[r].x, y: seq[r].y, button: seq[r].button, clicks: seq[r].clicks }
                optSeq.push({ type: key, ...value })
            
            } else {
                let value = getKeyByValue(seq[r].keycode)
                optSeq.push({ type: key, value: value })
            }
            r++
        }
    }
    if (inputSeq !== '') {
        optSeq.push({ type: 'input', value: inputSeq })
    }
    // console.log("@@@", optSeq)
    return optSeq
}