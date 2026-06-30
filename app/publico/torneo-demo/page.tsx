import Link from "next/link";
import {
  calculateGroupStandings,
  demoTournament,
  formatScore,
  pairName,
  playoffSlots,
  scoreFormatLabels,
} from "@/lib/tournament";
import { getTournamentFromPocketBase } from "@/lib/pocketbase";

export default async function PublicTournamentPage() {
  const tournament = (await getTournamentFromPocketBase()) ?? demoTournament;
  const category = tournament.categories[0];
  const slots = playoffSlots(category);

  if (!tournament.published) {
    return (
      <main className="public-shell">
        <section className="public-empty">
          <p className="eyebrow">Torneo no publicado</p>
          <h1>La informacion todavia no esta disponible.</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="public-shell">
      <section className="public-header">
        <div>
          <p className="eyebrow">{tournament.clubName}</p>
          <h1>{tournament.name}</h1>
          <p>
            {tournament.venue} · {tournament.dateRange}
          </p>
        </div>
        <Link className="button secondary" href="/">
          Organizador
        </Link>
      </section>

      <section className="public-band">
        <div>
          <span>Categoria</span>
          <strong>{category.name}</strong>
        </div>
        <div>
          <span>Formato</span>
          <strong>{scoreFormatLabels[category.scoreFormat]}</strong>
        </div>
        <div>
          <span>Playoff</span>
          <strong>{category.playoffSize} parejas</strong>
        </div>
      </section>

      <section className="public-grid">
        {category.groups.map((group) => (
          <article className="panel" key={group.id}>
            <div className="panel-header">
              <h2>{group.name}</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Pareja</th>
                  <th>Pts</th>
                  <th>PG</th>
                  <th>DG</th>
                </tr>
              </thead>
              <tbody>
                {calculateGroupStandings(category, group).map((row) => (
                  <tr key={row.pairId}>
                    <td>{row.pairName}</td>
                    <td>{row.points}</td>
                    <td>{row.wins}</td>
                    <td>{row.gameDiff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        ))}
      </section>

      <section className="public-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Fixture y resultados</h2>
          </div>
          <div className="match-list">
            {category.matches.map((match) => {
              const one = category.pairs.find((pair) => pair.id === match.pairOneId)!;
              const two = category.pairs.find((pair) => pair.id === match.pairTwoId)!;
              return (
                <div className="match-row" key={match.id}>
                  <div>
                    <strong>
                      {pairName(one)} vs {pairName(two)}
                    </strong>
                    <span>
                      {match.court} · {match.startTime}
                    </span>
                  </div>
                  <em>{formatScore(match)}</em>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Playoff</h2>
          </div>
          <div className="bracket-grid public">
            {Array.from({ length: category.playoffSize }, (_, index) => {
              const slot = slots[index];
              return (
                <div className="slot" key={index}>
                  <span>Seed {index + 1}</span>
                  <strong>{slot?.pairName ?? "Por definir"}</strong>
                  <em>{slot?.source ?? "Pendiente"}</em>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </main>
  );
}
