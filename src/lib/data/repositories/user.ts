import { prisma } from "@/lib/data/prisma";

export const userRepository = {
  async findByEmail(email: string) {
    return await prisma.users.findUnique({
      where: { email },
    });
  },
};
