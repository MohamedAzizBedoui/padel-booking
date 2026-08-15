"use client";

import { useRouter } from "next/navigation";

type Props = {
  date: string;
  location?: string;
};

export default function DateSelector({
  date,
  location,
}: Props) {
  const router = useRouter();

  function handleDateChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const newDate = event.target.value;

    if (!newDate) {
      return;
    }

    const params = new URLSearchParams();

    if (location) {
      params.set("location", location);
    }

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
        min={date}
        onChange={handleDateChange}
        className="bg-transparent text-white outline-none"
      />
    </div>
  );
}