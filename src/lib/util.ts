import DOMPurify from "dompurify";
import { marked } from "marked";

export const renderMarkdown = async (text: string) => {
  return DOMPurify.sanitize(await marked.parse(text));
};

const getLanguage = (language?: string) => {
  if (!language) {
    if (typeof navigator !== "undefined") {
      language = navigator.language;
    }
    language = language || "en";
  }
  return language;
};

export const toDate = (date: Date | string, language?: string) => {
  language = getLanguage(language);
  return new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export const toTime = (date: Date | string, language?: string) => {
  language = getLanguage(language);
  return new Intl.DateTimeFormat(language, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date(date));
};

export const toDateTime = (date: Date | string, language?: string) =>
  `${toDate(date, language)} ${toTime(date, language)}`;

export const toBase64 = (blob: Blob): Promise<string> => {
  const fileReaderInstance = new FileReader();
  fileReaderInstance.readAsDataURL(blob);
  return new Promise((resolve, reject) => {
    let done = false;
    fileReaderInstance.onload = () => {
      if (done) return;
      done = true;
      resolve(fileReaderInstance.result as string);
    };
    fileReaderInstance.onerror = (err) => {
      if (done) return;
      done = true;
      reject(err);
    };
  });
};

export const deepCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
}