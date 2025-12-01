import React, { useRef } from "react";

interface BXBMenuProps {
  currentUser: {
    name: string;
    avatar: string;
  };
  logout: () => void;
  shut: (e: React.MouseEvent<HTMLLIElement>) => void;
  restart: (e: React.MouseEvent<HTMLLIElement>) => void;
  sleep: (e: React.MouseEvent<HTMLLIElement>) => void;
  toggleBXBMenu: () => void;
  btnRef: React.RefObject<HTMLDivElement>;
}

export default function BXBMenu({
  currentUser,
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
      {/* ⭐ CURRENT USER BLOCK ⭐ */}
      <MenuItemGroup border={false}>
        <div className="flex items-center gap-3 px-3 py-2">
          <img
            src={currentUser.avatar}
            className="w-8 h-8 rounded-full object-cover"
            alt="avatar"
          />
          <span className="text-white text-sm">{currentUser.name}</span>
        </div>
      </MenuItemGroup>

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
        <MenuItem onClick={logout}>Log Out {currentUser.name}…</MenuItem>
      </MenuItemGroup>

      <MenuItemGroup>
        <MenuItem onClick={logout}>Quit</MenuItem>
      </MenuItemGroup>
    </div>
  );
}
