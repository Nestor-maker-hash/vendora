import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useOnboardingContext,
} from "../context/OnboardingContext";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  Country,
} from "../data/countries";
import { BUSINESS_CATEGORIES } from "../data/businessCategories";

interface Props {
  next: () => void;
}

function normalizePhoneNumber(
  value: string,
  dialCode: string
): string {
  let digits = value.replace(/\D/g, "");

  const dialDigits = dialCode.replace(/\D/g, "");

  if (digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length);
  }

  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  return digits;
}

export default function StepBusiness({
  next,
}: Props) {
  const { data, update } =
    useOnboardingContext();

  const [categoryOpen, setCategoryOpen] =
    useState(false);
  const [categorySearch, setCategorySearch] =
    useState("");

  const [country, setCountry] =
    useState<Country>(DEFAULT_COUNTRY);
  const [countryOpen, setCountryOpen] =
    useState(false);
  const [countrySearch, setCountrySearch] =
    useState("");

  const [localPhone, setLocalPhone] =
    useState("");

  const normalizedCategorySearch =
    categorySearch.trim().toLowerCase();

  const filteredCategories =
    BUSINESS_CATEGORIES.filter((category) => {
      if (!normalizedCategorySearch) {
        return true;
      }

      return (
        category.name
          .toLowerCase()
          .includes(normalizedCategorySearch) ||
        category.aliases.some((alias) =>
          alias
            .toLowerCase()
            .includes(normalizedCategorySearch)
        )
      );
    });

  const normalizedCountrySearch =
    countrySearch.trim().toLowerCase();

  const filteredCountries = useMemo(() => {
    if (!normalizedCountrySearch) {
      return COUNTRIES;
    }

    return COUNTRIES.filter((item) => {
      const search =
        normalizedCountrySearch.replace(/\s/g, "");

      return (
        item.name
          .toLowerCase()
          .includes(normalizedCountrySearch) ||
        item.code
          .toLowerCase()
          .includes(normalizedCountrySearch) ||
        item.dialCode.includes(search)
      );
    });
  }, [normalizedCountrySearch]);

  function selectCategory(category: string) {
    update({
      category,
    });

    setCategorySearch("");
    setCategoryOpen(false);
  }

  function selectCountry(
    selectedCountry: Country
  ) {
    setCountry(selectedCountry);
    setCountrySearch("");
    setCountryOpen(false);

    const normalizedNumber =
      normalizePhoneNumber(
        localPhone,
        country.dialCode
      );

    setLocalPhone(normalizedNumber);

    if (normalizedNumber) {
      update({
        phone:
          selectedCountry.dialCode +
          normalizedNumber,
      });
    } else {
      update({
        phone: "",
      });
    }
  }

  function handlePhoneChange(
    value: string
  ) {
    const normalizedNumber =
      normalizePhoneNumber(
        value,
        country.dialCode
      );

    setLocalPhone(normalizedNumber);

    update({
      phone: normalizedNumber
        ? country.dialCode +
          normalizedNumber
        : "",
    });
  }

  function handleNext() {
    if (!data.name.trim()) {
      toast.error(
        "Please enter your business name."
      );
      return;
    }

    if (!data.category.trim()) {
      toast.error(
        "Please select your business category."
      );
      return;
    }

    const normalizedNumber =
      normalizePhoneNumber(
        localPhone,
        country.dialCode
      );

    if (!normalizedNumber) {
      toast.error(
        "Please enter your WhatsApp number."
      );
      return;
    }

    if (normalizedNumber.length < 7) {
      toast.error(
        "Please enter a valid WhatsApp number."
      );
      return;
    }

    const fullPhone =
      country.dialCode + normalizedNumber;

    update({
      phone: fullPhone,
    });

    if (!data.email.trim()) {
      toast.error(
        "Please enter your business email."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email)) {
      toast.error(
        "Please enter a valid email."
      );
      return;
    }

    next();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Business Information
      </h1>

      <p className="mt-2 text-gray-500">
        Let's start by learning about your business.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block font-medium">
            Business Name
          </label>

          <input
            value={data.name}
            onChange={(e) =>
              update({
                name: e.target.value,
              })
            }
            className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
            placeholder="e.g. Xclusive Fashion"
          />
        </div>

        <div className="relative">
          <label
            htmlFor="business-category"
            className="mb-2 block font-medium"
          >
            Business Category
          </label>

          <button
            id="business-category"
            type="button"
            onClick={() => {
              setCategoryOpen(
                (open) => !open
              );
              setCategorySearch("");
            }}
            className="flex w-full items-center justify-between rounded-xl border bg-white p-4 text-left outline-none transition focus:border-emerald-600"
            aria-haspopup="listbox"
            aria-expanded={categoryOpen}
          >
            <span
              className={
                data.category
                  ? "text-gray-900"
                  : "text-gray-400"
              }
            >
              {data.category ||
                "Select a business category"}
            </span>

            <ChevronDown
              size={20}
              className={`shrink-0 text-gray-400 transition ${
                categoryOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {categoryOpen && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-100 p-3">
                <div className="flex items-center rounded-lg border bg-gray-50 px-3">
                  <Search
                    size={17}
                    className="shrink-0 text-gray-400"
                  />

                  <input
                    autoFocus
                    value={categorySearch}
                    onChange={(e) =>
                      setCategorySearch(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setCategoryOpen(false);
                      }
                    }}
                    placeholder="Search categories..."
                    aria-label="Search business categories"
                    className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div
                className="max-h-64 overflow-y-auto p-1.5"
                role="listbox"
                aria-label="Business categories"
              >
                {filteredCategories.length > 0 ? (
                  filteredCategories.map(
                    (category) => (
                      <button
                        key={category.name}
                        type="button"
                        role="option"
                        aria-selected={
                          data.category ===
                          category.name
                        }
                        onClick={() =>
                          selectCategory(
                            category.name
                          )
                        }
                        className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-emerald-50 hover:text-emerald-700 ${
                          data.category ===
                          category.name
                            ? "bg-emerald-50 font-semibold text-emerald-700"
                            : "text-gray-700"
                        }`}
                      >
                        {category.name}

                        {data.category ===
                          category.name && (
                          <Check
                            size={16}
                            className="float-right mt-0.5"
                          />
                        )}
                      </button>
                    )
                  )
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-gray-500">
                    No matching category found.
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="mt-2 text-sm text-gray-500">
            Choose the category that best describes
            what your business sells or provides.
          </p>
        </div>

        <div className="relative">
          <label
            htmlFor="business-phone"
            className="mb-2 block font-medium"
          >
            Primary WhatsApp Number
          </label>

          <div className="flex w-full overflow-visible rounded-xl border bg-white focus-within:border-emerald-600">
            <button
              type="button"
              onClick={() => {
                setCountryOpen(
                  (open) => !open
                );
                setCountrySearch("");
              }}
              className="flex min-w-[112px] shrink-0 items-center gap-1.5 border-r px-3 py-3.5 text-left"
              aria-haspopup="listbox"
              aria-expanded={countryOpen}
              aria-label="Select country code"
            >
              <span className="text-xl">
                {country.flag}
              </span>

              <span className="text-sm font-medium text-gray-700">
                {country.dialCode}
              </span>

              <ChevronDown
                size={15}
                className={`ml-auto text-gray-400 transition ${
                  countryOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            <input
              id="business-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={localPhone}
              onChange={(e) =>
                handlePhoneChange(
                  e.target.value
                )
              }
              placeholder="801 234 5678"
              className="min-w-0 flex-1 rounded-r-xl bg-transparent px-3 py-3.5 outline-none"
            />
          </div>

          {countryOpen && (
            <div className="absolute left-0 top-full z-40 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-100 p-3">
                <div className="flex items-center rounded-lg border bg-gray-50 px-3">
                  <Search
                    size={17}
                    className="shrink-0 text-gray-400"
                  />

                  <input
                    autoFocus
                    value={countrySearch}
                    onChange={(e) =>
                      setCountrySearch(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setCountryOpen(false);
                      }
                    }}
                    placeholder="Search country or code..."
                    aria-label="Search countries"
                    className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div
                className="max-h-64 overflow-y-auto p-1.5"
                role="listbox"
                aria-label="Countries"
              >
                {filteredCountries.length > 0 ? (
                  filteredCountries.map(
                    (item) => (
                      <button
                        key={item.code}
                        type="button"
                        role="option"
                        aria-selected={
                          country.code ===
                          item.code
                        }
                        onClick={() =>
                          selectCountry(item)
                        }
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-emerald-50 ${
                          country.code ===
                          item.code
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-700"
                        }`}
                      >
                        <span className="text-xl">
                          {item.flag}
                        </span>

                        <span className="min-w-0 flex-1 truncate">
                          {item.name}
                        </span>

                        <span className="text-xs text-gray-500">
                          {item.dialCode}
                        </span>

                        {country.code ===
                          item.code && (
                          <Check
                            size={16}
                            className="shrink-0"
                          />
                        )}
                      </button>
                    )
                  )
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-gray-500">
                    No country found.
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="mt-2 text-sm text-gray-500">
            Customers will use this number to contact
            you and Vendora will send WhatsApp
            notifications here.
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Business Email
          </label>

          <input
            type="email"
            value={data.email}
            onChange={(e) =>
              update({
                email: e.target.value,
              })
            }
            className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
            placeholder="business@email.com"
          />
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          onClick={handleNext}
          className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
