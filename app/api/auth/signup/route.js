// app/api/auth/signup/route.js

import { connectDB } from "../../../../config/db";
import User from "../../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDB();

        // Check if body exists
        const body = await req.json();
        const { username, email, password } = body;

        if (!username || !email || !password) {
            return NextResponse.json(
                { message: "Sabhi fields bharna zaroori hai!" },
                { status: 400 }
            );
        }

        const userExists = await User.findOne({ 
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] 
        });

        if (userExists) {
            return NextResponse.json(
                { message: "Email ya Username pehle se maujood hai" },
                { status: 400 }
            );
        }

        const newUser = await User.create({
            username,
            email: email.toLowerCase(),
            password 
        });

        return NextResponse.json(
            { message: "Registration successful!", userId: newUser._id },
            { status: 201 }
        );

    } catch (err) {
        // Detailed console logging for you
        console.error("Critical Signup Error:", err.message);
        
        return NextResponse.json(
            { message: "Server connection error", error: err.message },
            { status: 500 }
        );
    }
}