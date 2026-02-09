import z from "zod";

export const authSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8).max(100),
});


export const createRoomSchema =  z.object({
    name: z.string().min(3).max(50),
})