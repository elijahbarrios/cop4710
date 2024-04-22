import { SubmitButton } from "@/app/components/submitbutton";
import prisma from "@/app/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";
import { Input } from "@/components/ui/input";

export default async function NewEntryRoute() {
    unstable_noStore();
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    async function postCompositionEntry(formData: FormData) {
        "use server";

        if (!user) {
            throw new Error("Error");
        }

        await prisma.composition.create({
            data: {
                userId: user?.id,
                name: formData.get("name") as string,
                composer: formData.get("composer") as string,
                date: formData.get("date") as string,
            },
        });

        return redirect('/main');
    }

    return (
        <div className="level">
            <div className="level-item has-text-centered">
                <div className="card">
                    <div className="card-header">
                        <div className="card-header-title">New composition entry</div>
                    </div>
                    
                    <form action={postCompositionEntry}>
                        <div className="card-content">
                            <div className="field">
                                <div className="control">
                                    <input required name="name" type="text" className="input" placeholder="Name"/>
                                </div>
                            </div>
                            <div className="field">
                                <div className="control">
                                    <input required name="composer" type="text" className="input" placeholder="Composer"/>
                                </div>
                            </div>
                            <div className="field">
                                <div className="control">
                                    <input required name="date" type="text" className="input" placeholder="Date"/>
                                </div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <div className="card-footer-item">
                                <button className="button">
                                    <Link href="/main">Cancel</Link>
                                </button>
                            </div>
                            <div className="card-footer-item">
                                <SubmitButton />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
