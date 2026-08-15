"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  date: string;
};

export default function DateSelector({ date }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleDateChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const newDate = event.target.value;

    if (!newDate) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    params.set("date", newDate);

    router.push(`/courts?${params.toString()}`);
  }

  return (
    <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70">
      <label className="mr-2">
        Date:
      </label>

      <input
        type="date"
        value={date}
        min={new Date().toISOString().split("T")[0]}
        onChange={handleDateChange}
        className="bg-transparent text-white outline-none"
      />
    </div>
  );
}