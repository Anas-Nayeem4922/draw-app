import { client } from "@/lib/prisma";
import { authSchema } from "@/schema/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { success, error, data } = authSchema.safeParse(body);
        if (success) {
            const userWithExistingUsername = await client.user.findFirst({
                where: {
                    username: data.username,
                },
            });
            if (userWithExistingUsername)
                return Response.json({
                    message: "User with this username already exists",
                });
            const hashedPassword = await bcrypt.hash(data.password, 3);
            const user = await client.user.create({
                data: {
                    username: data.username,
                    password: hashedPassword,
                },
            });
            return Response.json({
                id: user.id,
                message: "User registered successfully",
            });
        } else {
            return Response.json(
                {
                    message: error,
                },
                { status: 411 }
            );
        }
    } catch (err) {
        return Response.json(
            {
                success: false,
                message: "Error in registering user",
            },
            {
                status: 500,
            }
        );
    }
}
