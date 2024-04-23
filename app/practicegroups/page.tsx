import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { unstable_noStore } from "next/cache";
import prisma from "../lib/db";
import Link from "next/link";

async function getGlobalPracticeGroups() {
    unstable_noStore();

    const data = await prisma.practiceGroup.findMany({
        include: {
            practiceSessions: true
        }
    }) 

    return data
}

export default async function PracticeGroupsPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    const globalPracticeGroups = await getGlobalPracticeGroups();

    return (
        <div className="columns">
            <div className="column">
                <button className="button is-large">
                    <Link href="practicegroups/newpracticegroup">
                        Create a new practice group
                    </Link>
                </button>
                <div className="columns is-vcentered is-multiline">
                    {globalPracticeGroups.length > 0 && (
                        <>
                            {globalPracticeGroups.map((practiceGroup) => (
                                <div className="column is-one-third" key={practiceGroup.id}>
                                    <div className="card">
                                        <Link href={`practicegroups/${practiceGroup.id}`}>
                                            <div className="card-content">
                                                <h1 className="title">{practiceGroup.name}</h1>
                                                <div className="content">
                                                    <p>{practiceGroup.description}</p>
                                                    <br />
                                                    <p>{practiceGroup.practiceSessions.length} practice notes shared</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    )

}
