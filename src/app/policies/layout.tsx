import type React from "react"
import Header from "../../app/Component/Header"
import Footer from "../../app/Component/Footer"
import { PolicySidebar } from "./components/policy-sidebar"

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main content area with sidebar and policy content */}
      <div className="flex flex-1 overflow-hidden">
        <PolicySidebar />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
