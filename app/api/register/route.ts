import { NextResponse } from "next/server";
import { hashSync } from "bcrypt-ts";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/app";

interface RegistrationRequest {
    email: string;
    password: string;
    packageType: 'individual' | 'business' | null;
}

export async function POST(request: Request) {
    const body: RegistrationRequest = await request.json();
    const { email, password, packageType } = body;

    const hashedPassword = hashSync(password, 10);
    const docRef = await addDoc(collection(db, "users"), {
        email: email,
        password: hashedPassword,
        type: packageType
    })

    return NextResponse.json({ 
        message: 'Registration successful!',
        userId: docRef.id,
        package: packageType,
    }, { status: 201 });
}