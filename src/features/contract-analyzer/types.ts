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
