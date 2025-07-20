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

const MatchCreateScreen = () => {
  const [fixtures, setFixtures] = useState([]);
  const [leagues, setLeagues] = useState([]);
  useEffect(() => {
    api
      .get("/admin/fixtures/")
      .then((res) => setFixtures(res.data.data.fixtures));
    api.get("/admin/match").then((res) => setLeagues(res.data.data.leagues));
  }, []);
  return <NewMatchForm fixtures={fixtures} leagues={leagues} />;
};

export default MatchCreateScreen;
