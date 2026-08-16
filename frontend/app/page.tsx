"use client";

import ProductPreview from "@/src/components/landing/ProductPreview";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Globe2,
  Package,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Globe2,
    title: "Your own online store",
    description:
      "Give your business a professional storefront customers can visit from anywhere.",
  },
  {
    icon: ClipboardList,
    title: "Orders in one place",
    description:
      "Stop searching through WhatsApp messages. Manage every order from one dashboard.",
  },
  {
    icon: Package,
    title: "Simple inventory",
    description:
      "Know what you have in stock and keep your product catalogue organized.",
  },
  {
    icon: Users,
    title: "Customer management",
    description:
      "Keep track of your customers and build relationships beyond individual orders.",
  },
  {
    icon: BarChart3,
    title: "Business insights",
    description:
      "Understand how your business is performing with useful sales and business data.",
  },
  {
    icon: Globe2,
    title: "Built for African businesses",
    description:
      "Designed around the way small businesses across Africa actually sell.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Sign up with Google or email and get your Vendora business workspace.",
  },
  {
    number: "02",
    title: "Set up your business",
    description:
      "Add your business details, branding, products and storefront information.",
  },
  {
    number: "03",
    title: "Start selling",
    description:
      "Share your store, receive orders and manage your business from one place.",
  },
];

const dashboardStats = [
  {
    label: "Total Sales",
    value: "₦1,284,500",
    change: "+18.4%",
  },
  {
    label: "Orders",
    value: "128",
    change: "+12.8%",
  },
  {
    label: "Products",
    value: "64",
    change: "+4",
  },
  {
    label: "Customers",
    value: "342",
    change: "+21",
  },
];

const recentOrders = [
  {
    customer: "Ada Okafor",
    product: "Classic Tote Bag",
    amount: "₦18,500",
    status: "Paid",
  },
  {
    customer: "Chinedu Eze",
    product: "Premium Sneakers",
    amount: "₦42,000",
    status: "Pending",
  },
  {
    customer: "Amaka Nwosu",
    product: "Linen Shirt",
    amount: "₦25,000",
    status: "Paid",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <img
              src="/icon.png"
              alt="Vendora"
              className="h-9 w-9 rounded-xl object-cover"
            />

            <span className="text-xl font-extrabold tracking-tight">
              Vendora
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:text-emerald-600 sm:px-4"
            >
              Login
            </Link>

            <Link
              href="/create-account"
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:px-5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_45%)]" />

        <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <Zap size={15} />
              Commerce OS for African businesses
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-950 sm:text-6xl lg:text-7xl">
              Turn your business into a{" "}
              <span className="text-emerald-600">
                business that runs.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-xl sm:leading-8">
              Vendora gives small businesses the tools to manage
              products, customers, inventory, orders and online
              sales — all from one simple platform.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/create-account"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-4 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                Start Selling Free

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Explore Vendora
                <ChevronRight size={18} />
              </a>
            </div>

		   <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={16}
                  className="text-emerald-600"
                />
                Free to get started
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={16}
                  className="text-emerald-600"
                />
                No technical skills required
              </span>
            </div>
          </div>




	{/* Product preview */}
<ProductPreview />


        </div>
      </section>

      {/* Problem / positioning */}
      <section className="border-y border-gray-100 bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
              Built for the way you sell
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Your business shouldn't live inside your WhatsApp chats.
            </h2>

            <p className="mt-5 text-gray-600">
              Conversations, orders, customers and inventory can quickly
              become difficult to manage as your business grows.
              Vendora brings everything together.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "From scattered",
                text: "Orders buried in conversations and customer information spread across different places.",
              },
              {
                title: "To organized",
                text: "A single workspace where your products, customers and orders are easy to manage.",
              },
              {
                title: "To growing",
                text: "A professional online presence that helps your business move beyond informal selling.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-7"
              >
                <h3 className="text-lg font-bold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
              Everything in one place
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              The tools you need to run your business.
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Vendora brings the essential parts of your business
              together so you can spend less time organizing and
              more time selling.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-5 font-bold text-gray-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-950 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Go from idea to selling in minutes.
            </h2>

            <p className="mt-4 text-gray-400">
              No complicated setup. Just create your account,
              tell Vendora about your business and start building.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-7"
              >
                <span className="text-sm font-bold text-emerald-400">
                  {step.number}
                </span>

                <h3 className="mt-5 text-xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



	{/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-6">
          <img
            src="/icon.png"
            alt="Vendora"
            className="mx-auto h-14 w-14 rounded-2xl object-cover"
          />

          <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Ready to build your business?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-gray-600">
            Join Vendora and start turning your products and
            customers into a business you can actually manage.
          </p>

          <Link
            href="/create-account"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-4 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            Start Selling Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <img
              src="/icon.png"
              alt="Vendora"
              className="h-7 w-7 rounded-lg object-cover"
            />

            <span className="font-semibold text-gray-800">
              Vendora
            </span>
          </div>

          <p>
            Commerce infrastructure for African businesses.
          </p>

          <Link
            href="/login"
            className="font-medium text-gray-600 hover:text-emerald-600"
          >
            Login
          </Link>
        </div>
      </footer>
    </main>
  );
}
