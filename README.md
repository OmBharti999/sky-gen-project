This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## API Endpoints

This project includes the following API endpoints:

### Summary

- **Endpoint**: `/api/summary`
- **Description**: Provides current quarter revenue, target, gap percentage, and quarter-over-quarter change.

### Revenue Drivers

- **Endpoint**: `/api/drivers`
- **Description**: Explains performance using pipeline size, win rate, average deal size, and sales cycle time.

### Risk Factors

- **Endpoint**: `/api/risk-factors`
- **Description**: Identifies stale deals, underperforming reps, and low-activity accounts.

### Recommendations

- **Endpoint**: `/api/recommendations`
- **Description**: Returns actionable suggestions to improve sales performance.

### Revenue Trends

- **Endpoint**: `/api/revenue-trend`
- **Description**: Returns the last N calendar months of revenue (closed won deals), the same month(s) from the previous year for YoY comparison, and the monthly targets. Useful for building sparkline charts and month-over-month trend views.
- **Query params**:
  - `months` (optional): number of months to return (1-12). Defaults to `6`.
- **Response shape**:
  ```json
  {
    "data": [
      { "month": "Oct", "revenue": 35000, "prevRevenue": 32000, "target": 40000 },
      ...
    ],
    "status": "success"
  }
  ```


<!-- Resources  -->

https://mui.com/material-ui/integrations/nextjs/

<!-- Steps To replicate Database -->

// target
// rep
// account
// deal
// activity

Renamed some enums
'Mid-Market' => MidMarket, 'Closed Won' => ClosedWon and 'Closed Lost' is named as ClosedLost


Pipeline usually means:
👉 Open deals currently in pipeline
NOT deals created in that quarter.

If you filter by created_at, you might miss old open deals.

Better logic for pipeline value:

const pipeLineDeals = await prisma.deal.findMany({
  where: {
    closed_at: null,
    stage: {
      notIn: [DealStage.ClosedWon, DealStage.ClosedLost],
    },
  },
});