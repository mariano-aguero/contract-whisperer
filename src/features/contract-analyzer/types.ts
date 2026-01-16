export interface ContractAnalysis {
  address: string
  network: "ethereum" | "base"
  summary: string
  risks: Risk[]
  functions: ContractFunction[]
  recentTransactions: Transaction[]
  sourceCode?: string
  contractName?: string
  compiler?: string
  optimization?: boolean
  isProxy?: boolean
  implementation?: ContractImplementation
  isERC20?: boolean
  tokenInfo?: TokenInfo
  securityAnalysis?: SecurityAnalysis
  isVerified?: boolean
}

export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply?: string
}

export interface SecurityAnalysis {
  overallRisk: "safe" | "low" | "medium" | "high" | "critical"
  riskScore: number // 0-100, where 0 is safe and 100 is critical
  threats: SecurityThreat[]
  recommendation: string
}

export interface SecurityThreat {
  type:
    | "honeypot"
    | "scam"
    | "rugpull"
    | "malicious"
    | "backdoor"
    | "fake-token"
    | "soft-rug"
  severity: "low" | "medium" | "high" | "critical"
  confidence: number // 0-100, confidence level of the detection
  description: string
  indicators: string[] // List of specific indicators found
}

export interface ContractImplementation {
  address: string
  summary: string
  risks: Risk[]
  functions: ContractFunction[]
  sourceCode?: string
  contractName?: string
  compiler?: string
  optimization?: boolean
  isVerified?: boolean
}

export interface Risk {
  level: "high" | "medium" | "low"
  title: string
  description: string
  category: "security" | "centralization" | "scam" | "other"
}

export interface ContractFunction {
  name: string
  signature: string
  stateMutability: string
  description: string
  inputs: FunctionInput[]
  outputs: FunctionOutput[]
}

export interface FunctionInput {
  name: string
  type: string
}

export interface FunctionOutput {
  name: string
  type: string
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  method?: string
  status: "success" | "failed"
}

export interface EtherscanContractResponse {
  status: string
  message: string
  result: Array<{
    SourceCode: string
    ABI: string
    ContractName: string
    CompilerVersion: string
    OptimizationUsed: string
    Runs: string
    ConstructorArguments: string
    EVMVersion: string
    Library: string
    LicenseType: string
    Proxy: string
    Implementation: string
    SwarmSource: string
  }>
}

export interface EtherscanABIResponse {
  status: string
  message: string
  result: string
}

export interface EtherscanTransactionResponse {
  status: string
  message: string
  result: Array<{
    blockNumber: string
    timeStamp: string
    hash: string
    from: string
    to: string
    value: string
    gas: string
    gasPrice: string
    isError: string
    txreceipt_status: string
    input: string
    contractAddress: string
    cumulativeGasUsed: string
    gasUsed: string
    confirmations: string
    methodId: string
    functionName: string
  }>
}
