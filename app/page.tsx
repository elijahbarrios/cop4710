import { Button } from "@/components/ui/button";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const {isAuthenticated} = getKindeServerSession();

  if (await isAuthenticated()) return redirect("/main");

  return (
    <section className="hero is-fullheight is-white">
      <div className="hero-body">
        <div className="container has-text-centered">
          <p className="title">
            <RegisterLink>
              <Button className="button is-large is-info">
                Login or register
              </Button>
            </RegisterLink>
          </p>
        </div>
      </div>
    </section>
  )
}