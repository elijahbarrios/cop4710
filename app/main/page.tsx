import Link from "next/link";
import prisma from "../lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath, unstable_noStore } from "next/cache";
import { useState } from "react";

async function getPracticeSessions(userId: string) {
    unstable_noStore();

    const data = await prisma.practiceSession.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            compositions: true,
        },
    });

    return data;
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

export default async function MainPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const practiceSessions = await getPracticeSessions(user?.id as string);
    const compositions = await getCompositions(user?.id as string);

    async function deletePracticeSessionEntry(formData: FormData) {
        "use server";

        const entryId = formData.get("entryId") as string;

        await prisma.practiceSession.delete({
            where: {
                id: entryId,
            },
        });

        //clears cache so note disappears after clicking delete
        revalidatePath("/main");
    }

    async function deleteCompositionEntry(formData: FormData) {
        "use server";

        const entryId = formData.get("entryId") as string;

        await prisma.composition.delete({
            where: {
                id: entryId,
            },
        });

        //clears cache so note disappears after clicking delete
        revalidatePath("/main");
    }

    // const [search, setSearch] = useState("");

    // function handleSearch(e) {
    //     setSearch(e.target.value)
    // }

    return (
        <div className="columns">
            <div className="column">
                <button className="button is-large">
                    <Link href="main/newpracticesession">
                        Create a new practice session entry
                    </Link>
                </button>
                {/* <form action="">
                    <div className="field">
                        <div className="control">
                            <input
                                className="input"
                                type="text"
                                placeholder="Search notes"
                                value={search}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                </form> */}
                <div className="columns is-vcentered is-multiline">
                    {practiceSessions.length > 0 && (
                        <>
                            {practiceSessions.map((practiceSession) => (
                                <div
                                    className="column is-one-third"
                                    key={practiceSession.id}
                                >
                                    <div className="card">
                                        <div className="card-content">
                                            <div className="content">
                                                {practiceSession.content}
                                                <br />
                                                {practiceSession.duration} minutes
                                                <br />
                                                {new Intl.DateTimeFormat(
                                                    "en-us",
                                                    {
                                                        dateStyle: "full",
                                                        timeStyle: "short",
                                                    }
                                                ).format(
                                                    new Date(
                                                        practiceSession.createdAt
                                                    )
                                                )}
                                                <br />
                                                {practiceSession?.compositions.map(
                                                    (composition) => (
                                                        <span className="tag">
                                                            {composition.name} -{" "}
                                                            {
                                                                composition.composer
                                                            }
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <div className="card-footer-item">
                                                <Link
                                                    href={`/main/newpracticesession/${practiceSession.id}`}
                                                >
                                                    <button className="button">
                                                        Edit
                                                    </button>
                                                </Link>
                                            </div>
                                            <form
                                                action={
                                                    deletePracticeSessionEntry
                                                }
                                                className="card-footer-item"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="entryId"
                                                    value={practiceSession.id}
                                                />
                                                <button className="button">
                                                    Delete
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
            <div className="column">
                <button className="button is-large">
                    <Link href="main/newcomposition">
                        Create a new composition entry
                    </Link>
                </button>
                <div className="columns is-vcentered is-multiline">
                    {compositions.length > 0 && (
                        <>
                            {compositions.map((composition) => (
                                <div
                                    className="column is-one-third"
                                    key={composition.id}
                                >
                                    <div className="card">
                                        <div className="card-content">
                                            <h1 className="title">
                                                {composition.name}
                                            </h1>
                                            <h2 className="subtitle">
                                                {composition.composer}
                                            </h2>
                                            <h2 className="subtitle">
                                                {composition.date}
                                            </h2>
                                        </div>
                                        <div className="card-footer">
                                            <form
                                                action={deleteCompositionEntry}
                                                className="card-footer-item"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="entryId"
                                                    value={composition.id}
                                                />
                                                <button className="button">
                                                    Delete
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
