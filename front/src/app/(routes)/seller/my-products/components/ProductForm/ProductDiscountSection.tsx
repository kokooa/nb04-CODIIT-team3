"use client";

import { ProductFormValues } from "@/lib/schemas/productForm.schema";
import Image from "next/image";
import { Control, FieldErrors, useController } from "react-hook-form";

export function ProductDiscountSection({
  control,
  errors,
}: {
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
}) {
  const { field: discountEnabledField } = useController({ name: "discount.enabled", control });
  const { field: discountValueField } = useController({ name: "discount.value", control });
  const { field: periodEnabledField } = useController({ name: "discount.periodEnabled", control });
  const { field: periodStartField } = useController({ name: "discount.periodStart", control });
  const { field: periodEndField } = useController({ name: "discount.periodEnd", control });

  return (
    <section className="mb-[60px]">
      <h3 className="text-xl font-extrabold">상품 할인</h3>
      <div className="bg-black01 mt-[10px] h-px w-full" />
      <div className="mt-[30px] flex flex-col gap-[30px]">
        <div className="flex items-center">
          <label className="text-black01 w-[117px] font-bold">할인</label>
          <>
            <div className="border-gray03 relative h-[45px] w-[390px] rounded-xl border">
              {[
                { label: "설정함", value: true },
                { label: "설정안함", value: false },
              ].map(({ label, value }) => (
                <label
                  key={label}
                  htmlFor={`discount-enabled-${label}`}
                  className={`absolute top-0 flex h-[45px] w-[195px] cursor-pointer items-center justify-between rounded-xl px-5 transition-all ${value ? "left-0" : "right-0"} ${
                    discountEnabledField.value === value ? "border-black01 border bg-white font-bold" : "text-gray02"
                  }`}
                  onClick={() => {
                    discountEnabledField.onChange(value);
                    if (value === false) {
                      periodEnabledField.onChange(false);
                    }
                  }}
                >
                  <input
                    type="radio"
                    id={`discount-enabled-${label}`}
                    value={String(value)}
                    checked={discountEnabledField.value === value}
                    onChange={() => discountEnabledField.onChange(value)}
                    className="hidden"
                  />
                  <span className="">{label}</span>
                  {discountEnabledField.value === value && (
                    <Image
                      src="/icon_check.svg"
                      alt="check"
                      width={20}
                      height={20}
                    />
                  )}
                </label>
              ))}
            </div>
            {errors.discount?.enabled?.message && (
              <p className="ml-3 text-sm text-red-500">{errors.discount.enabled.message}</p>
            )}
          </>
        </div>
        <div className="flex items-center">
          <label
            htmlFor="discountValue"
            className="text-black01 w-[117px] font-bold"
          >
            할인율
          </label>
          <div className="flex items-center gap-[10px]">
            <input
              id="discountValue"
              type="number"
              min={0}
              {...discountValueField}
              value={discountValueField.value ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                discountValueField.onChange(val === "" ? null : Number(val));
              }}
              className={`border-gray03 text-black01 placeholder:text-gray02 h-[45px] w-[260px] rounded-md border px-5 focus:outline-none ${
                !discountEnabledField.value ? "cursor-not-allowed bg-gray-100" : ""
              }`}
              placeholder="할인율 입력"
              disabled={!discountEnabledField.value}
            />
            %
            {errors.discount?.value?.message && (
              <p className="ml-3 text-sm text-red-500">{errors.discount.value.message}</p>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <label className="text-black01 w-[117px] font-bold">기간 할인</label>
          <>
            <div className="border-gray03 relative h-[45px] w-[390px] rounded-xl border">
              {[
                { label: "설정함", value: true },
                { label: "설정안함", value: false },
              ].map(({ label, value }) => (
                <label
                  key={label}
                  htmlFor={`period-enabled-${label}`}
                  className={`absolute top-0 flex h-[45px] w-[195px] cursor-pointer items-center justify-between rounded-xl px-5 transition-all ${value ? "left-0" : "right-0"} ${
                    periodEnabledField.value === value ? "border-black01 border font-bold opacity-100" : "text-gray02"
                  }`}
                  onClick={value && !discountEnabledField.value ? (e) => e.preventDefault() : undefined}
                >
                  <input
                    type="radio"
                    id={`period-enabled-${label}`}
                    value={String(value)}
                    checked={periodEnabledField.value === value}
                    className="hidden"
                    onChange={() => periodEnabledField.onChange(value)}
                    disabled={value && !discountEnabledField.value}
                  />
                  <span className="">{label}</span>
                  {periodEnabledField.value === value && (
                    <Image
                      src="/icon_check.svg"
                      alt="check"
                      width={20}
                      height={20}
                    />
                  )}
                </label>
              ))}
            </div>
            {errors.discount?.periodEnabled?.message && (
              <p className="ml-3 text-sm text-red-500">{errors.discount.periodEnabled.message}</p>
            )}
          </>
        </div>
        <div className="flex items-center">
          <label
            htmlFor="periodStart"
            className="text-black01 w-[117px] font-bold"
          >
            할인 기간
          </label>
          <>
            <input
              id="periodStart"
              type="datetime-local"
              {...periodStartField}
              value={periodStartField.value ?? ""}
              className={`border-gray03 h-[45px] w-[390px] rounded-md border bg-white px-5 focus:outline-none ${
                !discountEnabledField.value || !periodEnabledField.value ? "text-gray03 cursor-not-allowed" : ""
              }`}
              disabled={!discountEnabledField.value || !periodEnabledField.value}
            />
            <span className="mx-5">-</span>
            <input
              id="periodEnd"
              type="datetime-local"
              {...periodEndField}
              value={periodEndField.value ?? ""}
              className={`border-gray03 h-[45px] w-[390px] rounded-md border bg-white px-5 focus:outline-none ${
                !discountEnabledField.value || !periodEnabledField.value ? "text-gray03 cursor-not-allowed" : ""
              }`}
              disabled={!discountEnabledField.value || !periodEnabledField.value}
            />
            {errors.discount?.periodStart?.message && (
              <p className="ml-3 text-sm text-red-500">{errors.discount.periodStart.message}</p>
            )}
            {errors.discount?.periodEnd?.message && (
              <p className="ml-3 text-sm text-red-500">{errors.discount.periodEnd.message}</p>
            )}
          </>
        </div>
      </div>
    </section>
  );
}
