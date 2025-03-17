import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";

export default function Home() {
  return null; // No rendering, handled by redirect
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/signin/signin",
        permanent: false,
      },
    };
  }
  return {
    redirect: {
      destination: "/welcome",
      permanent: false,
    },
  };
};