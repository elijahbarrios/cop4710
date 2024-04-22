import { redirect } from "next/navigation";
import { Navbar } from "../components/navbar";
import prisma from "../lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ReactNode } from "react";
import { unstable_noStore } from "next/cache";

async function getData({
    email,
    id,
    firstName,
    lastName,
}: {
    email: string;
    id: string;
    firstName: string | undefined | null;
    lastName: string | undefined | null;
}) {

    unstable_noStore();

    const user = await prisma.user.findUnique({
        where: {
            id: id,
        },
        select: {
            id: true,
        },
    });

    if (!user) {
        await prisma.user.create({
            data: {
                id: id,
                email: email,
                name: `${firstName} ${lastName}`,
            },
        });
    }
}

export default async function PracticeGroupsLayout({
    children,
} : {
    children: ReactNode;
}) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user) {
        return (redirect("/"));
    }

    await getData({
        email: user.email as string,
        firstName: user.given_name as string,
        id: user.id as string,
        lastName: user.family_name as string,
    });

    return (
        <>
            <section>
                <Navbar />
            </section>
            <section>{children}</section>
        </>
    );
}
