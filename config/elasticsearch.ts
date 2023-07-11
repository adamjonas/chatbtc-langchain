/**
 * Elasticsearch config
 */

if (!process.env.ES_INDEX_NAME) {
  throw new Error('Missing Elasticsearch index name in .env file');
}
const ES_INDEX_NAME = process.env.ES_INDEX_NAME ?? '';

if (!process.env.ES_CLOUD_ID) {
  throw new Error('Missing Elasticsearch cloud id in .env file');
}
const ES_CLOUD_ID = process.env.ES_CLOUD_ID ?? '';

if (!process.env.ES_API_KEY) {
  throw new Error('Missing Elasticsearch API key in .env file');
}
const ES_API_KEY = process.env.ES_API_KEY ?? '';


export { ES_INDEX_NAME, ES_CLOUD_ID , ES_API_KEY};
