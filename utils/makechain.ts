import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { ContextualCompressionRetriever } from 'langchain/retrievers/contextual_compression';
import { LLMChainExtractor } from 'langchain/retrievers/document_compressors/chain_extract';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question in context of bitcoin to be a standalone question.
Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `You are a helpful AI assistant aimed to provide technical overview and insights on bitcoin, its concepts and its history. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`;

export const makeChain = (vectorstore: PineconeStore, k: number) => {
  const model = new OpenAI({
    temperature: 0,
    modelName: 'gpt-3.5-turbo',
  });
  const baseCompressor = LLMChainExtractor.fromLLM(model);
  const retriever = new ContextualCompressionRetriever({
    baseCompressor,
    baseRetriever: vectorstore.asRetriever(k),
  });

  return ConversationalRetrievalQAChain.fromLLM(model, retriever, {
    qaTemplate: QA_PROMPT,
    questionGeneratorChainOptions: {
      llm: model,
      template: CONDENSE_PROMPT,
    },
    // returnSourceDocuments: true, //The number of source documents returned is 4 by default
    verbose: true,
  });
};
