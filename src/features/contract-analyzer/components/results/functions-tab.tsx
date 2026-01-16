import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import type { ContractFunction } from "../../types"

interface FunctionsTabProps {
  functions: ContractFunction[]
  isProxy?: boolean
  isImplementation?: boolean
  address?: string
}

export function FunctionsTab({
  functions,
  isProxy,
  isImplementation,
  address,
}: FunctionsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Main Functions{" "}
          {isProxy
            ? "(Proxy Contract)"
            : isImplementation
              ? "(Implementation)"
              : ""}
        </CardTitle>
        <CardDescription>
          Contract functions with explanations{" "}
          {address && `at ${address.slice(0, 10)}...`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {functions.map((func, index) => (
            <AccordionItem
              key={index}
              value={`${isImplementation ? "impl-" : ""}function-${index}`}
            >
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm">{func.name}</code>
                  <Badge variant="outline" className="text-xs">
                    {func.stateMutability}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <p className="text-sm">{func.description}</p>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">Signature:</p>
                    <code className="block rounded bg-muted p-2 text-xs">
                      {func.signature}
                    </code>
                  </div>
                  {func.inputs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold">Parameters:</p>
                      <ul className="space-y-1 text-xs">
                        {func.inputs.map((input, i) => (
                          <li key={i} className="font-mono">
                            {input.name}: {input.type}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {func.outputs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold">Returns:</p>
                      <ul className="space-y-1 text-xs">
                        {func.outputs.map((output, i) => (
                          <li key={i} className="font-mono">
                            {output.name || `output${i}`}: {output.type}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
