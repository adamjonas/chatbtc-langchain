import { BaseCallbackHandler } from "langchain/callbacks";
import { AgentAction, AgentFinish, ChainValues, LLMResult } from "langchain/schema";
import { Serialized } from "langchain/load/serializable";
import { Server } from "socket.io";

export class QuestionGenCallbackHandler extends BaseCallbackHandler {
  name = "QuestionGenCallbackHandler";
  async handleLLMStart(llm: Serialized, prompts: string[], runId: string, parentRunId?: string | undefined, extraParams?: Record<string, unknown> | undefined, tags?: string[] | undefined): Promise<void> {
    console.log("We're starting a new LLM run!");
    return;
  }
}
export class StreamingCallbackHandler extends BaseCallbackHandler {

  name = "StreamingCallbackHandler";
  streamedResponse = "";
  io: Server;
  constructor(io: Server) {
    super();
    this.io = io;
  };
  async handleLLMNewToken(token: string, runId: string, parentRunId?: string | undefined): Promise<void> {
    this.streamedResponse += token;

    // Sends the received tokens in realtime to the client
    await this.io.emit('token-received', token);
  }
  handleChainEnd(outputs: ChainValues, runId: string, parentRunId?: string | undefined): void {
    console.log("We're done with the chain run!");
    console.log(outputs);
    console.log(this.streamedResponse);
  }
  async handleLLMEnd(output: LLMResult, runId: string, parentRunId?: string | undefined): Promise<void> {
    console.log("We're done with the chain run!");
    console.log(output);
    console.log(this.streamedResponse);
  }
}