export interface Trader {
  id: number;
  name: string;
  status: "Активен" | "Оффлайн" | "Заблокирован";
  team: string;
  group: string;
  created: string;
  lastActive: string;
  deals: {
    total: number;
    successful: number;
    profitable: number;
    failed: number;
  };
  deposit: {
    hold: number;
    working: number;
    insurance: number;
  };
  turnover: {
    average: number;
    daily: number;
    perCycle: number;
  };
  percentage: number;
  income: number;
  speed: {
    current: number;
    average: number;
  };
  cycles: {
    total: number;
    current: number;
  };
}

