import { initChatModel } from "langchain/chat_models/universal";

const coordinatorModel = await initChatModel("openai:gpt-5.4-mini", {
  reasoning: {
    effort: 'low',
    summary: 'auto'
  }
});

const subagentModel = await initChatModel("openai:gpt-5.4-mini");

export { coordinatorModel, subagentModel };
