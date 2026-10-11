
import { Heart } from "lucide-react";

export function SectionDivider() {
  return (
    <div className="flex w-full items-center justify-center gap-4">
      <span className="h-px w-12 bg-border sm:w-20" />
      <Heart className="size-4 fill-primary text-primary" />
      <span className="h-px w-12 bg-border sm:w-20" />
    </div>
  );
}
