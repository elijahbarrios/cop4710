import { SubmitButton } from "@/app/components/submitbutton";
import prisma from "@/app/lib/db";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";

export default async function NewEntryRoute() {
    unstable_noStore();
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    async function postPracticeGroupEntry(formData: FormData) {
        "use server";

        if (!user) {
            throw new Error("Error");
        }

        const connectUser = prisma.user.findUnique({
            where: {
                id: user?.id
            }
        })

        await prisma.practiceGroup.create({
            data: {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                Users: {
                    connect: { id: user?.id }
                },
            },
        });

        return redirect('/practicegroups');
    }

    return (
        <div className="level">
            <div className="level-item has-text-centered">
                <div className="card">
                    <div className="card-header">
                        <div className="card-header-title">New practice group</div>
                    </div>
                    
                    <form action={postPracticeGroupEntry}>
                        <div className="card-content">
                            <div className="field">
                                <div className="control">
                                    <input required name="name" type="text" className="input" placeholder="Name of group"/>
                                </div>
                            </div>
                            <div className="field">
                                <div className="control">
                                    <textarea required name="description" className="textarea" placeholder="Group description"/>
                                </div>
                            </div>
                        </div>
                        <div className="card-footer">
                            <div className="card-footer-item">
                                <button className="button">
                                    <Link href="/practicegroups">Cancel</Link>
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
