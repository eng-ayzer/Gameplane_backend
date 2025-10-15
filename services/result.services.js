// services/result.services.js
import prisma from "../lib/prisma.js";

export async function getAllResults() {
  return await prisma.result.findMany({
    include: {
      fixture: {
        include: {
          league: true,
          homeTeam: true,
          awayTeam: true,
          venue: true,
          referee: true
        }
      }
    },
    orderBy: { fixture: { match_date: "desc" } }
  });
}

export async function getResultById(id) {
  const result = await prisma.result.findUnique({
    where: { result_id: id },
    include: {
      fixture: {
        include: {
          league: true,
          homeTeam: true,
          awayTeam: true,
          venue: true,
          referee: true
        }
      }
    }
  });
  if (!result) throw new Error("Result not found");
  return result;
}

export async function getResultByFixture(fixtureId) {
  const result = await prisma.result.findUnique({
    where: { fixture_id: fixtureId },
    include: {
      fixture: {
        include: {
          league: true,
          homeTeam: true,
          awayTeam: true,
          venue: true,
          referee: true
        }
      }
    }
  });
  if (!result) throw new Error("Result not found for this fixture");
  return result;
}

export async function getResultsByLeague(leagueId) {
  return await prisma.result.findMany({
    where: {
      fixture: {
        league_id: leagueId
      }
    },
    include: {
      fixture: {
        include: {
          league: true,
          homeTeam: true,
          awayTeam: true,
          venue: true,
          referee: true
        }
      }
    },
    orderBy: { fixture: { match_date: "desc" } }
  });
}

export async function getResultsByTeam(teamId) {
  return await prisma.result.findMany({
    where: {
      fixture: {
        OR: [
          { home_team_id: teamId },
          { away_team_id: teamId }
        ]
      }
    },
    include: {
      fixture: {
        include: {
          league: true,
          homeTeam: true,
          awayTeam: true,
          venue: true,
          referee: true
        }
      }
    },
    orderBy: { fixture: { match_date: "desc" } }
  });
}

export async function createResult(data) {
  // Check if fixture exists and is completed
  const fixture = await prisma.fixture.findUnique({
    where: { fixture_id: data.fixture_id },
    include: { result: true }
  });

  if (!fixture) throw new Error("Fixture not found");
  if (fixture.result) throw new Error("Result already exists for this fixture");
  if (fixture.status !== "Completed") {
    throw new Error("Cannot create result for non-completed fixture");
  }

  // Validate scores
  if (data.home_score < 0 || data.away_score < 0) {
    throw new Error("Scores cannot be negative");
  }

  return await prisma.result.create({
    data: {
      fixture_id: data.fixture_id,
      home_score: data.home_score,
      away_score: data.away_score,
      report: data.report || null
    },
    include: {
      fixture: {
        include: {
          league: true,
          homeTeam: true,
          awayTeam: true,
          venue: true,
          referee: true
        }
      }
    }
  });
}

export async function updateResult(id, data) {
  try {
    return await prisma.result.update({
      where: { result_id: id },
      data: {
        home_score: data.home_score,
        away_score: data.away_score,
        report: data.report
      },
      include: {
        fixture: {
          include: {
            league: true,
            homeTeam: true,
            awayTeam: true,
            venue: true,
            referee: true
          }
        }
      }
    });
  } catch (err) {
    if (err.code === "P2025") throw new Error("Result not found");
    throw new Error(err.message);
  }
}

export async function updateResultByFixture(fixtureId, data) {
  try {
    return await prisma.result.update({
      where: { fixture_id: fixtureId },
      data: {
        home_score: data.home_score,
        away_score: data.away_score,
        report: data.report
      },
      include: {
        fixture: {
          include: {
            league: true,
            homeTeam: true,
            awayTeam: true,
            venue: true,
            referee: true
          }
        }
      }
    });
  } catch (err) {
    if (err.code === "P2025") throw new Error("Result not found for this fixture");
    throw new Error(err.message);
  }
}

export async function deleteResult(id) {
  try {
    return await prisma.result.delete({
      where: { result_id: id }
    });
  } catch (err) {
    if (err.code === "P2025") throw new Error("Result not found");
    throw new Error(err.message);
  }
}

export async function deleteResultByFixture(fixtureId) {
  try {
    return await prisma.result.delete({
      where: { fixture_id: fixtureId }
    });
  } catch (err) {
    if (err.code === "P2025") throw new Error("Result not found for this fixture");
    throw new Error(err.message);
  }
}

// Helper function to create result and update fixture status in one transaction
export async function createResultAndUpdateFixture(fixtureId, resultData) {
  return await prisma.$transaction(async (tx) => {
    // Update fixture status to completed
    const fixture = await tx.fixture.update({
      where: { fixture_id: fixtureId },
      data: { status: "Completed" }
    });

    // Create result
    const result = await tx.result.create({
      data: {
        fixture_id: fixtureId,
        home_score: resultData.home_score,
        away_score: resultData.away_score,
        report: resultData.report || null
      },
      include: {
        fixture: {
          include: {
            league: true,
            homeTeam: true,
            awayTeam: true,
            venue: true,
            referee: true
          }
        }
      }
    });

    return result;
  });
}


