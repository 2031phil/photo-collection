import { NextResponse } from "next/server";
import crypto from "crypto";

const SEED = "daily-wallpaper-v1";
const START_DATE = new Date("2026-01-01");

function getDayIndex(dateString) {
    const date = new Date(dateString);

    return Math.floor(
        (date.getTime() - START_DATE.getTime()) / 86400000
    );
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const date =
            searchParams.get("date") ||
            new Date().toISOString().slice(0, 10);

        const portraitUrl = new URL(
            "/photo-filters/orientation/portrait.json",
            request.url
        );

        const response = await fetch(portraitUrl, {
            next: { revalidate: 86400 },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to load portrait.json: ${response.status}`
            );
        }

        const portraitIds = await response.json();

        if (!Array.isArray(portraitIds) || portraitIds.length === 0) {
            throw new Error("No portrait images available");
        }

        const cycle = Math.floor(
            getDayIndex(date) / portraitIds.length
        );

        const sortedIds = [...portraitIds].sort((a, b) =>
            crypto
                .createHash("sha256")
                .update(`${SEED}:${cycle}:${a}`)
                .digest("hex")
                .localeCompare(
                    crypto
                        .createHash("sha256")
                        .update(`${SEED}:${cycle}:${b}`)
                        .digest("hex")
                )
        );

        const index =
            ((getDayIndex(date) % sortedIds.length) + sortedIds.length) %
            sortedIds.length;

        const photoId = sortedIds[index];

        return NextResponse.redirect(
            new URL(`/api/photos/${photoId}/large`, request.url)
        );
    } catch (error) {
        console.error("daily-wallpaper error:", error);

        return NextResponse.json(
            { error: "Failed to get wallpaper" },
            { status: 500 }
        );
    }
}