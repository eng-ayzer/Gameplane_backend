import prisma from "../lib/prisma.js";

export async function getAllPlayers() {
  return await prisma.player.findMany({ 
    include: { team: true }, 
    orderBy: { first_name: "asc" } 
  });
}

export async function getPlayerById(id) {
  if (!id) {
    throw new Error("Player ID is required");
  }
  
  const player = await prisma.player.findUnique({ 
    where: { player_id: id }, 
    include: { team: true } 
  });
  if (!player) throw new Error("Player not found");
  return player;
}

export async function getPlayersByTeam(teamId) {
  return await prisma.player.findMany({ 
    where: { team_id: teamId },
    include: { team: true },
    orderBy: { jersey_number: "asc" }
  });
}

export async function createPlayer(data) {
  return await prisma.player.create({ 
    data: { 
      team_id: data.team_id,
      first_name: data.first_name || null, 
      last_name: data.last_name || null,
      position: data.position || null,
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
      jersey_number: data.jersey_number || null
    } 
  });
}

export async function updatePlayer(id, data) {
  try { 
    return await prisma.player.update({ 
      where: { player_id: id }, 
      data: {
        ...data,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined
      }
    }); 
  }
  catch (err) { 
    if (err.code === "P2025") throw new Error("Player not found"); 
    throw err; 
  }
}

export async function deletePlayer(id) {
  try { 
    return await prisma.player.delete({ where: { player_id: id } }); 
  }
  catch (err) { 
    if (err.code === "P2025") throw new Error("Player not found"); 
    throw err; 
  }
}
