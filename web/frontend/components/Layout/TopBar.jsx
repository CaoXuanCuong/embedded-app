import { TopBar } from "@shopify/polaris";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { toggleMobileNavigation } from "redux/reducers/general.reducer";
import { selectShop } from "redux/reducers/general.reducer";

const LayoutTopBar = () => {
  const dispatch = useDispatch();

  const { name, email } = useSelector(selectShop);
  const handleNavigationToggle = () => {
    dispatch(toggleMobileNavigation());
  };

  const [userMenu, setUserMenu] = useState(false);
  const handleUserMenuToggle = () => {
    setUserMenu((prev) => !prev);
  };

  const userMenuMarkup =
    name && email ? (
      <TopBar.UserMenu
        name={name}
        initials={name.charAt(0).toUpperCase()}
        detail={email}
        open={userMenu}
        onToggle={handleUserMenuToggle}
      />
    ) : null;

  return (
    <TopBar
      showNavigationToggle
      onNavigationToggle={handleNavigationToggle}
      userMenu={userMenuMarkup}
    />
  );
};

export default LayoutTopBar;
