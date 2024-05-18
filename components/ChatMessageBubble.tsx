import type { Message } from "ai/react";

export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  sources: any[];
}) {
  const colorClassName =
    props.message.role === "user" ? "bg-[#C5091D]" : "bg-slate-50 text-black";
  const alignmentClassName =
    props.message.role === "user" ? "ml-auto" : "mr-auto";
  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}
    >
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{props.message.content}</span>
        {props.sources && props.sources.length ? (
          <>
            <code className="mt-4 mr-auto bg-slate-100 px-2 py-1 rounded">
              <h2>Sources:</h2>
            </code>
            <code className="mt-1 mr-2 bg-slate-100 px-2 py-1 rounded text-xs">
              {Object.entries(
                props.sources?.reduce((acc, source) => {
                  const title = source.metadata?.title;
                  if (!acc[title]) {
                    acc[title] = [];
                  }
                  acc[title].push(source);
                  return acc;
                }, {}),
              ).map(([title, sources], i) => (
                <div className="mt-2" key={`source-group:${i}`}>
                  <a
                    href={sources[0].metadata?.publicDocUrl}
                    target="_blank"
                    className="text-lg font-semibold"
                  >
                    {title}
                  </a>
                  {sources.map((source, j) => (
                    <div key={`source:${i}-${j}`}>
                      {j + 1}. &quot;{source.pageContent}&quot;
                      {source.metadata?.loc?.lines !== undefined ? (
                        <div>
                          <br />
                          Lines {source.metadata?.loc?.lines?.from} to{" "}
                          {source.metadata?.loc?.lines?.to}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </code>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
