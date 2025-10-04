import { removeHtmlTags, replaceUmlaute, normalizeTextWithHyphens } from "."

const getUniqueText = (text: string): string => {
    if (!text) return ''
    text = removeHtmlTags(text)
    text = replaceUmlaute(text)
    text = normalizeTextWithHyphens(text)
        .toLowerCase()
        .replaceAll(/&/ig, 'und')
        .replaceAll(/[^a-z0-9-_.]/gi, '')
        .replaceAll(/[-_]+/g, '-')
    return text
}

export { getUniqueText }