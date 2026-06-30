import Link from "next/link";
import {
  type Category,
  calculateGroupStandings,
  demoTournament,
  formatScore,
  generateBalancedGroups,
  pairName,
  playoffSlots,
  registrationLabels,
  scoreFormatLabels,
  statusLabels,
} from "@/lib/tournament";
import { checkPocketBaseHealth, getTournamentFromPocketBase } from "@/lib/pocketbase";

export default async function Home() {
  const [pocketBaseHealth, pocketBaseTournament] = await Promise.all([
    checkPocketBaseHealth(),
    getTournamentFromPocketBase(),
  ]);
  const tournament = pocketBaseTournament ?? demoTournament;
  const primaryCategory = tournament.categories[0];
  const generatedGroups = generateBalancedGroups(primaryCategory.pairs, 2);
  const confirmedPairs = primaryCategory.pairs.filter((pair) => pair.status === "confirmed");
  const waitlistedPairs = primaryCategory.pairs.filter((pair) => pair.status === "waitlisted");
  const scheduledMatches = primaryCategory.matches
    .filter((match) => match.status === "scheduled")
    .sort((a, b) => a.order - b.order);
  const completedMatches = primaryCategory.matches.filter(
    (match) => match.status === "completed" || match.status === "walkover",
  );
  const slots = playoffSlots(primaryCategory);

  return (
    <main className="app-shell">
      <section className="toolbar">
        <div>
          <p className="eyebrow">{tournament.clubName}</p>
          <h1>{tournament.name}</h1>
          <p className="muted">
            {tournament.venue} · {tournament.dateRange}
          </p>
        </div>
        <div className="toolbar-actions">
          <span className="status-pill">{statusLabels[tournament.status]}</span>
          <Link className="button secondary" href="/publico/torneo-demo">
            Vista publica
          </Link>
          <button className="button">Nuevo torneo</button>
        </div>
      </section>

      <section className="metric-grid" aria-label="Resumen operativo">
        <Metric label="Categorias" value={tournament.categories.length.toString()} />
        <Metric label="Parejas confirmadas" value={confirmedPairs.length.toString()} />
        <Metric label="En lista de espera" value={waitlistedPairs.length.toString()} />
        <Metric label="Partidos cargados" value={primaryCategory.matches.length.toString()} />
      </section>

      <section className="integration-strip" aria-label="Estado de integraciones">
        <div>
          <p className="eyebrow">PocketBase</p>
          <strong>{pocketBaseHealth.reachable ? "Conectado" : "Pendiente"}</strong>
          <span>
            {pocketBaseTournament ? "Mostrando datos de PocketBase." : `${pocketBaseHealth.message} Usando demo local.`}
          </span>
        </div>
        <a className="button secondary" href="/api/pocketbase/health">
          Ver health
        </a>
      </section>

      <section className="workbench">
        <aside className="sidebar-panel">
          <div className="section-title">
            <p className="eyebrow">Categorias</p>
            <h2>Configuracion</h2>
          </div>
          {tournament.categories.map((category) => (
            <article className="category-card" key={category.id}>
              <div>
                <h3>{category.name}</h3>
                <p>{scoreFormatLabels[category.scoreFormat]}</p>
              </div>
              <dl>
                <div>
                  <dt>Cupo</dt>
                  <dd>{category.capacity}</dd>
                </div>
                <div>
                  <dt>Playoff</dt>
                  <dd>{category.playoffSize}</dd>
                </div>
                <div>
                  <dt>Grupos</dt>
                  <dd>{category.groups.length}</dd>
                </div>
              </dl>
            </article>
          ))}
        </aside>

        <section className="main-panel">
          <div className="section-title row">
            <div>
              <p className="eyebrow">Operacion</p>
              <h2>{primaryCategory.name}</h2>
            </div>
            <div className="segmented">
              <button>Inscripcion</button>
              <button className="active">Grupos</button>
              <button>Resultados</button>
            </div>
          </div>

          <div className="split-grid">
            <article className="panel">
              <div className="panel-header">
                <h3>Parejas</h3>
                <button className="icon-button" title="Agregar pareja">
                  +
                </button>
              </div>
              <div className="pair-list">
                {primaryCategory.pairs.map((pair) => (
                  <div className="pair-row" key={pair.id}>
                    <div>
                      <strong>{pairName(pair)}</strong>
                      <span>Seed {pair.seed ?? "-"}</span>
                    </div>
                    <em>{registrationLabels[pair.status]}</em>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <h3>Generacion automatica</h3>
                <button className="button compact">Generar</button>
              </div>
              <p className="muted small">
                Distribucion balanceada de parejas confirmadas en 2 grupos. El organizador puede mover parejas despues.
              </p>
              <div className="generated-groups">
                {generatedGroups.map((group) => (
                  <div key={group.id}>
                    <strong>{group.name}</strong>
                    <span>{group.pairIds.length} parejas</span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <section className="group-grid">
            {primaryCategory.groups.map((group) => {
              const standings = calculateGroupStandings(primaryCategory, group);
              return (
                <article className="panel" key={group.id}>
                  <div className="panel-header">
                    <h3>{group.name}</h3>
                    <span className="muted small">{group.pairIds.length} parejas</span>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Pareja</th>
                        <th>Pts</th>
                        <th>PG</th>
                        <th>DS</th>
                        <th>DG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((row) => (
                        <tr key={row.pairId}>
                          <td>
                            {row.pairName}
                            {row.needsReview ? <span className="review">Revision</span> : null}
                          </td>
                          <td>{row.points}</td>
                          <td>{row.wins}</td>
                          <td>{row.setDiff}</td>
                          <td>{row.gameDiff}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </article>
              );
            })}
          </section>

          <section className="split-grid">
            <article className="panel">
              <div className="panel-header">
                <h3>Proximos partidos</h3>
                <button className="button compact secondary">Programar</button>
              </div>
              <div className="match-list">
                {scheduledMatches.map((match) => (
                  <MatchRow category={primaryCategory} key={match.id} matchId={match.id} />
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <h3>Resultados</h3>
                <button className="button compact secondary">Cargar score</button>
              </div>
              <div className="match-list">
                {completedMatches.map((match) => (
                  <MatchRow category={primaryCategory} key={match.id} matchId={match.id} showScore />
                ))}
              </div>
            </article>
          </section>

          <article className="panel">
            <div className="panel-header">
              <h3>Playoff configurable</h3>
              <span className="status-pill">{primaryCategory.playoffSize} parejas</span>
            </div>
            <div className="bracket-grid">
              {Array.from({ length: primaryCategory.playoffSize }, (_, index) => {
                const slot = slots[index];
                return (
                  <div className="slot" key={index}>
                    <span>Seed {index + 1}</span>
                    <strong>{slot?.pairName ?? "Por definir"}</strong>
                    <em>{slot?.source ?? "Clasificacion pendiente"}</em>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function MatchRow({
  category,
  matchId,
  showScore = false,
}: {
  category: Category;
  matchId: string;
  showScore?: boolean;
}) {
  const match = category.matches.find((item) => item.id === matchId)!;
  const pairOne = category.pairs.find((pair) => pair.id === match.pairOneId)!;
  const pairTwo = category.pairs.find((pair) => pair.id === match.pairTwoId)!;
  const winner = category.pairs.find((pair) => pair.id === match.winnerPairId);

  return (
    <div className="match-row">
      <div>
        <strong>
          {pairName(pairOne)} vs {pairName(pairTwo)}
        </strong>
        <span>
          {match.court} · {match.startTime}
        </span>
      </div>
      <em>{showScore ? `${formatScore(match)}${winner ? ` · Gana ${pairName(winner)}` : ""}` : "Programado"}</em>
    </div>
  );
}
