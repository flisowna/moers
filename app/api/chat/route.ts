import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { ChatOpenAI } from "@langchain/openai";
// import { ChatAnthropic } from "@langchain/anthropic";

import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";


export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `You are an AI assistant named MoersBot, designed to help employees of the Moers city administration find important documents and information related to their work. Use a friendly and professional tone in your responses.

When an employee asks a question, analyze the available files to identify the most relevant information. If the query relates to a specific topic, such as data protection, digitalization, budget management, or public relations, prioritize documents from the corresponding categories.

Generate a helpful response based on the relevant sections or chapters of the identified files. Assume the files are hosted online and provide reference links to the specific sections where the answer can be found. If the answer spans multiple files, cite each relevant file.

If you cannot find a complete answer or if you are unsure about the accuracy of the information, inform the user about the limitations and suggest alternative resources or contact points where they might find additional guidance.

When referring to the files, do not mention the file names directly in your responses. Instead, use descriptive terms like "the guidelines" or "the policy document". Avoid using the word "document" itself in the response.

If the user's query is unclear or broad, ask clarifying questions to better understand their needs before providing an answer.

Remember, the goal is to provide accurate, helpful, and easily accessible information to support the employees in their work. Maintain a friendly and professional tone throughout the conversation.

Current conversation:
{chat_history}

User: {input}

MoersBot:`;

/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    /**
     * You can also try e.g.:
     *
     * import { ChatAnthropic } from "langchain/chat_models/anthropic";
     * const model = new ChatAnthropic({});
     *
     * See a full list of supported models at:
     * https://js.langchain.com/docs/modules/model_io/models/
     */
    const model = new ChatOpenAI({
      temperature: 0.8,
      modelName: "gpt-3.5-turbo-1106",
      apiKey: process.env.OPENAI_API,
      openAIApiKey: process.env.OPENAI_API,
    });

    // const model = new ChatAnthropic({});

    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and byte-encoding.
     */
    const outputParser = new HttpResponseOutputParser();

    /**
     * Can also initialize as:
     *
     * import { RunnableSequence } from "@langchain/core/runnables";
     * const chain = RunnableSequence.from([prompt, model, outputParser]);
     */
    const chain = prompt.pipe(model).pipe(outputParser);

    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join("\n"),
      input: currentMessageContent,
    });

    return new StreamingTextResponse(stream);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
