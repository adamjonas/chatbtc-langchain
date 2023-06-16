import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { filterStackexchangeQuestions, truncate_chat_history } from '@/utils/filter-helper';
// import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { ChainValues } from 'langchain/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  console.log('question', question);

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
    const index = pinecone.Index(PINECONE_INDEX_NAME)!;

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        //namespace: PINECONE_NAME_SPACE, // optional
      },
    );

    const chain = await makeChain(vectorStore);

    // Ask a question using chat history
    const response = await chain.call({
      raw_question: sanitizedQuestion,
      chat_history: truncate_chat_history(history) || [],
    });

    // Get filtered source urls
    const filteredSourceUrls = filterStackexchangeQuestions(
      response.sourceDocuments,
    );

    // Filter out StackExchange questions
    const filteredSourceDocs = response.sourceDocuments.filter((doc: any) =>
      filteredSourceUrls.includes(doc.metadata.url),
    );

    console.log('response', response);
    // TODO:- filter out the responses using filterSourceDocs contained in the
    //  respective source questions

    const {output_text, ...rest} = response
    const renamedResponse = {text: output_text, ...rest}

    res.status(200).json(renamedResponse);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
