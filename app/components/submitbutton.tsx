"use client";

import { useFormStatus } from "react-dom"

export function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <>
            {pending ? (
                <button className="button" disabled></button>
            ) : (
                <button className="button" type="submit">
                    Save
                </button>
            )}
        </>
    )
}