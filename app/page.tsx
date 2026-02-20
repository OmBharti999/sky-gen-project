import { Header } from "./_components/Header";
import { SummaryBanner } from "./_components/SummaryBanner";

export default function Home() {
  return (
    <>
    <Header/>
    <SummaryBanner revenue={750000} target={1000000} />
    </>
  );
}
