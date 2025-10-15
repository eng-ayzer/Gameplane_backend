// services/fixture.services.js
import prisma from "../lib/prisma.js";

export async function getAllFixtures() {
  return await prisma.fixture.findMany({
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      venue: true,
      referee: true,
      result: true
    },
    orderBy: { match_date: "asc" }
  });
}

export async function getFixtureById(id) {
  const fixture = await prisma.fixture.findUnique({
    where: { fixture_id: id },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      venue: true,
      referee: true,
      result: true
    }
  });
  if (!fixture) throw new Error("Fixture not found");
  return fixture;
}

export async function getFixturesByLeague(leagueId) {
  return await prisma.fixture.findMany({
    where: { league_id: leagueId },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      venue: true,
      referee: true,
      result: true
    },
    orderBy: { match_date: "asc" }
  });
}

export async function getFixturesByTeam(teamId) {
  return await prisma.fixture.findMany({
    where: {
      OR: [
        { home_team_id: teamId },
        { away_team_id: teamId }
      ]
    },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      venue: true,
      referee: true,
      result: true
    },
    orderBy: { match_date: "asc" }
  });
}

export async function getFixturesByDateRange(startDate, endDate) {
  return await prisma.fixture.findMany({
    where: {
      match_date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      venue: true,
      referee: true,
      result: true
    },
    orderBy: { match_date: "asc" }
  });
}

export async function createFixture(data) {
  // Validate that teams exist and belong to the same league
  const homeTeam = await prisma.team.findUnique({
    where: { team_id: data.home_team_id }
  });
  const awayTeam = await prisma.team.findUnique({
    where: { team_id: data.away_team_id }
  });

  if (!homeTeam) throw new Error("Home team not found");
  if (!awayTeam) throw new Error("Away team not found");
  if (homeTeam.league_id !== awayTeam.league_id) {
    throw new Error("Teams must belong to the same league");
  }
  if (data.league_id !== homeTeam.league_id) {
    throw new Error("League ID must match teams' league");
  }

  return await prisma.fixture.create({
    data: {
      league_id: data.league_id,
      home_team_id: data.home_team_id,
      away_team_id: data.away_team_id,
      venue_id: data.venue_id,
      referee_id: data.referee_id,
      match_date: new Date(data.match_date),
      status: data.status || "Scheduled"
    },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      venue: true,
      referee: true,
      result: true
    }
  });
}

export async function updateFixture(id, data) {
  try {
    return await prisma.fixture.update({
      where: { fixture_id: id },
      data: {
        ...data,
        match_date: data.match_date ? new Date(data.match_date) : undefined
      },
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
        venue: true,
        referee: true,
        result: true
      }
    });
  } catch (err) {
    if (err.code === "P2025") throw new Error("Fixture not found");
    throw new Error(err.message);
  }
}

export async function updateFixtureStatus(id, status) {
  try {
    return await prisma.fixture.update({
      where: { fixture_id: id },
      data: { status },
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
        venue: true,
        referee: true,
        result: true
      }
    });
  } catch (err) {
    if (err.code === "P2025") throw new Error("Fixture not found");
    throw new Error(err.message);
  }
}

export async function deleteFixture(id) {
  try {
    return await prisma.fixture.delete({
      where: { fixture_id: id }
    });
  } catch (err) {
    if (err.code === "P2025") throw new Error("Fixture not found");
    if (err.code === "P2003") throw new Error("Cannot delete fixture with existing results");
    throw new Error(err.message);
  }
}


