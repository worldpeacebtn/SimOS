import React, { useRef } from "react";

interface BXBMenuProps {
  logout: () => void;
  shut: (e: React.MouseEvent<HTMLLIElement>) => void;
  restart: (e: React.MouseEvent<HTMLLIElement>) => void;
  sleep: (e: React.MouseEvent<HTMLLIElement>) => void;
  toggleBXBMenu: () => void;
  btnRef: React.RefObject<HTMLDivElement>;
}

export default function BXBMenu({
  logout,
  shut,
  restart,
  sleep,
  toggleBXBMenu,
  btnRef
}: BXBMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, toggleBXBMenu, [btnRef]);

  return (
    <div className="menu-box left-2 w-56" ref={ref}>
      <MenuItemGroup>
        <MenuItem>About This App</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup>
        <MenuItem>maximize</MenuItem>
        <MenuItem>minimize</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup border={false}>
        <MenuItem>Change User</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup>
        <MenuItem onClick={logout}>Log Out 0...</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup>
        <MenuItem onClick={logout}>Quit</MenuItem>
      </MenuItemGroup>
    </div>
  );
}
