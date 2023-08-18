import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';
import { VectorOperationsApi } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';


if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
  throw new Error('Pinecone environment or api key vars missing');
}

let index: VectorOperationsApi;
let vectorStore: PineconeStore;
let pineconeClient: PineconeClient;


export async function initPinecone() {
  if (vectorStore) return {pinecone: pineconeClient, index: index, vectorStore: vectorStore};
  pineconeClient = await getPinecone();
  index = await getIndex(pineconeClient);
  vectorStore = await getVectorStore(index);
  return {pinecone: pineconeClient, index: index, vectorStore: vectorStore};
}

async function getPinecone(): Promise<PineconeClient> {
  if (pineconeClient) return pineconeClient;
  try {
    const client = new PineconeClient();
    await client.init({
      environment: process.env.PINECONE_ENVIRONMENT ?? '', //this is in the dashboard
      apiKey: process.env.PINECONE_API_KEY ?? '',
    });
    return client

  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to initialize Pinecone Client');
  }
}

async function getIndex(pinecone: PineconeClient): Promise<VectorOperationsApi> {
  if (index) return index;
  return pinecone.Index(PINECONE_INDEX_NAME);
}

async function getVectorStore(index: VectorOperationsApi): Promise<PineconeStore> { 
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({}),
    {
      pineconeIndex: index,
      textKey: 'text',
      //namespace: PINECONE_NAME_SPACE, // optional
    });
  return vectorStore;
}
