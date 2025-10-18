import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Player {
  id: number;
  external_id: string;
  name: string;
  team_id: string;
  position: string;
  image: string;
  nationality: string;
  player_rating: number;
  status: number;
  created_at: string;
  updated_at: string;
  // Add more fields as needed
}

const TeamPlayers = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [players, setPlayers] = useState<Player[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    if (!teamId) return;
    setLoading(true);
    api
      .get(`/admin/teams/${teamId}/players?page=${currentPage}`)
      .then((res) => {
        console.log(res)
        setPlayers(res.data.data.players.data);
        setTotalPages(res.data.data.players.last_page);
        setTotalPlayers(res.data.data.players.total);
      })
      .catch(() => setError("Failed to load players."))
      .finally(() => setLoading(false));
  }, [teamId, currentPage]);

  if (loading) return <div>Loading players...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Team Players</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell>{player.id}</TableCell>
                <TableCell>
                  <img
                    src={player.image}
                    alt={player.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </TableCell>
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.position}</TableCell>
                <TableCell>{player?.number ?? "-"}</TableCell>
                <TableCell>{player.nationality}</TableCell>
                <TableCell>{player.player_rating}</TableCell>
                <TableCell>
                  {player.status === 1 ? "Active" : "Inactive"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground px-4">
              Page {currentPage} of {totalPages} (Total: {totalPlayers})
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamPlayers;
