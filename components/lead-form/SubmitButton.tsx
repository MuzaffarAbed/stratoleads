import { buttonClass } from "@/components/ui/styles";

export function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button type="submit" className={buttonClass} disabled={pending}>
      Confirm
    </button>
  );
}
