import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Player } from "./Players";
import { Team } from "./Teams";
import { useFetch } from "@/hooks/useFetch";
import api from "@/lib/axios";
import { League } from "@/lib/types";
import NewMatchForm from "@/components/ui/new-match-form";

type Match = {
  id: number;
  uuid: string;
  date: string;
  time: string;
  is_completed: number;
  player_id: number;
  team_id: number;
  league_id: number;
  created_at: string;
  updated_at: string;
  player: Player;
  team: Team;
  league: League;
};

type LeagueMatch = {
  [key: string]: Match;
};

export type TeamSelect = {
  name: string;
  id: number;
};
export type LeagueSelect = {
  name: string;
  id: number;
};

// External API types
export type ExternalSeason = {
  name: string;
  year: string;
  editor: boolean;
  id: number;
};

export type ExternalRound = {
  round: number;
};

export type ExternalFixture = {
  id: number;
  awayScore: Record<string, unknown>;
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    slug: string;
  };
  homeScore: Record<string, unknown>;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    slug: string;
  };
  startTimestamp: number;
  status: {
    code: number;
    description: string;
    type: string;
  };
  slug: string;
  tournament: {
    name: string;
    slug: string;
    id: number;
  };
  season: {
    name: string;
    year: string;
    id: number;
  };
  roundInfo: {
    round: number;
  };
};

const MatchCreateScreen = () => {
  const [leagues, setLeagues] = useState<LeagueSelect[]>([]);
  const [seasons, setSeasons] = useState<ExternalSeason[]>([]);
  const [rounds, setRounds] = useState<ExternalRound[]>([]);
  const [fixtures, setFixtures] = useState<ExternalFixture[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch leagues from our backend
  useEffect(() => {
    api.get("/admin/leagues").then((res) => {
      const leaguesData = res.data.data?.leagues || res.data.leagues || [];
      setLeagues(
        leaguesData.map(
          (league: { external_id?: number; id: number; name: string }) => ({
            id: league.external_id || league.id,
            name: league.name,
          })
        )
      );
    });
  }, []);

  // Fetch seasons when league is selected
  const handleLeagueChange = async (leagueId: string) => {
    setSelectedLeague(leagueId);
    setSelectedSeason("");
    setSelectedRound("");
    setSeasons([]);
    setRounds([]);
    setFixtures([]);

    if (!leagueId) return;

    try {
      setLoading(true);
      const response = await api.get(
        `https://www.sofascore.com/api/v1/unique-tournament/${leagueId}/seasons`
      );
      setSeasons(response.data.seasons || []);
    } catch (error) {
      console.error("Error fetching seasons:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch rounds when season is selected
  const handleSeasonChange = async (seasonId: string) => {
    setSelectedSeason(seasonId);
    setSelectedRound("");
    setRounds([]);
    setFixtures([]);

    if (!selectedLeague || !seasonId) return;

    try {
      setLoading(true);
      const response = await api.get(
        `https://www.sofascore.com/api/v1/unique-tournament/${selectedLeague}/season/${seasonId}/rounds`
      );
      setRounds(response.data.rounds || []);
    } catch (error) {
      console.error("Error fetching rounds:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch fixtures when round is selected
  const handleRoundChange = async (round: string) => {
    setSelectedRound(round);
    setFixtures([]);

    if (!selectedLeague || !selectedSeason || !round) return;

    try {
      setLoading(true);
      const response = await api.get(
        `https://www.sofascore.com/api/v1/unique-tournament/${selectedLeague}/season/${selectedSeason}/events/round/${round}`
      );
      setFixtures(response.data.events || []);
    } catch (error) {
      console.error("Error fetching fixtures:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NewMatchForm
      leagues={leagues}
      seasons={seasons}
      rounds={rounds}
      fixtures={fixtures}
      selectedLeague={selectedLeague}
      selectedSeason={selectedSeason}
      selectedRound={selectedRound}
      onLeagueChange={handleLeagueChange}
      onSeasonChange={handleSeasonChange}
      onRoundChange={handleRoundChange}
      loading={loading}
    />
  );
};

export default MatchCreateScreen;
