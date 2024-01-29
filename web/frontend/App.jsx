import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { Provider } from 'react-redux';
import store from './redux';

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";


export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
  const { t } = useTranslation();

  const navLinksConfig = [
        {
            label: t('NavigationMenu.dashboard'),
            destination: '/',
        },
        {
            label: t('NavigationMenu.replays'),
            destination: '/replays',
        },
        {
            label: t('NavigationMenu.heatmaps'),
            destination: '/heatmaps',
        },
        {
            label: t('NavigationMenu.pageviews'),
            destination: '/pageviews',
        },
        {
            label: t('NavigationMenu.surveys'),
            destination: '/surveys',
        },
        {
            label: t('NavigationMenu.analytics'),
            destination: '/analytics',
        },
        {
            label: t('NavigationMenu.settings'),
            destination: '/settings',
        },
        {
            label: t('NavigationMenu.plans'),
            destination: '/plans',
        },
        {
            label: t('NavigationMenu.feature-requests'),
            destination: '/feature-requests',
        },
        {
            label: t('NavigationMenu.release'),
            destination: '/release',
        },
  ];
  return (
    <Provider store={store}>
        <PolarisProvider>
          <BrowserRouter>
            <AppBridgeProvider>
              <QueryProvider>
                <NavigationMenu
                  navigationLinks={navLinksConfig}
                />
                <Routes pages={pages} />
              </QueryProvider>
            </AppBridgeProvider>
          </BrowserRouter>
        </PolarisProvider>
    </Provider>
  );
}
