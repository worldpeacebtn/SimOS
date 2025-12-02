import React, { useState, useEffect } from "react";
import { apps, wallpapers } from "~/configs";
import { minMarginY } from "~/utils";
import { useStore } from "~/stores";
import type { MacActions } from "~/types";
import Chat from "../components/apps/Chat"; // import your Chat app

interface DesktopProps extends MacActions {
  currentUser: any; // logged-in user from Login
}

interface DesktopState {
  showApps: { [key: string]: boolean };
  appsZ: { [key: string]: number };
  maxApps: { [key: string]: boolean };
  minApps: { [key: string]: boolean };
  maxZ: number;
  showLaunchpad: boolean;
  currentTitle: string;
  hideDockAndTopbar: boolean;
  spotlight: boolean;
}

export default function Desktop(props: DesktopProps) {
  const [state, setState] = useState<DesktopState>({
    showApps: {},
    appsZ: {},
    maxApps: {},
    minApps: {},
    maxZ: 2,
    showLaunchpad: false,
    currentTitle: "Finder",
    hideDockAndTopbar: false,
    spotlight: false
  });

  const [spotlightBtnRef, setSpotlightBtnRef] =
    useState<React.RefObject<HTMLDivElement> | null>(null);

  const { dark, brightness } = useStore((state) => ({
    dark: state.dark,
    brightness: state.brightness
  }));

  // Initialize apps, inject currentUser into Chat
  const getAppsData = () => {
    const showApps: any = {};
    const appsZ: any = {};
    const maxApps: any = {};
    const minApps: any = {};

    apps.forEach((app) => {
      showApps[app.id] = !!app.show;
      appsZ[app.id] = 2;
      maxApps[app.id] = false;
      minApps[app.id] = false;

      // Inject currentUser into Chat
      if (app.id === "chat") {
        app.content = <Chat currentUser={props.currentUser} />;
      }
    });

    setState((prev) => ({ ...prev, showApps, appsZ, maxApps, minApps }));
  };

  useEffect(() => {
    getAppsData();
  }, [props.currentUser]);

  const toggleLaunchpad = (target: boolean) => {
    const r = document.querySelector(`#launchpad`) as HTMLElement;
    if (r) {
      r.style.transform = target ? "scale(1)" : "scale(1.1)";
      r.style.transition = target ? "ease-in 0.2s" : "ease-out 0.2s";
    }
    setState((prev) => ({ ...prev, showLaunchpad: target }));
  };

  const toggleSpotlight = () =>
    setState((prev) => ({ ...prev, spotlight: !prev.spotlight }));

  const setWindowPosition = (id: string) => {
    const r = document.querySelector(`#window-${id}`) as HTMLElement;
    if (!r) return;
    const rect = r.getBoundingClientRect();
    r.style.setProperty("--window-transform-x", `${window.innerWidth + rect.x}px`);
    r.style.setProperty("--window-transform-y", `${rect.y - minMarginY}px`);
  };

  const setAppMax = (id: string, target?: boolean) => {
    const maxApps = { ...state.maxApps };
    maxApps[id] = target === undefined ? !maxApps[id] : target;
    setState((prev) => ({ ...prev, maxApps, hideDockAndTopbar: maxApps[id] }));
  };

  const setAppMin = (id: string, target?: boolean) => {
    const minApps = { ...state.minApps };
    minApps[id] = target === undefined ? !minApps[id] : target;
    setState((prev) => ({ ...prev, minApps }));
  };

  const minimizeApp = (id: string) => {
    setWindowPosition(id);
    const dock = document.querySelector(`#dock-${id}`) as HTMLElement;
    const win = document.querySelector(`#window-${id}`) as HTMLElement;
    if (!dock || !win) return;

    const dockRect = dock.getBoundingClientRect();
    const posX = window.innerWidth + dockRect.x - win.offsetWidth / 2 + 25;
    const posY = window.innerHeight - win.offsetHeight / 2 - minMarginY;

    win.style.transform = `translate(${posX}px, ${posY}px) scale(0.2)`;
    win.style.transition = "ease-out 0.3s";
    setAppMin(id, true);
  };

  const closeApp = (id: string) => {
    const showApps = { ...state.showApps, [id]: false };
    setAppMax(id, false);
    setState((prev) => ({ ...prev, showApps, hideDockAndTopbar: false }));
  };

  const openApp = (id: string) => {
    const showApps = { ...state.showApps, [id]: true };
    const appsZ = { ...state.appsZ };
    const maxZ = state.maxZ + 1;
    appsZ[id] = maxZ;

    const appInfo = apps.find((app) => app.id === id);
    if (!appInfo) throw new TypeError(`App ${id} not found`);

    // Restore minimized app
    const minApps = { ...state.minApps };
    if (minApps[id]) {
      const win = document.querySelector(`#window-${id}`) as HTMLElement;
      if (win) {
        win.style.transform = `translate(${win.style.getPropertyValue("--window-transform-x")}, ${win.style.getPropertyValue("--window-transform-y")}) scale(1)`;
        win.style.transition = "ease-in 0.3s";
      }
      minApps[id] = false;
    }

    setState((prev) => ({
      ...prev,
      showApps,
      appsZ,
      maxZ,
      minApps,
      currentTitle: appInfo.title
    }));
  };

  const renderAppWindows = () => {
    return apps.map((app) => {
      if (app.desktop && state.showApps[app.id]) {
        const propsWindow = {
          id: app.id,
          title: app.title,
          width: app.width,
          height: app.height,
          minWidth: app.minWidth,
          minHeight: app.minHeight,
          aspectRatio: app.aspectRatio,
          x: app.x,
          y: app.y,
          z: state.appsZ[app.id],
          max: state.maxApps[app.id],
          min: state.minApps[app.id],
          close: closeApp,
          setMax: setAppMax,
          setMin: minimizeApp,
          focus: openApp
        };
        return (
          <AppWindow key={app.id} {...propsWindow}>
            {app.content}
          </AppWindow>
        );
      }
      return <div key={app.id} />;
    });
  };

  return (
    <div
      className="size-full overflow-hidden bg-center bg-cover"
      style={{
        backgroundImage: `url(${dark ? wallpapers.night : wallpapers.day})`,
        filter: `brightness(${(brightness as number) * 0.7 + 50}%)`
      }}
    >
      <TopBar
        title={state.currentTitle}
        setLogin={props.setLogin}
        shutMac={props.shutMac}
        sleepMac={props.sleepMac}
        restartMac={props.restartMac}
        toggleSpotlight={toggleSpotlight}
        hide={state.hideDockAndTopbar}
        setSpotlightBtnRef={setSpotlightBtnRef}
      />

      <div className="window-bound z-10 absolute" style={{ top: minMarginY }}>
        {renderAppWindows()}
      </div>

      {state.spotlight && (
        <Spotlight
          openApp={openApp}
          toggleLaunchpad={toggleLaunchpad}
          toggleSpotlight={toggleSpotlight}
          btnRef={spotlightBtnRef as React.RefObject<HTMLDivElement>}
        />
      )}

      <Launchpad show={state.showLaunchpad} toggleLaunchpad={toggleLaunchpad} />

      <Dock
        open={openApp}
        showApps={state.showApps}
        showLaunchpad={state.showLaunchpad}
        toggleLaunchpad={toggleLaunchpad}
        hide={state.hideDockAndTopbar}
      />
    </div>
  );
}
