import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json(
            { message: "Logout successful" },
            { status: 200 }
        );

        response.cookies.set("token", "", {
            httpOnly: true,
            expires: new Date(0),
            path: "/login",
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { message: "Logout failed", error: error.message },
            { status: 500 }
        );
    }
}