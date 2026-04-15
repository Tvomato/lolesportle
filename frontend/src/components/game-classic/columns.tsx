import { decode } from "html-entities";
import { Player, Team, ColumnDefinition } from "@/types";

export function getColumnMapping(
  currentPlayer: Player,
  teamMap: Map<string, Team>,
  styles: Record<string, string>
): Record<string, ColumnDefinition> {
  return {
    player: {
      header: "Player",
      render: (value: unknown, player: Player) => {
        const name = value as string;
        return (
          <div className={styles.playerCell} title={decode(name)}>
            <img
              src={player.image_url.split("/revision")[0]}
              alt={decode(name)}
              className={styles.playerImageFill}
            />
          </div>
        );
      },
    },
    nationality: {
      header: "Nationality",
      render: (value: unknown) => {
        const nationality = value as string;
        return (
          <div>
            <span>{nationality}</span>
          </div>
        );
      },
    },
    age: {
      header: "Age",
      render: (value: unknown) => {
        const age = value as number;
        return (
          <div className={styles.ageCell}>
            <span>{age}</span>
            {age !== currentPlayer.age && (
              <img
                src={
                  age < currentPlayer.age
                    ? "/images/up_arrow.png"
                    : "/images/down_arrow.png"
                }
                alt={age < currentPlayer.age ? "Older" : "Younger"}
                className={styles.arrowIcon}
              />
            )}
          </div>
        );
      },
    },
    role: {
      header: "Role",
      render: (value: unknown) => {
        const role = value as string;
        return <span>{role}</span>;
      },
    },
    team_name: {
      header: "Team",
      render: (value: unknown, player: Player) => {
        const teamName = value as string | null;
        const displayName = player.team_name
          ? teamName
          : `No team, prev: ${player.team_last}`;
        return (
          <div className={styles.teamCell} title={displayName ?? ""}>
            {player.team_name ? (
              <img
                src={
                  teamMap
                    .get(player.team_name)
                    ?.logo_url.split("/revision")[0] ?? ""
                }
                alt={teamName ?? ""}
                className={styles.teamImage}
              />
            ) : (
              <span>{displayName}</span>
            )}
          </div>
        );
      },
    },
    trophies: {
      header: "Trophies",
      render: (value: unknown, player: Player) => {
        const trophies = value as number;
        return (
          <div className={styles.trophiesCell}>
            <div>{trophies}</div>
            {/* {player.tournaments_won && (
              <button onClick={() => console.log(player.tournaments_won)}>
                Info
              </button>
            )} */}
            {trophies !== currentPlayer.trophies && (
              <img
                src={
                  trophies < currentPlayer.trophies
                    ? "/images/up_arrow.png"
                    : "/images/down_arrow.png"
                }
                alt={trophies < currentPlayer.trophies ? "More" : "Fewer"}
                className={styles.arrowIcon}
              />
            )}
          </div>
        );
      },
    },
    worlds_appearances: {
      header: "Worlds Appearances",
      render: (value: unknown) => {
        const worlds = value as number;
        return (
          <div className={styles.worldsCell}>
            <span>{worlds}</span>
            {worlds !== currentPlayer.worlds_appearances && (
              <img
                src={
                  worlds < currentPlayer.worlds_appearances
                    ? "/images/up_arrow.png"
                    : "/images/down_arrow.png"
                }
                alt={
                  worlds < currentPlayer.worlds_appearances ? "More" : "Fewer"
                }
                className={styles.arrowIcon}
              />
            )}
          </div>
        );
      },
    },
    tournaments_played: {
      header: "Tournaments Played",
      render: (value: unknown) => {
        const tournaments = value as string[];
        return (
          <div className={styles.tournamentsCell}>
            <div>{tournaments.length}</div>
            {/* <button onClick={() => console.log(tournaments.join(", "))}>
              Info
            </button> */}
            {tournaments.length !==
              currentPlayer.tournaments_played.length && (
                <img
                  src={
                    tournaments.length <
                      currentPlayer.tournaments_played.length
                      ? "/images/up_arrow.png"
                      : "/images/down_arrow.png"
                  }
                  alt={
                    tournaments.length <
                      currentPlayer.tournaments_played.length
                      ? "More"
                      : "Fewer"
                  }
                  className={styles.arrowIcon}
                />
              )}
          </div>
        );
      },
    },
  };
}
