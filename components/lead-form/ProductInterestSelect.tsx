import { PRODUCT_INTERESTS, PRODUCT_INTEREST_LABELS, type ProductInterest } from "@/lib/constants";
import { solidControlClass } from "@/components/ui/styles";

export function ProductInterestSelect({
  value,
  onChange,
  disabled,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-required": ariaRequired,
}: {
  value: ProductInterest | "";
  onChange: (value: ProductInterest | "") => void;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}) {
  return (
    <select
      id={id}
      className={solidControlClass}
      value={value}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      aria-required={ariaRequired}
      onChange={(event) => onChange(event.target.value as ProductInterest | "")}
    >
      <option value="">Select a product</option>
      {PRODUCT_INTERESTS.map((product) => (
        <option key={product} value={product}>
          {PRODUCT_INTEREST_LABELS[product]}
        </option>
      ))}
    </select>
  );
}
