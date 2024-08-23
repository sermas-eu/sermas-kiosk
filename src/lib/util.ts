
const getLanguage = (language?: string)  => {
    if (!language)  {
        if (typeof navigator !== 'undefined') {
            language = navigator.language
        }
        language = language || 'en'
    }
    return language
}

export const toDate = (date: Date|string, language?: string)  => {
    language = getLanguage(language)
    return new Intl.DateTimeFormat(language, {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(date));
}

export const toTime = (date: Date|string, language?: string)  => {
    language = getLanguage(language)
    return new Intl.DateTimeFormat(language, {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    }).format(new Date(date));
}

export const toDateTime = (date: Date|string, language?: string)  => `${toDate(date, language)} ${toTime(date, language)}`