import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import {
  LLMChain,
  loadQAMapReduceChain,
  loadQARefineChain,
  RetrievalQAChain,
  SequentialChain,
  VectorDBQAChain,
} from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { flushAndExit } from 'next/dist/telemetry/flush-and-exit';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question in context of bitcoin to be a standalone question.
Chat History:
{chat_history}
Follow Up Input: {raw_question}
Standalone question:`;

export const makeChain = async (
  vectorstore: PineconeStore,
  k: number
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
  const summary_chain = new LLMChain({ llm: summary_model, prompt: summary_template, outputKey: 'query'});


  const conversation_chain = VectorDBQAChain.fromLLM(conversation_model, vectorstore, {
    k,
    returnSourceDocuments: true
  })
  return new SequentialChain({
    chains: [summary_chain, conversation_chain],
    inputVariables: ['chat_history', 'raw_question'],
    outputVariables: conversation_chain.outputKeys,
    verbose: true,
  });
};
