import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SecurityAnalysis } from "../../types"
import { SecurityGauge } from "../security-gauge"

interface SecurityTabProps {
  securityAnalysis?: SecurityAnalysis
}

export function SecurityTab({ securityAnalysis }: SecurityTabProps) {
  if (!securityAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Analysis</CardTitle>
          <CardDescription>
            Scam, honeypot, and malicious contract detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">
            Security analysis not available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Analysis</CardTitle>
        <CardDescription>
          Scam, honeypot, and malicious contract detection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <SecurityGauge
            riskScore={securityAnalysis.riskScore}
            overallRisk={securityAnalysis.overallRisk}
          />

          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <ShieldAlert className="h-4 w-4" />
              Recommendation
            </h3>
            <p className="text-sm text-muted-foreground">
              {securityAnalysis.recommendation}
            </p>
          </div>

          {securityAnalysis.threats.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Detected Threats</h3>
              {securityAnalysis.threats.map((threat, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          threat.severity === "critical"
                            ? "text-red-500"
                            : threat.severity === "high"
                              ? "text-orange-500"
                              : threat.severity === "medium"
                                ? "text-yellow-500"
                                : "text-blue-500"
                        }`}
                      />
                      <h4 className="font-semibold capitalize">
                        {threat.type.replace("-", " ")}
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          threat.severity === "critical" ||
                          threat.severity === "high"
                            ? "destructive"
                            : threat.severity === "medium"
                              ? "warning"
                              : "outline"
                        }
                      >
                        {threat.severity}
                      </Badge>
                      <Badge variant="outline">
                        {threat.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {threat.description}
                  </p>
                  {threat.indicators.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold">Indicators:</p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {threat.indicators.map((indicator, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            <span>{indicator}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              No security threats detected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
