import { connectDB } from "../../../../config/db";
import User from "../../../../models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        // 3. Generate Token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "7d" }
        );

        // 4. Response
        const response = NextResponse.json(
            { 
                message: "Login successful", 
                user: { id: user._id, username: user.username, email: user.email } 
            },
            { status: 200 }
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });

        return response;

    } catch (err) {
        return NextResponse.json(
            { message: "Login failed", error: err.message },
            { status: 500 }
        );
    }
}