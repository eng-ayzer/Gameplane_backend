import prisma from "../lib/prisma.js";

export async function getAllReferees() {
  return await prisma.referee.findMany({ include: { fixtures: true }, orderBy: { full_name: "asc" } });
}

export async function getRefereeById(id) {
  const r = await prisma.referee.findUnique({ where: { referee_id: id }, include: { fixtures: true } });
  if (!r) throw new Error("Referee not found");
  return r;
}

export async function createReferee(data) {
  return await prisma.referee.create({ 
    data: 
    { full_name: data.full_name || null, certification_level: data.certification_level || null } });
}

export async function updateReferee(id, data) {
  try { return await prisma.referee.update(
    { where:
       { referee_id: id },
        data }); }
  catch (err) {
     if (err.code === "P2025") 
      throw new Error("Referee not found"); 
    throw err; }
}

export async function deleteReferee(id) {
  try { return await prisma.referee.delete(
    { where: 
      { referee_id: id } 
    }); 
  }
  catch (err) { if (err.code === "P2025") throw new Error("Referee not found"); throw err; }
}

