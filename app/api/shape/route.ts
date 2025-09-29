import { authOptions } from "@/lib/options";
import { client } from "@/lib/prisma";
import { shapeSchema } from "@/schema/shape";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return Response.json({
            message: "User not logged in",
        });
    }
    try {
        const { searchParams } = new URL(req.url);
        let roomId = searchParams.get("roomId") as string;
        const shapes = await client.shape.findMany({
            where: {
                roomId,
            },
        });
        return Response.json({
            shapes,
        });
    } catch (err) {
        return Response.json(
            {
                message: "Error in getting the shapes",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return Response.json({
            message: "User not logged in",
        });
    }
    try {
        const body = await req.json();
        const { success, error, data } = shapeSchema.safeParse(body);
        if (success) {
            const shape = await client.shape.create({
                data: {
                    name: data.shape,
                    details: data.shapeDetails,
                    roomId: data.roomId,
                },
            });
            return Response.json({
                shape,
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
                message: "Error in getting the shapes",
            },
            { status: 500 }
        );
    }
}
