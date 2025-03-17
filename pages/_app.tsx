import { SessionProvider } from "next-auth/react";

function MyApp({ Component, pageProps }: any) {
  return (
    <SessionProvider session={pageProps.session} refetchInterval={0}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
