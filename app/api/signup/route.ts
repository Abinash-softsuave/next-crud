import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsers = (await query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    )) as any[];
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Insert new user with role 'user'
    const result = await query(
      "INSERT INTO users (username, password, role, created_at) VALUES (?, ?, ?, NOW())",
      [username, password, "user"]
    );

    return NextResponse.json({
      message: "User created successfully",
      id: (result as any).insertId,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
