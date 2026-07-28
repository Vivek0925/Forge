interface Message {
  id: string;
  content: string;
}

export default function MessageList({
  messages,
}: {
  messages: Message[];
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message) => (
        <div key={message.id}>
          {message.content}
        </div>
      ))}
    </div>
  );
}