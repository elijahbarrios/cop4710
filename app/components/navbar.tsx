import { Button } from "@/components/ui/button";
import {
    RegisterLink,
    LoginLink,
    LogoutLink
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Link from "next/link";

export async function Navbar() {
    const { isAuthenticated } = getKindeServerSession();

    return (
        <div className="navbar is-info mb-5">
            <div className="navbar-menu">
                <div className="navbar-start">
                    <div className="navbar-item">
                        <button className="button is-info is-light">
                            <Link href='/main'>Notes</Link>
                        </button>
                    </div>
                    <div className="navbar-item">
                        <button className="button is-info is-light">
                            <Link href='/practicegroups'>Practice Groups</Link>
                        </button>
                    </div>
                    <div className="navbar-item"></div>
                </div>
                <div className="navbar-end">
                    {await isAuthenticated ? (
                        <div className="navbar-item">
                            <LogoutLink>
                                <Button className="button is-info is-dark">Log out</Button>
                            </LogoutLink>
                        </div>
                    ) : (
                        <>
                            <LoginLink>
                                <Button>Sign in</Button>
                            </LoginLink>
                            <RegisterLink>
                                <Button>Sign up</Button>
                            </RegisterLink>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
