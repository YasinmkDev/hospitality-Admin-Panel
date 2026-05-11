import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";

export const NAVY = "#0B1F3A";
export const NAVY_2 = "#142B4D";
export const GOLD = "#C9A66B";
export const GOLD_SOFT = "#E5CFA4";
export const IVORY = "#F7F4EE";
export const IVORY_2 = "#EFEAE0";
export const INK = "#0E1A2B";

export const STATUS = {
  vacant: "#2E9E6E",
  occupied: "#E26A6A",
  cleaning: "#E0A93E",
  reserved: "#7C5CFF",
  inactive: "#7B8A9B",
};

export const numberToHex = (n?: number) => {
  if (!n) return GOLD;
  return "#" + n.toString(16).padStart(6, "0");
};

export const lightTheme: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: NAVY,
    colorInfo: NAVY,
    colorSuccess: STATUS.vacant,
    colorError: STATUS.occupied,
    colorWarning: STATUS.cleaning,
    colorBgBase: IVORY,
    colorBgLayout: IVORY,
    colorBgContainer: "#FFFFFF",
    colorTextBase: INK,
    borderRadius: 12,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSize: 14,
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: NAVY,
      headerBg: "#FFFFFF",
      bodyBg: IVORY,
      headerHeight: 72,
    },
    Menu: {
      darkItemBg: NAVY,
      darkItemSelectedBg: GOLD,
      darkItemSelectedColor: NAVY,
      darkItemHoverBg: NAVY_2,
      darkSubMenuItemBg: NAVY,
      itemBorderRadius: 10,
    },
    Card: { borderRadiusLG: 16 },
    Button: { borderRadius: 10, controlHeight: 38, fontWeight: 500 },
    Table: { borderRadiusLG: 14, headerBg: "#FAFAF6", headerColor: "#5C6B7A" },
    Tag: { borderRadiusSM: 8 },
    Drawer: { padding: 24 },
    Statistic: { titleFontSize: 13 },
  },
};
