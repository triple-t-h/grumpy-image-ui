const replaceUmlaute = (text: string): string => {
    if (!text) return ''
    const umlautMap: { [key: string]: string } = {
        'ä': 'ae', 'ö': 'oe', 'ü': 'ue',
        'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue',
        'ß': 'ss'
    }
    return text.split('').map(char => umlautMap[char] || char).join('')
}

export { replaceUmlaute }
