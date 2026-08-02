interface DateSeparatorProps {
  date: string;
}

export default function DateSeparator({
  date,
}: DateSeparatorProps) {
  const messageDate = new Date(date);

  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let label = messageDate.toLocaleDateString(
    undefined,
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  if (
    messageDate.toDateString() ===
    today.toDateString()
  ) {
    label = "Today";
  } else if (
    messageDate.toDateString() ===
    yesterday.toDateString()
  ) {
    label = "Yesterday";
  }

  return (
    <div className="my-8 flex items-center gap-4">
      <div className="h-px flex-1 bg-[#ECEEF3]" />

      <span className="rounded-full bg-[#F5F6F8] px-4 py-1 text-xs font-medium text-[#707487]">
        {label}
      </span>

      <div className="h-px flex-1 bg-[#ECEEF3]" />
    </div>
  );
}