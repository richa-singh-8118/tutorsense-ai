import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TutorSense AI — AI-Powered Tutor Screening Platform",
  description:
    "TutorSense AI replaces manual screening calls with an intelligent AI interviewer that assesses tutor candidates through natural voice conversation. Built for education companies like Cuemath.",
  keywords: [
    "AI interview",
    "tutor screening",
    "voice interview",
    "hiring platform",
    "education hiring",
    "Cuemath",
    "AI recruiter",
  ],
  openGraph: {
    title: "TutorSense AI — AI-Powered Tutor Screening Platform",
    description: "Intelligent voice-based tutor screening powered by AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="mesh-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
