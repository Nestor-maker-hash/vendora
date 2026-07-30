import {
  useOnboardingContext,
} from "../context/OnboardingContext";
import toast from "react-hot-toast";

interface Props {
  next: () => void;
}

export default function StepBusiness({
  next,
}: Props) {
const { data, update } =
  useOnboardingContext();
function handleNext() {
  if (!data.name.trim()) {
    toast.error(
      "Please enter your business name."
    );
    return;
  }

  if (!data.category.trim()) {
    toast.error(
      "Please enter your business category."
    );
    return;
  }

  if (!data.phone.trim()) {
    toast.error(
      "Please enter your WhatsApp number."
    );
    return;
  }

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
  placeholder="e.g. Nestor Fashion"
/>

        </div>

        <div>
          <label className="mb-2 block font-medium">
            Category
          </label>

    <input
  value={data.category}
  onChange={(e) =>
    update({
      category: e.target.value,
    })
  }
  className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
  placeholder="Fashion, Electronics..."
/>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Primary WhatsApp Number
          </label>

   <input
  value={data.phone}
  onChange={(e) =>
    update({
      phone: e.target.value,
    })
  }
  className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
  placeholder="+2348012345678"
/>

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
