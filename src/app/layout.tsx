
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SciProgram | Scientific Program Manager",
    template: "%s | SciProgram",
  },
  description:
    "Create, manage, and publish scientific conference programs, schedules, and faculty information.",
  applicationName: "SciProgram",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffaf7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
