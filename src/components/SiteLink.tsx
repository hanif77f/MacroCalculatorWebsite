import Link from "next/link";
import type { ComponentProps } from "react";

const INTERNAL_DOMAIN = "macrocalculators.com";
const DOMAIN_URL_PATTERN = /^(?:[a-z][a-z\d+.-]*:)?\/\/([^/?#]+)/i;

function isExternalDomain(href: string) {
  const match = DOMAIN_URL_PATTERN.exec(href);
  if (!match) return false;

  const authority = match[1];
  const hostPort = authority.slice(authority.lastIndexOf("@") + 1);
  const hostname = hostPort.startsWith("[")
    ? hostPort.slice(1, hostPort.indexOf("]"))
    : hostPort.split(":")[0];
  const normalizedHostname = hostname.toLowerCase().replace(/\.$/, "");

  return normalizedHostname !== INTERNAL_DOMAIN && !normalizedHostname.endsWith(`.${INTERNAL_DOMAIN}`);
}

export default function SiteLink({ href, ...props }: ComponentProps<"a">) {
  if (href && isExternalDomain(href)) {
    return <a href={href} {...props} target="_blank" rel="noopener noreferrer" />;
  }

  if (href?.startsWith("/") && !href.startsWith("//")) {
    return <Link href={href} {...props} target={undefined} />;
  }

  return <a href={href} {...props} target={undefined} />;
}
