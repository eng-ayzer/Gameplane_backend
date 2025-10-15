import prisma from "../lib/prisma.js";

export async function getAllVenues() {
  return await prisma.venue.findMany({
    include: { fixtures: true },
    orderBy: { name: "asc" },
  });
}

export async function getVenueById(id) {
  if (!id) {
    throw new Error("Venue ID is required");
  }
  
  const venue = await prisma.venue.findUnique({
    where: { venue_id: id },
    include: { fixtures: true },
  });
  if (!venue) throw new Error("Venue not found");
  return venue;
}

export async function createVenue(data) {
  return await prisma.venue.create({
    data: { name: data.name, location: data.location || null },
  });
}

export async function updateVenue(id, data) {
  if (!id) {
    throw new Error("Venue ID is required");
  }
  
  try {
    return await prisma.venue.update({
      where: { venue_id: id },
      data: data,
    });
  } catch (err) {
    if (err.code === "P2025") throw new Error("Venue not found");
    throw err;
  }
}

export async function deleteVenue(id) {
  if (!id) {
    throw new Error("Venue ID is required");
  }
  
  try {
    return await prisma.venue.delete({
      where: { venue_id: id },
    });
  } catch (err) {
    if (err.code === "P2025") throw new Error("Venue not found");
    throw err;
  }
}

