import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { LLMChain, loadQAMapReduceChain, loadQARefineChain, RetrievalQAChain, SequentialChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question in context of bitcoin to be a standalone question.
Chat History:
{chat_history}
Follow Up Input: {raw_question}
Standalone question:`;

const QA_PROMPT = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`;

export const makeChain = async (
  vectorstore: PineconeStore,
) => {
  const summary_model = new OpenAI({
    temperature: 0, // increase temperature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
  });

  const conversation_model = new OpenAI({
    temperature: 0, // increase temperature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
  });

  // Summary Model
  const summary_template = new PromptTemplate({
    template: CONDENSE_PROMPT,
    inputVariables: ['chat_history', 'raw_question'],
  });
  const summary_chain = new LLMChain({ llm: summary_model, prompt: summary_template, outputKey: 'question' });

  const conversation_chain = new RetrievalQAChain({
    combineDocumentsChain: loadQARefineChain(conversation_model),
    retriever: vectorstore.asRetriever(),
    returnSourceDocuments: true,
    inputKey: 'question',
  });

  return new SequentialChain({
    chains: [summary_chain, conversation_chain],
    inputVariables: ['chat_history', 'raw_question'],
    outputVariables: conversation_chain.outputKeys,
    verbose: true,
  });
};
