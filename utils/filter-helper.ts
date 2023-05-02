export const stackExchangeFilter = (sourceDocUrl: string) => {
    const stackExchangeRegex = /https?:\/\/(?:[\w-]+\.)?stackexchange\.com\//i;
    return !stackExchangeRegex.test(sourceDocUrl);
}

export const getFilteredSourceUrls = (sourceDocuments: Array<string>) => {
  // Map over the source documents to get their url
    let docUrls = sourceDocuments.map((doc: any) => doc.metadata.url)

    let filteredSourceUrls: Array<string> = [];

    // Loop over the source url array, filter and return a new array of
    // source urls without the stackexchange url
    for (let i = 0; i <= docUrls.length - 1; i++) {
      let checkUrl = stackExchangeFilter(docUrls[i]);
      if (checkUrl) {
        filteredSourceUrls.push(docUrls[i]);
      }
    }
    return filteredSourceUrls;
}