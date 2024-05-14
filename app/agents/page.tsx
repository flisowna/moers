import { ChatWindow } from "@/components/ChatWindow";

export default function AgentsPage() {
  const InfoCard = (
    <div className="w-full text-[#25252d] py-4">
      <h1 className="text-3xl md:text-4xl">
        <span className="font-bold uppercase">moers</span><span className="uppercase text-[#C5091D]">intranet</span> Suchmaschine
      </h1>
      <h2 className="text-xl md:text-2xl">Agents</h2>
    </div>
  );
  return (
    <ChatWindow
      endpoint="api/chat/agents"
      emptyStateComponent={InfoCard}
      placeholder="Squawk! I'm a conversational agent! Ask me about the current weather in Honolulu!"
      titleText="Polly the Agentic Parrot"
      emoji="🦜"
      showIntermediateStepsToggle={true}
    ></ChatWindow>
  );
}
