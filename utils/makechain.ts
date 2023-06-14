import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import {
  ConversationalRetrievalQAChain,
  LLMChain,
  loadQAMapReduceChain,
  loadSummarizationChain,
  MapReduceDocumentsChain,
  RetrievalQAChain,
} from 'langchain/chains';
import { ChatPromptTemplate } from 'langchain/prompts';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question. The output should NEVER exceed 500 words.
Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`;

export const makeChain = async (
  vectorstore: PineconeStore,
  history: any,
  question: String,
) => {
  const model = new OpenAI({
    temperature: 0, // increase temperature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
    verbose: true,
  });

  let q;
  try {
    const summarization_chain = loadSummarizationChain(model, {
      type: 'map_reduce',
    });
    q = await summarization_chain.call({
      input_documents: history,
      question: question,
      options: { max_tokens: 4000 },
    });
  }
  catch (error: any) {
    q = question
  }

  if (q.text === "There is no information or content provided to summarize.") {
    q.text = question
  }

  const context_chain = loadQAMapReduceChain(model, {verbose: true})
  const chain =  await context_chain.call({ input_documents: vectorstore, question: q });

  return chain
  // const chatPrompt = ChatPromptTemplate.fromPromptMessages()
  // After this, return the normal LLM output with model.

  // return ConversationalRetrievalQAChain.fromLLM(
  //   model,
  //   vectorstore.asRetriever(),
  //   {
  //     qaTemplate: QA_PROMPT,
  //     questionGeneratorChainOptions: {
  //       llm: model,
  //       template: CONDENSE_PROMPT,
  //     },
  //     returnSourceDocuments: true, //The number of source documents returned is 4 by default
  //     verbose: true,
  //   },
  // );
};
