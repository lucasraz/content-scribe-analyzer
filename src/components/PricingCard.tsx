
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingCardProps {
  plan: "free" | "pro";
  price: string;
  description: string;
  features: string[];
  isPrimary?: boolean;
  onSelect: () => void;
  isCurrentPlan?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  price,
  description,
  features,
  isPrimary = false,
  onSelect,
  isCurrentPlan = false,
}) => {
  return (
    <div
      className={`relative rounded-xl p-6 shadow-md transition-all ${
        isPrimary
          ? "border-2 border-brand-secondary bg-white"
          : "border border-gray-200 bg-white"
      } ${isCurrentPlan ? "ring-2 ring-brand-primary" : ""}`}
    >
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white">
          Seu Plano Atual
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold">{plan === "free" ? "Free" : "Pro"}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          {plan !== "free" && <span className="text-gray-500">/mês</span>}
        </div>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>

      <ul className="my-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            <span className={`text-sm ${
              // Highlight the "Geração de relatórios" feature in the Pro plan
              plan === "pro" && feature.includes("relatórios") 
                ? "font-medium text-brand-primary" 
                : ""
            }`}>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        className={`w-full ${
          isPrimary
            ? "bg-brand-secondary hover:bg-brand-secondary/90"
            : isCurrentPlan
            ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
            : ""
        }`}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? "Plano Atual" : "Selecionar Plano"}
      </Button>
    </div>
  );
};

export default PricingCard;
