/**
 * Change the index and namespace to your own
 */

if (!process.env.PINECONE_INDEX_NAME) {
    throw new Error('Pinecone index name not set');
  }

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

// const PINECONE_NAME_SPACE = 'pdf-test'; //namespace is optional for your vectors

// export { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE };
export { PINECONE_INDEX_NAME};
