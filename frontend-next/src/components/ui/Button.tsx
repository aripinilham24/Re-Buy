import React from "react";
import { Button } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

type Props = React.ComponentPropsWithoutRef<typeof Button> &
  VariantProps<typeof buttonVariants>;

export default function ButtonComponent({
  size = "sm",
  children = "button",
  variant = "outline",
  ...props
}: Props) {
  return (
    <Button size={size} variant={variant} {...props}>
      {children}
    </Button>
  );
}
