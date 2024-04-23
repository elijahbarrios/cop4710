import { SubmitButton } from "@/app/components/submitbutton";
import prisma from "@/app/lib/db";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath, unstable_noStore } from "next/cache";

async function getEntryData({
    userId,
    entryId,
}: {
    userId: string;
    entryId: string;
}) {
    unstable_noStore();
    const data = await prisma.practiceSession.findUnique({
        where: {
            id: entryId,
            userId: userId,
        },
        select: {
            content: true,
            id: true,
            compositions: true,
            practiceGroups: true,
            duration: true
        },
    });

    return data;
}

export default async function DynamicRoute({
    params,
}: {
    params: { id: string };
}) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const data = await getEntryData({
        userId: user?.id as string,
        entryId: params.id,
    });

    async function updateEntry(formData: FormData) {
        "use server";

        if (!user) throw new Error("Error");
        const content = formData.get("content") as string;
        const duration = formData.get("duration");
        const durationValue = duration ? parseInt(duration.toString(), 10) : 0
        const compositions = formData.getAll("composition") as string[];
        const practiceGroups = formData.getAll("practiceGroup") as string[];

        await prisma.practiceSession.update({
            where: {
                id: data?.id,
                userId: user.id,
            },
            data: {
                content: content,
                compositions: {
                    set: compositions.map((id) => ({ id })),
                },
                practiceGroups: {
                    set: practiceGroups.map((id) => ({ id })),
                },
                duration: durationValue 
            },
        });

        revalidatePath("/main");

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
                            Edit practice session entry
                        </div>
                    </div>

                    <form action={updateEntry}>
                        <div className="card-content">
                            <div className="field">
                                <div className="control">
                                    <textarea
                                        className="textarea"
                                        required
                                        name="content"
                                        placeholder="Begin writing..."
                                        defaultValue={data?.content}
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <div className="control">
                                    <input type="number" name="duration" className="input" placeholder="Duration (in minutes)" defaultValue={data?.duration} />
                                </div>
                            </div>
                            {compositions.length > 0 && (
                                <div>
                                    <label className="label">
                                        Select compositions this entry is for
                                    </label>
                                    {compositions.map((composition) => (
                                        <div
                                            className="field"
                                            key={composition.id}
                                        >
                                            <label className="checkbox">
                                                <input
                                                    name="composition"
                                                    type="checkbox"
                                                    value={composition.id}
                                                    defaultChecked={data?.compositions.some(
                                                        (c) =>
                                                            c.id ===
                                                            composition.id
                                                    )}
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
                                        <div
                                            className="field"
                                            key={practiceGroup.id}
                                        >
                                            <label className="checkbox">
                                                <input
                                                    type="checkbox"
                                                    name="practiceGroup"
                                                    value={practiceGroup.id}
                                                    defaultChecked={data?.practiceGroups.some(
                                                        (c) =>
                                                            c.id ===
                                                            practiceGroup.id
                                                    )}
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
