import { TabType } from "@/pages/Home";

interface NavigationTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function NavigationTabs({ activeTab, setActiveTab }: NavigationTabsProps) {
  return (
    <div className="border-b border-border mb-8">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveTab("pools")}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === "pools"
              ? "text-primary border-primary"
              : "text-muted-foreground hover:text-white border-transparent"
          }`}
        >
          Liquidity Pools
        </button>
        <button
          onClick={() => setActiveTab("migrate")}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === "migrate"
              ? "text-primary border-primary"
              : "text-muted-foreground hover:text-white border-transparent"
          }`}
        >
          Migrate Liquidity
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === "history"
              ? "text-primary border-primary"
              : "text-muted-foreground hover:text-white border-transparent"
          }`}
        >
          Transaction History
        </button>
      </nav>
    </div>
  );
}
