const removeHtmlTags = (htmlText: string): string => {
    if (!htmlText) return '';
    const regex = /<\/?[^>]+>/g; // Matches opening and closing tags
    return htmlText.replace(regex, '')
}

export { removeHtmlTags }
