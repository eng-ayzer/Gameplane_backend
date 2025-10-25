import prisma from "../lib/prisma.js";

// Get all coaches
export const getAllCoaches = async () => {
  return await prisma.coach.findMany({
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
  
  return coach;
};

// Get coaches by team
export const getCoachesByTeam = async (teamId) => {
  return await prisma.coach.findMany({
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
};

// Create new coach
export const createCoach = async (coachData) => {
  // Check if team exists if team_id is provided
  if (coachData.team_id) {
    const team = await prisma.team.findUnique({
      where: { team_id: coachData.team_id }
    });
    
    if (!team) {
      throw new Error("Team not found");
    }
  }

  // Check if email is unique if provided
  if (coachData.email) {
    const existingCoach = await prisma.coach.findUnique({
      where: { email: coachData.email }
    });
    
    if (existingCoach) {
      throw new Error("Coach with this email already exists");
    }
  }

  return await prisma.coach.create({
    data: coachData,
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
};

// Update coach
export const updateCoach = async (id, updateData) => {
  // Check if coach exists
  const existingCoach = await prisma.coach.findUnique({
    where: { coach_id: id }
  });
  
  if (!existingCoach) {
    throw new Error("Coach not found");
  }

  // Check if team exists if team_id is being updated
  if (updateData.team_id) {
    const team = await prisma.team.findUnique({
      where: { team_id: updateData.team_id }
    });
    
    if (!team) {
      throw new Error("Team not found");
    }
  }

  // Check if email is unique if being updated
  if (updateData.email && updateData.email !== existingCoach.email) {
    const existingCoachWithEmail = await prisma.coach.findUnique({
      where: { email: updateData.email }
    });
    
    if (existingCoachWithEmail) {
      throw new Error("Coach with this email already exists");
    }
  }

  return await prisma.coach.update({
    where: { coach_id: id },
    data: {
      ...updateData,
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
};

// Delete coach
export const deleteCoach = async (id) => {
  const existingCoach = await prisma.coach.findUnique({
    where: { coach_id: id }
  });
  
  if (!existingCoach) {
    throw new Error("Coach not found");
  }

  return await prisma.coach.delete({
    where: { coach_id: id }
  });
};
