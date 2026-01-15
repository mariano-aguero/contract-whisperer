# Contract Whisperer 🔮

A modern dApp that analyzes Ethereum smart contracts using artificial intelligence (Claude AI) to provide clear explanations, identify security risks, detect scams, and analyze transactions.

## ✨ Features

### Core Analysis
- 🤖 **AI-Powered Analysis**: Uses Claude AI (Anthropic) to analyze contracts and explain their functionality in simple language
- 🔍 **Risk Identification**: Detects dangerous functions, scam patterns, centralization issues, and vulnerabilities
- 📊 **Function Analysis**: Explains the main contract functions with clear descriptions
- 📜 **Transaction History**: Shows the latest contract transactions with status indicators

### Security Analysis
- 🛡️ **Advanced Security Detection**: Comprehensive threat detection system that identifies:
  - **Honeypots**: Tokens you can buy but cannot sell
  - **Scam Tokens**: General fraudulent tokens designed to steal funds
  - **Rug Pulls**: Contracts where teams can withdraw liquidity or dump supply
  - **Malicious/Backdoor**: Hidden owner-controlled functions and backdoors
  - **Fake Tokens**: Impersonation tokens copying legitimate projects
  - **Soft Rugs**: Abusive practices like excessive taxes or hidden unlocks
- 📊 **Security Gauge**: Visual risk score indicator (0-100) with color-coded threat levels
- ✅ **Contract Verification**: Checks if contracts are verified on blockchain explorers

### Smart Contract Support
- 🔄 **Proxy Contract Detection**: Automatically detects and analyzes both proxy and implementation contracts
- 🪙 **ERC20 Token Support**: Identifies ERC20 tokens and displays token information (name, symbol, decimals, total supply)
- 🌐 **Multi-Network**: Supports Ethereum mainnet and Base network

### User Interface
- 🎨 **Modern UI**: Beautiful interface built with Tailwind CSS and shadcn/ui
- 🌓 **Dark/Light Mode**: Toggle between dark and light themes
- ⚡ **Loading States**: Skeleton screens for better user experience
- 🎯 **Color-Coded Indicators**: Risk levels and transaction statuses with appropriate colors

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **UI Components**: Radix UI
- **Blockchain**: viem for Ethereum interactions
- **APIs**:
  - Etherscan/Basescan API to fetch verified code
  - Anthropic API (Claude) for intelligent analysis
- **Validation**: Zod
- **Server Actions**: next-safe-action

## 📋 Prerequisites

- Node.js 18+ or higher
- npm, pnpm or yarn
- API Keys:
  - Anthropic API Key (for Claude AI)
  - Etherscan API Key
  - Basescan API Key (optional)

## 🚀 Installation

1. **Clone the repository** (or navigate to the project directory)

```bash
cd contract-whisperer
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Configure environment variables**

Copy the `.env.example` file to `.env` and fill in the API keys:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
```

### Getting API Keys

- **Anthropic API**: [https://console.anthropic.com/](https://console.anthropic.com/)
- **Etherscan API**: [https://etherscan.io/apis](https://etherscan.io/apis)
- **Basescan API**: [https://basescan.org/apis](https://basescan.org/apis)

4. **Run in development mode**

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
contract-whisperer/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Main layout
│   │   ├── page.tsx                 # Main page
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   └── ui/                      # shadcn UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── tabs.tsx
│   │       └── ...
│   ├── features/
│   │   └── contract-analyzer/       # Contract analysis feature
│   │       ├── actions.ts           # Server Actions
│   │       ├── types.ts             # TypeScript types
│   │       └── components/          # Feature components
│   │           ├── contract-analyzer.tsx
│   │           └── analysis-results.tsx
│   └── lib/                         # Utilities and configuration
│       ├── utils.ts                 # General utilities
│       ├── env.ts                   # Env vars validation
│       ├── safe-action.ts           # Server actions client
│       ├── etherscan.ts             # Etherscan integration
│       └── anthropic.ts             # Claude AI integration
├── .env.example                     # Environment variables example
├── tailwind.config.ts               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Project dependencies
```

## 🎯 Usage

1. **Enter a contract address**: Paste the address of a verified contract on Etherscan or Basescan
2. **Select the network**: Choose between Ethereum mainnet or Base
3. **Analyze**: Click "Analyze Contract" and wait for the results
4. **Explore the results**:
   - **Risks**: Review identified security risks
   - **Functions**: Explore main functions with explanations
   - **Transactions**: Check recent transaction history

## 🏗️ Architecture

### Feature-Based Architecture

The project follows a feature-based architecture, where each functionality is organized in its own module with components, actions, types, and related logic.

### Server Actions

Uses Next.js Server Actions with `next-safe-action` for input validation with Zod and consistent error handling.

### Type Safety

Strict TypeScript throughout the project with runtime validation using Zod to ensure end-to-end type safety.

## 🔒 Security

- ✅ Ethereum address validation with `viem`
- ✅ Input validation with Zod schemas
- ✅ Environment variables validated at runtime
- ✅ Server Actions for sensitive logic
- ✅ API keys not exposed to the client

## 🎨 Customization

### Theme

Colors and styles can be customized in:
- `tailwind.config.ts`: Tailwind configuration
- `src/app/globals.css`: Theme CSS variables

### Components

shadcn/ui components are in `src/components/ui/` and can be modified directly according to your needs.

## 📝 Available Scripts

```bash
npm run dev          # Run in development mode
npm run build        # Build for production
npm run start        # Run in production mode
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the MIT license.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Anthropic Claude](https://www.anthropic.com/)
- [Etherscan](https://etherscan.io/)
- [viem](https://viem.sh/)

## 📧 Contact

For questions or suggestions, open an issue in the repository.

---

Made with ❤️ using Next.js 15 and Claude AI
