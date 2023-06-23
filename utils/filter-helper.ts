export const stackExchangeFilter = (sourceDocUrl: string) => {
  const stackExchangeRegex = /https?:\/\/(?:[\w-]+\.)?stackexchange\.com\//i;
  return !stackExchangeRegex.test(sourceDocUrl);
};

const getSourceUrlandType = (sourceDocuments: { [key: string]: any }[]) => {
  // Map over the source documens to get their url and type
  let sourceUrlandType: { [key: string]: string } = {};
  for (let i = 0; i < sourceDocuments.length; i++) {
    let sourceUrl = sourceDocuments[i].metadata.url;
    if (!sourceUrlandType[sourceUrl]) {
      sourceUrlandType[sourceUrl] = sourceDocuments[i].metadata.type;
    }
  }
  return sourceUrlandType;
};

export const filterStackexchangeQuestions = (
  sourceDocuments: { [key: string]: any }[],
) => {
  let sourceObj = getSourceUrlandType(sourceDocuments);
  let filteredUrls: Array<string> = [];
  for (const [url, type] of Object.entries(sourceObj)) {
    if (url.includes('stackexchange.com') && type === 'question') {
      continue;
    }
    filteredUrls.push(url);
  }
  return filteredUrls;
};

export const truncate_chat_history = (
  chat_history: [string, string][],
  token_limit: number,
) => {
  if (chat_history.length == 0) return [];
  let result = '';

  for (const [question, answer] of chat_history.reverse()) {
    // Keep the latest context
    const newString = `Human: ${question}\nAssistant: ${answer}\n`;
    if (result.length + newString.length > token_limit - 250) {
      break;
    }
    result += newString;
  }

  return result;
};
