import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Risk } from "../../types"

interface RisksTabProps {
  risks: Risk[]
  isProxy?: boolean
  isImplementation?: boolean
  address?: string
}

export function RisksTab({
  risks,
  isProxy,
  isImplementation,
  address,
}: RisksTabProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      case "low":
        return "success"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Risk Analysis{" "}
          {isProxy
            ? "(Proxy Contract)"
            : isImplementation
              ? "(Implementation)"
              : ""}
        </CardTitle>
        <CardDescription>
          Potential risks identified by AI{" "}
          {address && `at ${address.slice(0, 10)}...`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {risks.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            No significant risks identified
          </div>
        ) : (
          <div className="space-y-4">
            {risks.map((risk, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        risk.level === "high"
                          ? "text-destructive"
                          : risk.level === "medium"
                            ? "text-yellow-500"
                            : "text-blue-500"
                      }`}
                    />
                    <h4 className="font-semibold">{risk.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getRiskColor(risk.level)}>
                      {risk.level}
                    </Badge>
                    <Badge variant="outline">{risk.category}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {risk.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
