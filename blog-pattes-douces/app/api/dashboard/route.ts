import {prisma} from "@/src/db/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const {pseudo, mail, biographie, password} = await request.json();

    