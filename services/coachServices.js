import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

// Get all coaches
export const getAllCoaches = async () => {
  const coaches = await prisma.coach.findMany({
    include: {
      team: {
        select: {
          team_id: true,
          name: true,
          league: {
            select: {
              league_id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  // Remove password before returning
  return coaches.map(c => {
    const { password, ...rest } = c;
    return rest;
  });
};

// Get coach dashboard: coach profile + team + players (for logged-in coach)
export const getCoachDashboard = async (coachId) => {
  const coach = await prisma.coach.findUnique({
    where: { coach_id: coachId },
    include: {
      team: {
        include: {
          league: true,
          players: true
        }
      }
    }
  });

  if (!coach) {
    throw new Error("Coach not found");
  }

  const { password, ...safeCoach } = coach;
  return safeCoach;
};

// Get coach by ID
export const getCoachById = async (id) => {
  const coach = await prisma.coach.findUnique({
    where: { coach_id: id },
    include: {
      team: {
        select: {
          team_id: true,
          name: true,
          league: {
            select: {
              league_id: true,
              name: true
            }
          }
        }
      }
    }
  });
  
  if (!coach) {
    throw new Error("Coach not found");
  }

  const { password, ...safeCoach } = coach;
  return safeCoach;
};

// Get coaches by team
export const getCoachesByTeam = async (teamId) => {
  const coaches = await prisma.coach.findMany({
    where: { team_id: teamId },
    include: {
      team: {
        select: {
          team_id: true,
          name: true,
          league: {
            select: {
              league_id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  return coaches.map(c => {
    const { password, ...rest } = c;
    return rest;
  });
};

// Create new coach (creates Coach + User so coach can login; email and password required)
export const createCoach = async (coachData) => {
  // Email and password required so coach can login to the system
  if (!coachData.email || !coachData.password) {
    throw new Error("email and password are required so the coach can login to the system");
  }

  // Check if team exists if team_id is provided
  if (coachData.team_id) {
    const team = await prisma.team.findUnique({
      where: { team_id: coachData.team_id }
    });
    
    if (!team) {
      throw new Error("Team not found");
    }
  }

  // Check if email is unique at coach level
  if (coachData.email) {
    const existingCoach = await prisma.coach.findUnique({
      where: { email: coachData.email }
    });
    
    if (existingCoach) {
      throw new Error("Coach with this email already exists");
    }
  }

  // Create Coach + User account (role: COACH) so coach can login
  {
    // Validate minimal user fields
    if (!coachData.first_name || !coachData.last_name) {
      throw new Error("first_name and last_name are required when creating a login for a coach");
    }

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: coachData.email } });
    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(coachData.password, saltRounds);

    // Use a transaction so both User and Coach are created atomically
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: coachData.first_name,
          lastName: coachData.last_name,
          email: coachData.email,
          password: hashedPassword,
          role: "COACH"
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      // Prepare coach payload: include hashed password in coach record as well
      const { password, ...coachPayloadPartial } = coachData;
      const coachPayload = { ...coachPayloadPartial, password: hashedPassword };

      const coach = await tx.coach.create({
        data: coachPayload,
        include: {
          team: {
            select: {
              team_id: true,
              name: true,
              league: {
                select: {
                  league_id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      return { user, coach };
    });

    // Remove password before returning
    const { password: _p, ...safeCoach } = result.coach;

    return { createdUser: result.user, coach: safeCoach };
  }
};

// Update coach (syncs email/password with User when applicable)
export const updateCoach = async (id, updateData) => {
  // Check if coach exists
  const existingCoach = await prisma.coach.findUnique({
    where: { coach_id: id }
  });
  
  if (!existingCoach) {
    throw new Error("Coach not found");
  }

  // Validate team if changing
  if (updateData.team_id) {
    const team = await prisma.team.findUnique({
      where: { team_id: updateData.team_id }
    });
    
    if (!team) {
      throw new Error("Team not found");
    }
  }

  // If updating email or password, attempt to update the linked User record
  const shouldUpdateUser = Boolean(updateData.email || updateData.password);

  if (shouldUpdateUser) {
    return await prisma.$transaction(async (tx) => {
      // If changing email, check uniqueness on coach and user tables
      if (updateData.email && updateData.email !== existingCoach.email) {
        const conflictCoach = await tx.coach.findUnique({ where: { email: updateData.email } });
        if (conflictCoach) throw new Error("Coach with this email already exists");

        const conflictUser = await tx.user.findUnique({ where: { email: updateData.email } });
        if (conflictUser) throw new Error("User with this email already exists");
      }

      // Update User if one exists for the old email, or create one if new email+password provided and none exists
      let updatedUser = null;
      if (existingCoach.email) {
        const user = await tx.user.findUnique({ where: { email: existingCoach.email } });
        if (user) {
          const userUpdate = {};
          if (updateData.email) userUpdate.email = updateData.email;
          if (updateData.password) userUpdate.password = await bcrypt.hash(updateData.password, 10);
          if (updateData.first_name) userUpdate.firstName = updateData.first_name;
          if (updateData.last_name) userUpdate.lastName = updateData.last_name;

          if (Object.keys(userUpdate).length > 0) {
            updatedUser = await tx.user.update({ where: { id: user.id }, data: userUpdate, select: { id: true, email: true } });
          }
        }
      } else if (updateData.email && updateData.password) {
        // Create a user for this coach if they previously had no email/user
        updatedUser = await tx.user.create({ data: {
          firstName: updateData.first_name || existingCoach.first_name || "",
          lastName: updateData.last_name || existingCoach.last_name || "",
          email: updateData.email,
          password: await bcrypt.hash(updateData.password, 10),
          role: "COACH"
        }, select: { id: true, email: true } });
      }

      // Prepare coach payload and hash coach password if provided
      let coachPayload = { ...updateData };
      if (updateData.password) {
        coachPayload.password = await bcrypt.hash(updateData.password, 10);
      }
      const { password, ...coachPayloadNoPlain } = coachPayload;

      const updatedCoach = await tx.coach.update({
        where: { coach_id: id },
        data: {
          ...coachPayloadNoPlain,
          updated_at: new Date()
        },
        include: {
          team: {
            select: {
              team_id: true,
              name: true,
              league: {
                select: {
                  league_id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      // Remove password before returning
      const { password: _p, ...safeUpdatedCoach } = updatedCoach;
      return { updatedUser, updatedCoach: safeUpdatedCoach };
    });
  }

  // No user sync needed — simple coach update
  // Hash password here if provided and remove plain password before update
  let coachUpdatePayload = { ...updateData };
  if (updateData.password) {
    coachUpdatePayload.password = await bcrypt.hash(updateData.password, 10);
  }
  const { password, ...coachUpdateSafe } = coachUpdatePayload;

  const updated = await prisma.coach.update({
    where: { coach_id: id },
    data: {
      ...coachUpdateSafe,
      updated_at: new Date()
    },
    include: {
      team: {
        select: {
          team_id: true,
          name: true,
          league: {
            select: {
              league_id: true,
              name: true
            }
          }
        }
      }
    }
  });

  const { password: _p, ...safeUpdated } = updated;
  return safeUpdated;
};

// Delete coach
export const deleteCoach = async (id) => {
  const existingCoach = await prisma.coach.findUnique({
    where: { coach_id: id }
  });
  
  if (!existingCoach) {
    throw new Error("Coach not found");
  }

  // If a User exists for this coach's email, delete it as well (transactional)
  if (existingCoach.email) {
    return await prisma.$transaction(async (tx) => {
      const deletedCoach = await tx.coach.delete({ where: { coach_id: id } });
      const user = await tx.user.findUnique({ where: { email: existingCoach.email } });
      if (user) {
        await tx.user.delete({ where: { id: user.id } });
      }
      return deletedCoach;
    });
  }

  return await prisma.coach.delete({
    where: { coach_id: id }
  });
};
