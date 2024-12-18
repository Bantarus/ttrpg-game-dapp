import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Add a type to identify which pages should not use the dashboard layout
type NextPageWithLayout = {
  disableDashboard?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: AppProps["Component"] & NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // If the page has disableDashboard set to true, don't wrap it in the dashboard layout
  if (Component.disableDashboard) {
    return <Component {...pageProps} />;
  }

  return (
    <DashboardLayout>
      <Component {...pageProps} />
    </DashboardLayout>
  );
}
