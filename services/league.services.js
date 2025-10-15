// services/leagueServices.js
import prisma from "../lib/prisma.js";

export async function getAllLeagues() {
  return await prisma.league.findMany({ 
    include: { teams: true, 
      fixtures: true }, 
        orderBy: { start_date: "desc" } 
      });
}

export async function getLeagueById(id) {
  const league = await prisma.league.findUnique({ 
    where: { league_id: id }, 
      include: { teams: true, 
        fixtures: true } 
      });
  if (!league) throw new Error("League not found");
  return league;
}

export async function createLeague(data) {
  return await prisma.league.create({
    data: { name: data.name, season: data.season || null, start_date: data.start_date ? new Date(data.start_date) : null, end_date: data.end_date ? new Date(data.end_date) : null },
  });
}

export async function updateLeague(id, data) {
  try {
    return await prisma.league.update({ 
      where: { league_id: id }, 
        data 
      });
  } catch (err) {
    if (err.code === "P2025") throw new Error("League not found");
    throw new Error(err.message);
  }
}

export async function deleteLeague(id) {
  try {
    return await prisma.league.delete({ 
      where: { league_id: id } });
  } catch (err) {
    if (err.code === "P2025") throw new Error("League not found");
    throw new Error(err.message);
  }
}
