import React from "react";

export interface MacActions {
  setLogin: (val: boolean) => void;
  setAppOpen: (id: string, val: boolean) => void;
  sleepMac: any;
  restartMac: any;
  shutMac: any;
}

export {
  AppsData,
  BunnyMdData,
  BunnyData,
  LaunchpadData,
  MusicData,
  TerminalData,
  UserData,
  WallpaperData,
  WebsitesData,
  SiteSectionData,
  SiteData
} from "./configs";
