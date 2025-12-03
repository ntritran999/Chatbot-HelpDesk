"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState } from "react";

export default function Subscription() {
  const packageType = localStorage.getItem("packageType") || "individual";
  const [showCancelModal, setShowCancelModal] = useState(false);

  const plans = [
    {
      id: "individual",
      name: "Individual",
      price: "200,000",
      period: "VND/month",
      description: "Perfect for personal projects",
      features: [
        { name: "Unlimited bots", included: true },
        { name: "1 AI model connection", included: true },
        { name: "Basic analytics", included: true },
        { name: "Team collaboration", included: false },
        { name: "Priority support", included: false },
      ],
      current: packageType === "individual",
    },
    {
      id: "business",
      name: "Business",
      price: "500,000",
      period: "VND/month + 100 VND/token",
      description: "For growing businesses and teams",
      features: [
        { name: "Unlimited bots", included: true },
        { name: "All AI models", included: true },
        { name: "Team collaboration", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: true },
      ],
      current: packageType === "business",
    },
  ];

  return (
      <>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Subscription
          </h1>
          <p className="text-slate-600 mb-8">
            Manage your plan and billing
          </p>

          {/* Current Plan */}
          <div className="mb-12 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Current Plan
                </h2>
                <p className="text-lg capitalize text-slate-700">
                  {packageType} - {packageType === "individual" ? "200,000 VND/month" : "500,000 VND/month + 100 VND/token"}
                </p>
                {packageType === "business" && (
                  <p className="text-sm text-slate-600 mt-2">
                    Next billing date: March 22, 2024
                  </p>
                )}
              </div>
              {packageType === "business" && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>

          {/* Plans Comparison */}
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Available Plans
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg border-2 p-8 transition-all ${
                  plan.current
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-slate-600">{plan.period}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-slate-900"
                            : "text-slate-400"
                        }
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                {plan.current ? (
                  <Button
                    disabled
                    className="w-full"
                    variant="outline"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    Upgrade to {plan.name}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Billing History */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Billing History
            </h2>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {packageType === "business" && (
                    <>
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-900">
                          Feb 22, 2024
                        </td>
                        <td className="px-6 py-4 text-slate-900">500,000 VND</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href="#"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-900">
                          Jan 22, 2024
                        </td>
                        <td className="px-6 py-4 text-slate-900">500,000 VND</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href="#"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    </>
                  )}
                  {packageType === "individual" && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-600">
                        No billing history for free plan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Cancel Subscription?
            </h2>
            <p className="text-slate-600 mb-6">
              Are you sure you want to cancel your subscription? You'll lose access to all Business features.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="outline"
                className="flex-1"
              >
                Keep Subscription
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Cancel Plan
              </Button>
            </div>
          </div>
        </div>
      )}
      </>
  );
}
