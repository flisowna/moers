import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";

export const runtime = "edge";

// const classificationSchema = z.object({
//   sentiment: z
//     .enum(["happy", "neutral", "sad"])
//     .describe("The sentiment of the text"),
//   aggressiveness: z
//     .number()
//     .int()
//     .min(1)
//     .max(5)
//     .describe(
//       "describes how aggressive the statement is, the higher the number the more aggressive"
//     ),
//   language: z
//     .enum(["spanish", "english", "french", "german", "italian"])
//     .describe("The language the text is written in"),
// });

// const taggingPrompt = ChatPromptTemplate.fromTemplate(
//   `Extract the desired information from the following passage.

// Only extract the properties mentioned in the 'Classification' function.

// Passage:
// {input}
// `
// );

// // LLM
// const llm = new ChatOpenAI({
//   temperature: 0,
//   model: "gpt-3.5-turbo-0125",
// });
// const llmWihStructuredOutput = llm.withStructuredOutput(classificationSchema);

// const chain = taggingPrompt.pipe(llmWihStructuredOutput);

// Before running, follow set-up instructions at
// https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase

/**
 * This handler takes input text, splits it into chunks, and embeds those chunks
 * into a vector store for later retrieval. See the following docs for more information:
 *
 * https://js.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/recursive_text_splitter
 * https://js.langchain.com/docs/modules/data_connection/vectorstores/integrations/supabase
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;
  const fileName = body.metadata?.title;

  if (process.env.NEXT_PUBLIC_DEMO === "true") {
    return NextResponse.json(
      {
        error: [
          "Ingest is not supported in demo mode.",
          "Please set up your own version of the repo here: https://github.com/langchain-ai/langchain-nextjs-template",
        ].join("\n"),
      },
      { status: 403 },
    );
  }

  const classificationSchema = z.object({
    documentType: z
      .enum(["ADMINISTRATIVE_CIRCULAR", "SERVICE_AGREEMENT", "UNCLEAR"])
      .describe("The type of the document (or UNCLEAR)"),
  });

  const classificationPrompt = ChatPromptTemplate.fromTemplate(
    `Extract the desired information from the following passage.

Only extract the properties mentioned in the 'Classification' function.

Passage:
{input}
`,
  );

  // LLM
  const classificationLlm = new ChatOpenAI({
    temperature: 0,
    model: "gpt-3.5-turbo-0125",
    apiKey: process.env.OPENAI_API,
  });
  const llmWihStructuredOutput =
    classificationLlm.withStructuredOutput(classificationSchema);

  const chain = classificationPrompt.pipe(llmWihStructuredOutput);

  const docClass = await chain.invoke({ input: text });

  try {
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PRIVATE_KEY!,
    );

    const { data, error } = await client.storage
      .from("moers-docs")
      .upload(`public/${fileName}`, text, {
        cacheControl: "3600",
        upsert: false,
        contentType: "text/plain",
      });

    if (error) {
      console.error("Error uploading file to Supabase:", error);
      // res.status(500).json({ error: "Failed to upload file to Supabase" });
    }

    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
      chunkSize: 256,
      chunkOverlap: 20,
    });

    const splitDocuments = await splitter.createDocuments(
      [text],
      [
        {
          title: fileName,
          ...docClass,
        },
      ],
    );

    const vectorstore = await SupabaseVectorStore.fromDocuments(
      splitDocuments,
      new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API,
      }),
      {
        client,
        tableName: "documents",
        queryName: "match_documents",
      },
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
