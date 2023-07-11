import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Client } from "@elastic/elasticsearch";
import {
  ElasticClientArgs,
  ElasticVectorSearch,
} from "langchain/vectorstores/elasticsearch";
import { makeChain } from '@/utils/makechain';
import {
  filterStackexchangeQuestions,
  truncate_chat_history,
} from '@/utils/filter-helper';
import {ES_CLOUD_ID, ES_INDEX_NAME, ES_API_KEY} from "@/config/elasticsearch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    const clientArgs : ElasticClientArgs = {
      client: new Client({
        cloud: {id: ES_CLOUD_ID},
        auth: {apiKey: ES_API_KEY},
      }),
      indexName: ES_INDEX_NAME,
    };
    // FIXME:- might need to specify ES engine
    const vectorStore = new ElasticVectorSearch(new OpenAIEmbeddings({}), clientArgs);

    let k = 4;
    while (1) {
      try {
        const chain = makeChain(vectorStore, k);
        const response = await chain.call({
          question: sanitizedQuestion,
          chat_history: truncate_chat_history(history, 4000) || [],
        });
        // // Get filtered source urls
        // const filteredSourceUrls = filterStackexchangeQuestions(
        //   response.sourceDocuments,
        // );
        // // Filter out StackExchange questions
        // const filteredSourceDocs = response.sourceDocuments.filter((doc: any) =>
        //   filteredSourceUrls.includes(doc.metadata.url),
        // );
        // const { sourceDocuments, ...rest } = response;
        // const filteredResponse = {
        //   sourceDocuments: filteredSourceDocs,
        //   ...rest,
        // };

        const { text, ...rest } = response;

        res.status(200).json(text);
        break;
      } catch (e: any) {
        console.log('Error with k: ', k, ' :error: ', e.message);
        if (k == 1) {
          res.status(400).json({ error: e.message || 'Something went wrong' });
          break;
        }
        k--;
      }
    }
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
