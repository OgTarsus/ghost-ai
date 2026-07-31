// import { redirect } from "next/navigation";

// export default function HomePage() {
//   redirect("/editor");
// }



import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/editor");
  }

  redirect("/sign-in");
}