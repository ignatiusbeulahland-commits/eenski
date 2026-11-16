import { Link } from "@tanstack/react-router";
import type { MouseEventHandler, ReactNode } from "react";

import type { ShopRoute } from "@/lib/shop/types";

interface Props {
  route: ShopRoute;
  className?: string | undefined;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
  tabIndex?: number | undefined;
  "aria-label"?: string | undefined;
}

/** Opens an item's details page, wherever the item came from. */
export function ShopLink({ route, ...rest }: Props) {
  if (route.kind === "store") return <Link to="/store/$handle" params={{ handle: route.slug }} search={{ item: route.item }} {...rest} />;
  return route.kind === "course" ? (
    <Link to="/courses/$slug" params={{ slug: route.slug }} {...rest} />
  ) : (
    <Link to="/dreamverse/$slug" params={{ slug: route.slug }} {...rest} />
  );
}
