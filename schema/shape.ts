import { z } from "zod";

export const shapeSchema = z.object({
    shape: z.string(),
    shapeDetails: z.string(),
    roomId: z.string(),
});
