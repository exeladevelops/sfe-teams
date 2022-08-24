import {
  CommandHandler,
  Message,
  createElement,
  useDescription,
  useButton,
  Row,
  Button,
} from "slshx";
import { addRole, getGuildUser, removeRole } from "../utils/helpers";

// -------------------------------
// REPLACE WITH YOUR OWN ROLE IDs
// -------------------------------
const teams: Array<string> = [
  // "role id"
  "123456789012345678",
  "123456789012345678",
];

export function send(): CommandHandler<Env> {
  useDescription("✉️ send the team selector yuh");

  const teamButton = useButton(async (interaction, _env, _ctx) => {
    // @ts-ignore
    const Index = await _env.KV.get("teams:index" as string);
    let newIndex = parseInt(Index) + 1;

    // @ts-ignore
    const userIndex = await _env.KV.get(
      `users:${interaction.member?.user.id}` as string
    );
    if (userIndex) newIndex = parseInt(userIndex);

    // @ts-ignore
    if (!Index || newIndex >= Object.keys(teams).length) {
      // @ts-ignore
      await _env.KV.put("teams:index" as string, "0" as string);
      newIndex = 0;
    } else {
      // @ts-ignore
      await _env.KV.put("teams:index" as string, newIndex.toString() as string);
    }

    const user = await getGuildUser(
      interaction.member?.user.id as string,
      interaction.guild_id as string,
      _env as Env
    );
    if (user === null) return;
    const roles = user.roles;

    for (const role of Object.values(teams)) {
      if (roles.includes(role)) {
        console.log("removing role");
        await removeRole(
          interaction.member?.user.id as string,
          interaction.guild_id as string,
          role,
          "[TEAMS] Removed from team.",
          _env as Env
        );
        return <Message ephemeral>You have left {`<@&${role}>`}</Message>;
      }
    }

    await addRole(
      interaction.member?.user.id as string,
      interaction.guild_id as string,
      Object.values(teams)[newIndex],
      "[TEAMS] Added to team.",
      _env as Env
    );
    // @ts-ignore
    if (!userIndex)
      // @ts-ignore
      await _env.KV.put(
        `users:${interaction.member?.user.id}` as string,
        newIndex.toString() as string
      );

    return (
      <Message ephemeral>
        You have joined {`<@&${Object.values(teams)[newIndex]}>`}
      </Message>
    );
  });

  return (_interaction, _env, _ctx) => (
    <Message>
      Click the button below to join a team!
      <Row>
        <Button id={teamButton} danger>
          shiny red button oooo
        </Button>
      </Row>
    </Message>
  );
}
