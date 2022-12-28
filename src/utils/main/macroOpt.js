const CharTable = {
    11: '0',
    2: '1',
    3: '2',
    4: '3',
    5: '4',
    6: '5',
    7: '6',
    8: '7',
    9: '8',
    10: '9',
    30: 'a',
    48: 'b',
    46: 'c',
    32: 'd',
    18: 'e',
    33: 'f',
    34: 'g',
    35: 'h',
    23: 'i',
    36: 'j',
    37: 'k',
    38: 'l',
    50: 'm',
    49: 'n',
    24: 'o',
    25: 'p',
    16: 'q',
    19: 'r',
    31: 's',
    20: 't',
    22: 'u',
    47: 'v',
    17: 'w',
    45: 'x',
    21: 'y',
    44: 'z',
}

export const optimizeMacroSeq = (config, seq) => {
    let keyNum = config['start'].split('+').length
    if (config['track'].includes('delay')) {
        keyNum *= 2
        // Only when "delay" is not tracked, we can merge keydown/ups into a string
        return seq.slice(keyNum, -1 * keyNum)
    } else {
        let optSeq = []
        let r = keyNum
        let inputSeq = ''
        while (r < seq.length - keyNum - 1) {
            if (seq[r].type === 'keydown'
                && seq[r + 1].type === 'keyup' && seq[r + 1].key === seq[r].key) {
                    if (seq[r].key in CharTable) {
                        inputSeq += CharTable[seq[r].key]
                        r += 2
                    } else {
                        optSeq.push(seq[r])
                        r += 1
                    }
            } else {
                if (inputSeq !== '') {
                    optSeq.push({ type: 'input', value: inputSeq })
                    inputSeq = ''
                }
                optSeq.push(seq[r])
                r++
            }
        }
        if (inputSeq !== '') {
            optSeq.push({ type: 'input', value: inputSeq })
        }
        return optSeq
    }
}