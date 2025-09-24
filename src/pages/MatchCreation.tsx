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
  external_id: number;
  league_id: number;
  season: string;
  date: string; // ISO date string
  timestamp: number;
  venue_id: number;
  venue_name: string;
  venue_city: string;

  home_team_id: number;
  home_team_name: string;
  home_team_logo: string;

  away_team_id: number;
  away_team_name: string;
  away_team_logo: string;

  status: string;

  goals_home: number;
  goals_away: number;

  score_halftime_home: number;
  score_halftime_away: number;
  score_fulltime_home: number;
  score_fulltime_away: number;

  raw_json: string;

  created_at: string;
  updated_at: string;
};


const MatchCreateScreen = () => {
  const [leagues, setLeagues] = useState<LeagueSelect[]>([]);
  const [seasons, setSeasons] = useState<ExternalSeason[]>([]);
  const [rounds, setRounds] = useState<ExternalRound[]>([]);
  const [fixtures, setFixtures] = useState<ExternalFixture[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [selectedRound, setSelectedRound] = useState<string>("");
  const { data, loading, error, refetch } = useFetch<ExternalFixture[] >("/admin/fixtures");

  // Fetch leagues from our backend
  useEffect(() => {
   // console.log(data)
    setFixtures(data?.data?.fixtures);

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


  return (
    <NewMatchForm
      leagues={leagues}
      fixtures={fixtures}
      selectedLeague={selectedLeague}
      selectedSeason={selectedSeason}
      selectedRound={selectedRound}
      loading={loading}
    />
  );
};

export default MatchCreateScreen;
