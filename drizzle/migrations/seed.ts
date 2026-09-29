import bcrypt from "bcryptjs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { users, facilities } from "@/lib/db/schema";

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL is not set in environment.");
    process.exit(1);
  }

  console.log("Seeding database...");
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

    // 1 ADMIN, 2 FACULTY, 1 CONVENOR, 2 STUDENT users
    const userValues = [
      {
        name: "Admin System User",
        email: "admin@slotsync.edu",
        passwordHash: defaultPasswordHash,
        role: "ADMIN" as const,
        department: "IT Administration",
      },
      {
        name: "Dr. Sarah Jenkins",
        email: "faculty1@slotsync.edu",
        passwordHash: defaultPasswordHash,
        role: "FACULTY" as const,
        department: "Computer Science",
      },
      {
        name: "Prof. Alan Turing",
        email: "faculty2@slotsync.edu",
        passwordHash: defaultPasswordHash,
        role: "FACULTY" as const,
        department: "Mathematics",
      },
      {
        name: "Dr. Elena Rostova",
        email: "convenor@slotsync.edu",
        passwordHash: defaultPasswordHash,
        role: "CONVENOR" as const,
        department: "Student Affairs",
      },
      {
        name: "Alex Morgan",
        email: "student1@slotsync.edu",
        passwordHash: defaultPasswordHash,
        role: "STUDENT" as const,
        department: "Computer Science",
      },
      {
        name: "Jordan Lee",
        email: "student2@slotsync.edu",
        passwordHash: defaultPasswordHash,
        role: "STUDENT" as const,
        department: "Electrical Engineering",
      },
    ];

    console.log("Inserting default users...");
    await db.insert(users).values(userValues).onConflictDoNothing();

    // 4 Facilities (Classroom, Seminar Hall, Lab, Sports)
    const facilityValues = [
      {
        name: "Main Academic Block - Room 301",
        type: "classroom",
        location: "Building A, 3rd Floor",
        capacity: 60,
        openingTime: "08:00",
        closingTime: "20:00",
        status: "AVAILABLE" as const,
      },
      {
        name: "Turing Memorial Hall",
        type: "seminar hall",
        location: "Central Block, 2nd Floor",
        capacity: 150,
        openingTime: "09:00",
        closingTime: "21:00",
        status: "AVAILABLE" as const,
      },
      {
        name: "Advanced AI & Computing Lab",
        type: "lab",
        location: "Tech Annex, Room 102",
        capacity: 35,
        openingTime: "08:00",
        closingTime: "22:00",
        status: "AVAILABLE" as const,
      },
      {
        name: "Campus Indoor Gymnasium",
        type: "sports",
        location: "Sports Complex",
        capacity: 100,
        openingTime: "06:00",
        closingTime: "22:00",
        status: "AVAILABLE" as const,
      },
    ];

    console.log("Inserting default facilities...");
    await db.insert(facilities).values(facilityValues).onConflictDoNothing();

    console.log("Database seed completed successfully.");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    await sql.end();
    process.exit(1);
  }
}

seed();
