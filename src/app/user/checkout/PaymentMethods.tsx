// components/PaymentMethods.tsx
"use client"

import { useEffect, useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CreditCard } from "lucide-react"

interface Bank { bank_code: string; name: string }

interface PaymentMethodsProps {
  onSelect: (method: string) => void
  initial?: string
}

export function PaymentMethods({ onSelect, initial = "COD" }: PaymentMethodsProps) {
//   const [token, setToken] = useState<string>("")
  const [banks, setBanks] = useState<Bank[]>([])
  const [selected, setSelected] = useState(initial)

  useEffect(() => {
    async function load() {
      // 1) get OAuth token
      const tokRes = await fetch(`${process.env.NEXT_PUBLIC_GOPAYFAST_BASE_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          merchant_id:   process.env.NEXT_PUBLIC_GOPAYFAST_MERCHANT_ID!,
          grant_type:    "client_credentials",
          secured_key:   process.env.NEXT_PUBLIC_GOPAYFAST_SECURED_KEY!,
        }),
      })
      const { token } = await tokRes.json()
    //   setToken(token)

      // 2) fetch banks
      const listRes = await fetch(`${process.env.NEXT_PUBLIC_GOPAYFAST_BASE_URL}/list/banks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await listRes.json()
      setBanks(json.banks || [])
      if (json.banks?.length) {
        setSelected(json.banks[0].bank_code)
        onSelect(json.banks[0].bank_code)
      }
    }
    load().catch(console.error)
  }, [onSelect])

  function choose(v: string) {
    setSelected(v)
    onSelect(v)
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="font-medium mb-4">Payment Method</h2>
      <RadioGroup value={selected} onValueChange={choose} className="space-y-4">
        {/* <div className="flex items-center space-x-3 border p-4 rounded">
          <RadioGroupItem value="COD" id="cod" />
          <Label htmlFor="cod" className="flex items-center">
            <CreditCard className="mr-2" /> Cash on Delivery
          </Label>
        </div> */}
        {banks.map(b => (
          <div key={b.bank_code} className="flex items-center space-x-3 border p-4 rounded">
            <RadioGroupItem value={b.bank_code} id={b.bank_code} />
            <Label htmlFor={b.bank_code} className="flex items-center">
              <CreditCard className="mr-2" /> {b.name}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
