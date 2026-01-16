"use client"

import { cn } from "@/lib/utils"

interface SecurityGaugeProps {
  riskScore: number // 0-100
  overallRisk: "safe" | "low" | "medium" | "high" | "critical"
  className?: string
}

export function SecurityGauge({ riskScore, overallRisk, className }: SecurityGaugeProps) {
  // Calculate needle rotation: -90deg (left/safe) to 90deg (right/critical)
  const rotation = -90 + (riskScore / 100) * 180

  // Get color based on risk level
  const getRiskColor = () => {
    switch (overallRisk) {
      case "safe":
        return "text-green-500"
      case "low":
        return "text-blue-500"
      case "medium":
        return "text-yellow-500"
      case "high":
        return "text-orange-500"
      case "critical":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getRiskLabel = () => {
    switch (overallRisk) {
      case "safe":
        return "Safe"
      case "low":
        return "Low Risk"
      case "medium":
        return "Medium Risk"
      case "high":
        return "High Risk"
      case "critical":
        return "Critical Risk"
      default:
        return "Unknown"
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Gauge Container */}
      <div className="relative h-48 w-full max-w-md">
        {/* Semi-circle gauge background */}
        <svg
          viewBox="0 0 200 120"
          className="h-full w-full"
          style={{ overflow: "visible" }}
        >
          {/* Background arc segments */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="25%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Gauge arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Gauge ticks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = -180 + (tick / 100) * 180
            const radians = (angle * Math.PI) / 180
            const x1 = 100 + 70 * Math.cos(radians)
            const y1 = 100 + 70 * Math.sin(radians)
            const x2 = 100 + 85 * Math.cos(radians)
            const y2 = 100 + 85 * Math.sin(radians)

            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted-foreground"
              />
            )
          })}

          {/* Needle */}
          <g transform={`rotate(${rotation} 100 100)`}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className={getRiskColor()}
            />
            <circle
              cx="100"
              cy="100"
              r="6"
              fill="currentColor"
              className={getRiskColor()}
            />
          </g>

          {/* Center circle */}
          <circle
            cx="100"
            cy="100"
            r="3"
            fill="currentColor"
            className="text-background"
          />
        </svg>

        {/* Labels */}
        <div className="absolute bottom-0 left-0 text-xs text-muted-foreground">
          Safe
        </div>
        <div className="absolute bottom-0 right-0 text-xs text-muted-foreground">
          Critical
        </div>
      </div>

      {/* Risk Score Display */}
      <div className="text-center">
        <div className={cn("text-3xl font-bold", getRiskColor())}>
          {getRiskLabel()}
        </div>
        <div className="text-sm text-muted-foreground">
          Risk Score: {riskScore}/100
        </div>
      </div>
    </div>
  )
}
