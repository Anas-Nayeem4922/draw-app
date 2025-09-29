import { z } from "zod";

export const roomSchema = z.object({
    roomDetail: z.string().min(5),
});
