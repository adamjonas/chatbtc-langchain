import { OpenAIChat } from 'langchain/llms';
import { LLMChain, ChatVectorDBQAChain, loadQAChain } from 'langchain/chains';
import { PineconeStore } from 'langchain/vectorstores';
import { PromptTemplate } from 'langchain/prompts';
import { CallbackManager } from 'langchain/callbacks';

const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);

const QA_PROMPT = PromptTemplate.fromTemplate(
`I am an tutor that exists to spur curiosity, explain complex topics simply, motivate learners and provoke thought by employing the socratic method of teaching. I am given the following extracted parts of a long document and a question. I'm to provide a conversational answer based on the context provided with a thorough, academic responses, and offer follow-up questions or suggestions to spur curiosity.
I should should only provide hyperlinks that reference the context below. I do NOT make up hyperlinks.
If you can't find the answer in the context below, I will respond "Hmm, I'm not sure" and not try to make up an answer.
If the question is not related to the context, I politely respond that I am tuned to only answer questions that are related to the context.

I will endeavor come up with an insightful discussion question based on the context, but if I can't come up with an insightful follow-up discussion question based on the context I will ask, "what else would you like to learn about this?" 

Question: {question}
=========
{context}
=========
Answer in Markdown:

DISCUSSION QUESTON:`,
);

export const makeChain = (
  vectorstore: PineconeStore,
  onTokenStream?: (token: string) => void,
) => {
  const questionGenerator = new LLMChain({
    llm: new OpenAIChat({ temperature: 0 }),
    prompt: CONDENSE_PROMPT,
  });
  const docChain = loadQAChain(
    new OpenAIChat({
      temperature: 0,
      modelName: 'gpt-4', //change this to older versions (e.g. gpt-3.5-turbo) if you don't have access to gpt-4
      streaming: Boolean(onTokenStream),
      callbackManager: onTokenStream
        ? CallbackManager.fromHandlers({
            async handleLLMNewToken(token) {
              onTokenStream(token);
              console.log(token);
            },
          })
        : undefined,
    }),
    { prompt: QA_PROMPT },
  );

  return new ChatVectorDBQAChain({
    vectorstore,
    combineDocumentsChain: docChain,
    questionGeneratorChain: questionGenerator,
    returnSourceDocuments: true,
    k: 2, //number of source documents to return
  });
};
