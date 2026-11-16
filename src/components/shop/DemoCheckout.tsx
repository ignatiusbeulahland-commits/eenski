import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { onCheckout } from "@/lib/shop/panel";

/**
 * Mounted once in the root layout: every buy button and the cart's "Check out"
 * call `openCheckout(items)`, which lands here and opens the checkout page.
 */
export function DemoCheckout() {
  const navigate = useNavigate();
  useEffect(() => onCheckout(() => void navigate({ to: "/checkout", search: { step: "review" } })), [navigate]);
  return null;
}
