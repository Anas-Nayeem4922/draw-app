import { User } from "@/app/generated/prisma";
import { authOptions } from "@/lib/options";
import { client } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;
    if (!session || !session.user) {
        return Response.json({
            message: "User not logged in",
        });
    }
    try {
        const userId = user.id;
        const rooms = await client.room.findMany({
            where: {
                userId,
            },
        });
        return Response.json({
            message: rooms,
        });
    } catch (err) {
        return Response.json(
            {
                message: "Error in getting all the rooms",
            },
            { status: 500 }
        );
    }
}
