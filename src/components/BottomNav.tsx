import { Link, useLocation } from "@tanstack/react-router";
import { Home, ShoppingBag, CalendarDays, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/tracker", label: "Tracker", icon: CalendarDays },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const totalItems = useCart((s) => s.totalItems());

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-[var(--bloom-border)] bg-[var(--cream)]/95 pb-5 pt-2.5 backdrop-blur-md">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-0.5 px-3 text-[10px] font-medium transition-colors ${
              isActive ? "text-[var(--rose)]" : "text-[var(--bloom-muted)]"
            }`}
          >
            <div className="relative">
              <item.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.5 : 1.5} />
              {item.label === "Cart" && totalItems > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--rose)] px-1 text-[9px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </div>
            <span>{item.label}</span>
            {isActive && (
              <span className="mt-[-2px] h-[5px] w-[5px] rounded-full bg-[var(--rose)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
