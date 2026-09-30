import { DefaultSession } from "next-auth";
import { roleEnum } from "@/lib/db/schema";

export type Role = typeof roleEnum.enumValues[number];

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    id: string;
  }
}
