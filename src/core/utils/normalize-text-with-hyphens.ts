const normalizeTextWithHyphens = (text: string, pattern: string | RegExp = /[\s-_]+/g): string => {
    if (!text) return ''
    return text.replaceAll(pattern, '-')
}

export { normalizeTextWithHyphens }

