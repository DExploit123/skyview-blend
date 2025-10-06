import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const PremiumBadge = () => {
  return (
    <Badge variant="secondary" className="gap-1">
      <Crown className="h-3 w-3 fill-primary text-primary" />
      Premium
    </Badge>
  );
};