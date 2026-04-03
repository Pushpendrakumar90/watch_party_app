import { connectDB } from "../../../../config/db";
import User from "../../../../models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

      
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

      
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ user }, { status: 200 });

    } catch (error) {
        console.error("Auth Me Error:", error.message);
        return NextResponse.json(
            { message: "Invalid token or session expired" },
            { status: 401 }
        );
    }
}