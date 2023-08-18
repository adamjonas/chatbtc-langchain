import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain, LLMChain, MapReduceDocumentsChain, StuffDocumentsChain, loadQARefineChain, loadQAStuffChain } from 'langchain/chains';
import { CallbackManager } from 'langchain/callbacks';
import { PromptTemplate } from 'langchain';
import { QuestionGenCallbackHandler, StreamingCallbackHandler } from './callback-handlers';
import { Server } from 'socket.io';

const CONDENSE_PROMPT = new PromptTemplate({
  inputVariables: ['chat_history', 'question'], 
  template: `Given the following conversation and a follow up question, rephrase the follow up question in context of bitcoin to be a standalone question.
    Chat History:
    {chat_history}
    Follow Up Input: {question}
    Standalone question:`
})

const QA_PROMPT = new PromptTemplate({
  inputVariables: ['context', 'question'],
  template: `You are a helpful AI assistant aimed to provide technical overview and insights on bitcoin, its concepts and its history. Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
    If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

    {context}

    Question: {question}
    Helpful answer in markdown:`
  });

let chain: ConversationalRetrievalQAChain;
let manager: CallbackManager;


export const makeChain = (vectorstore: PineconeStore, k: number, io: Server) => {
  if (chain) return chain;
  manager = new CallbackManager();

  const qaLlm = new OpenAI({
    temperature: 0,
    // modelName: 'gpt-3.5-turbo',
    callbacks: [ new QuestionGenCallbackHandler() ],
  });
  const streamingLlm = new OpenAI({ 
    temperature: 0,
    callbacks: [ new StreamingCallbackHandler(io) ],
    streaming: true,
  });

  const questionGenerator = new LLMChain({
    llm: qaLlm,
    prompt: CONDENSE_PROMPT,
  });
  const streamChain = new LLMChain({
    llm: streamingLlm,
    prompt: QA_PROMPT,
  });

  // const docChain = loadQAStuffChain(streamingLlm, {prompt: QA_PROMPT}) ;
  const stuffDocChain = new StuffDocumentsChain({ llmChain: streamChain })

  chain = new ConversationalRetrievalQAChain({
    retriever: vectorstore.asRetriever(k),
    combineDocumentsChain: stuffDocChain,
    questionGeneratorChain: questionGenerator,
    returnSourceDocuments: true,
  });

  return chain;
};
