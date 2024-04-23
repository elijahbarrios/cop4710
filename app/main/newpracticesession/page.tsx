import { SubmitButton } from "@/app/components/submitbutton";
import prisma from "@/app/lib/db";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";

export default async function NewEntryRoute() {
    unstable_noStore();
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    async function postPracticeSessionEntry(formData: FormData) {
        "use server";

        if (!user) {
            throw new Error("Error");
        }

        const content = formData.get("content") as string;
        const compositions = formData.getAll("composition") as string[];
        const practiceGroups = formData.getAll("practiceGroup") as string[];
        const duration = formData.get("duration");
        const durationValue = duration ? parseInt(duration.toString(), 10) : 0

        await prisma.practiceSession.create({
            data: {
                userId: user?.id,
                content: content,
                compositions: {
                    connect: compositions.map((id) => ({ id })),
                },
                practiceGroups: {
                    connect: practiceGroups.map((id) => ({ id }))
                },
                duration: durationValue
            },
        });

        return redirect("/main");
    }

    async function getCompositions(userId: string) {
        unstable_noStore();

        const data = await prisma.composition.findMany({
            where: {
                userId: userId,
            },
        });

        return data;
    }

    async function getPracticeGroups() {
        unstable_noStore();

        const data = await prisma.practiceGroup.findMany({
            select: {
                id: true,
                name: true,
            },
        });

        return data;
    }

    const compositions = await getCompositions(user?.id as string);
    const practiceGroups = await getPracticeGroups();

    return (
        <div className="level">
            <div className="level-item has-text-centered">
                <div className="card">
                    <div className="card-header">
                        <div className="card-header-title">
                            New practice session entry
                        </div>
                    </div>

                    <form action={postPracticeSessionEntry}>
                        <div className="card-content">
                            <div className="field">
                                <div className="control">
                                    <textarea
                                        required
                                        name="content"
                                        className="textarea"
                                        placeholder="Begin writing..."
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <div className="control">
                                    <input type="number" name="duration" className="input" placeholder="Duration (in minutes)" />
                                </div>
                            </div>
                            {compositions.length > 0 && (
                                <div>
                                    <label className="label">
                                        Select compositions this entry is for
                                    </label>
                                    {compositions.map((composition) => (
                                        <div className="field" key={composition.id}>
                                            <label className="checkbox">
                                                <input
                                                    name="composition"
                                                    type="checkbox"
                                                    value={composition.id}
                                                />
                                                {composition.name} -{" "}
                                                {composition.composer}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {practiceGroups.length > 0 && (
                                <div>
                                    <label className="label">
                                        Select practice groups to post this
                                        entry in
                                    </label>
                                    {practiceGroups.map((practiceGroup) => (
                                        <div className="field" key={practiceGroup.id}>
                                            <label className="checkbox">
                                                <input
                                                    type="checkbox"
                                                    name="practiceGroup"
                                                    value={practiceGroup.id}
                                                />
                                                {practiceGroup.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
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
