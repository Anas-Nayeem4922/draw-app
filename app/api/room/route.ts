import { User } from "@/app/generated/prisma";
import { authOptions } from "@/lib/options";
import { client } from "@/lib/prisma";
import { roomSchema } from "@/schema/room";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;
    if (!session || !session.user) {
        return Response.json({
            message: "User not logged-in",
        });
    }
    try {
        const userId = user.id;
        const body = await req.json();
        const { success, error, data } = roomSchema.safeParse(body);
        if (success) {
            const room = await client.room.create({
                data: {
                    userId,
                    name: data.roomDetail,
                },
            });
            return Response.json({
                roomId: room.id,
                message: "Room created successfully",
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
        return Response.json({
            message: "Error in creating room",
        });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return Response.json({
            message: "User not logged-in",
        });
    }
    try {
        const { searchParams } = new URL(req.url);
        const roomId = searchParams.get("roomId") as string;
        const room = await client.room.findFirst({
            where: {
                id: roomId,
            },
        });
        if (room)
            return Response.json({
                message: true,
            });
        else
            return Response.json({
                message: "No such room exists",
            });
    } catch (err) {
        return Response.json({
            message: "Error in joining room",
        });
    }
}
