import { unstable_noStore } from "next/cache";
import prisma from "../../lib/db";
import Link from "next/link";

async function getPracticeGroupPosts(groupid: string) {
    unstable_noStore();

    const data = await prisma.practiceGroup.findUnique({
        where: {
            id: groupid,
        },
        include: {
            practiceSessions: {
                include: {
                    compositions: true,
                    User: true
                },
            },
        },
    });

    return data;
}

export default async function PracticeGroupPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = params;

    const practiceGroupPosts = await getPracticeGroupPosts(id);

    return (
        <div className="columns is-vcentered is-multiline">
            {practiceGroupPosts?.practiceSessions.map((practiceSession) => (
                <>
                    <div
                        className="column is-one-third"
                        key={practiceSession.id}
                    >
                        <div className="card">
                            <div className="card-content">
                                <div className="content">
                                    {practiceSession.content}
                                    <br />
                                    {new Intl.DateTimeFormat("en-us", {
                                        dateStyle: "full",
                                        timeStyle: "short",
                                    }).format(
                                        new Date(practiceSession.createdAt)
                                    )}
                                    <br />
                                    {practiceSession?.compositions.map(
                                        (composition) => (
                                            <span className="tag">
                                                {composition.name} -{" "}
                                                {composition.composer}
                                            </span>
                                        )
                                    )}
                                    <br />
                                    <p>Author: {practiceSession?.User?.name || "Anonymous"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ))}
        </div>
    );
}
