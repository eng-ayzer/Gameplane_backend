import prisma from "../lib/prisma.js";

export async function getAllTeams() {
  return await prisma.team.findMany({ 
    include: { 
      league: true,
      players: true,
      homeFixtures: true,
      awayFixtures: true
    }, 
    orderBy: { name: "asc" } 
  });
}

export async function getTeamById(id) {
  if (!id) {
    throw new Error("Team ID is required");
  }
  
  const team = await prisma.team.findUnique({ 
    where: { team_id: id }, 
    include: { 
      league: true,
      players: true,
      homeFixtures: true,
      awayFixtures: true
    } 
  });
  if (!team) throw new Error("Team not found");
  return team;
}

export async function getTeamsByLeague(leagueId) {
  return await prisma.team.findMany({ 
    where: { league_id: leagueId },
    include: { 
      league: true,
      players: true
    },
    orderBy: { name: "asc" }
  });
}

export async function createTeam(data) {
  return await prisma.team.create({ 
    data: { 
      league_id: data.league_id,
      name: data.name,
      home_ground: data.home_ground || null
    } 
  });
}

export async function updateTeam(id, data) {
  if (!id) {
    throw new Error("Team ID is required");
  }
  
  try { 
    return await prisma.team.update({ 
      where: { team_id: id }, 
      data 
    }); 
  }
  catch (err) { 
    if (err.code === "P2025") throw new Error("Team not found"); 
    throw err; 
  }
}

export async function deleteTeam(id) {
  if (!id) {
    throw new Error("Team ID is required");
  }
  
  try { 
    return await prisma.team.delete({ where: { team_id: id } }); 
  }
  catch (err) { 
    if (err.code === "P2025") throw new Error("Team not found"); 
    throw err; 
  }
}
