import { Header } from "./_components/Header";
import { RecommendedActions } from "./_components/RecommendedActions";
import { RevenueTrendChart } from "./_components/RevenueTrendChart";
import { SummaryBanner } from "./_components/SummaryBanner";
import { TopRiskFactors } from "./_components/TopRiskFactors";

export default function Home() {
  return (
    <>
      <Header />
      <SummaryBanner revenue={750000} target={1000000} />
      <TopRiskFactors
        items={[
          { id: 1, text: "23 Enterprise deals stuck over 30 days" },
          { id: 2, text: "Rep Ankit – Win Rate: 11%" },
          { id: 3, text: "15 Accounts with no recent activity" },
        ]}
      />
      <RecommendedActions
        items={[
          { id: 1, text: "Focus on aging deals in Enterprise segment" },
          { id: 2, text: "Coach Ankit to improve closing skills" },
          { id: 3, text: "Increase outreach to inactive accounts" },
        ]}
      />
      <RevenueTrendChart
        data={[
          { month: "Oct", revenue: 35, target: 22 },
          { month: "Nov", revenue: 40, target: 38 },
          { month: "Dec", revenue: 37, target: 43 },
          { month: "Jan", revenue: 45, target: 39 },
          { month: "Feb", revenue: 38, target: 42 },
          { month: "Mar", revenue: 46, target: 52 },
        ]}
      />
    </>
  );
}
