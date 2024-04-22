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

        await prisma.practiceSession.update({
            where: {
                id: data?.id,
                userId: user.id,
            },
            data: {
                content: content,
            },
        });

        revalidatePath("/main");

        return redirect("/main");
    }

    return (
        <form action={updateEntry}>
            Edit entry
            <Textarea
                required
                name="content"
                placeholder="Begin writing..."
                defaultValue={data?.content}
            />
            <Button>
                <Link href="/main">Cancel</Link>
            </Button>
            <SubmitButton />
        </form>
    );
}
