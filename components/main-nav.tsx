"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/blog",
      label: "Blog",
      active: pathname === "/blog",
    },
    {
      href: "/projects",
      label: "Projects",
      active: pathname === "/projects",
    },
    {
      href: "/apps",
      label: "Apps",
      active: pathname === "/apps",
    },
    {
      href: "/designs",
      label: "Designs",
      active: pathname === "/designs",
    },
    {
      href: "/my-journey",
      label: "My Journey",
      active: pathname === "/my-journey",
    },
    {
      href: "/about",
      label: "About",
      active: pathname === "/about",
    },
  ]

  return (
    <header className="w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://rz-codes.com/static/logo-275e932fd817cc84d99d91f7519a9a22.svg"
            alt="RZ Codes Logo"
            width={100}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
        <nav className="ml-auto flex gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                route.active ? "text-primary" : "text-foreground"
              }`}
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

