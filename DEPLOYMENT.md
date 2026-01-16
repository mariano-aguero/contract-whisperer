# Vercel Deployment Guide

This guide details the steps to deploy **Contract Whisperer** on Vercel.

## 🚀 Deployment Steps

The project is currently deployed at: **[https://contract-whisperer-one.vercel.app/](https://contract-whisperer-one.vercel.app/)**

### 1. Prepare the Repository

Make sure your code is in a GitHub, GitLab, or Bitbucket repository.

### 2. Import the Project in Vercel

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click on **"Add New..."** and then on **"Project"**.
3. Select your repository from the list.

### 3. Project Configuration

Vercel will automatically detect that it is a **Next.js** project and that you are using **pnpm**.

- **Framework Preset**: Next.js
- **Build Command**: `next build` (Vercel sets this by default)
- **Install Command**: `pnpm install` (Vercel sets this by default)

### 4. Environment Variables

It is **essential** to configure the following environment variables in Vercel's "Environment Variables" section for the dApp to function correctly:

| Variable            | Description                              | Required      |
| :------------------ | :--------------------------------------- | :------------ |
| `ANTHROPIC_API_KEY` | Your Anthropic API Key (Claude AI)       | Yes           |
| `ETHERSCAN_API_KEY` | Your Etherscan API Key                   | Yes           |
| `BASESCAN_API_KEY`  | Your Basescan API Key (for Base network) | No (Optional) |

### 5. Deploy

Click on **"Deploy"**. Vercel will compile the project and provide you with a public URL.

## 🛠️ Additional Notes

- **Runtime**: The project uses Next.js 16.1.2, which is fully compatible with Vercel's Node.js runtime.
- **Server Actions**: Analysis functions use Server Actions, which work automatically as Serverless Functions on Vercel.
- **Time Limits**: Analyzing complex contracts can take a few seconds. Vercel has a runtime limit for serverless functions (10s on the Hobby plan). If you encounter timeouts, consider optimizing API calls or upgrading to a Pro plan if necessary.
