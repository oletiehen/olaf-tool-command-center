import type { AnchorHTMLAttributes, ReactNode } from "react";
import { appHref } from "./app-routes";

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

export default function AppLink({ href, children, ...props }: AppLinkProps) {
  return <a href={appHref(href)} {...props}>{children}</a>;
}
