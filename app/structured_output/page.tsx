import { ChatWindow } from "@/components/ChatWindow";

export default function AgentsPage() {
  const InfoCard = (
    <div className="w-full text-[#25252d] py-4">
      <h1 className="text-3xl md:text-4xl">
        <span className="font-bold uppercase">moers</span><span className="uppercase text-[#C5091D]">intranet</span> Suchmaschine
      </h1>
      <h2 className="text-xl md:text-2xl">Structured Output</h2>
    </div>
  );
  return (
    <ChatWindow
      endpoint="api/chat/structured_output"
      emptyStateComponent={InfoCard}
      placeholder={`No matter what you type here, I'll always return the same JSON object with the same structure!`}
      emoji="🧱"
      titleText="Structured Output"
    ></ChatWindow>
  );
}
