import {
  CommandHandler,
  Message,
  createElement,
  useDescription,
  useButton,
  Row,
  Button,
  useString,
  useDefaultPermission,
} from "slshx";
import { addRole, getGuildUser, removeRole } from "../utils/helpers";

// -------------------------------
// REPLACE WITH YOUR OWN ROLE IDs
// -------------------------------
let teams: Array<string> = [
  //role id
  "1234567890123456789",
  "1234567890123456789",
  "...",
];

export function send(): CommandHandler<Env> {
  useDefaultPermission(false);
  useDescription("✉️ send the team selector yuh");
  const content = useString("content", "message content");
  const label = useString("label", "button label");

  const teamButton = useButton(async (interaction, env: Env) => {
    const Index = (await env.KV.get("teams:index" as string)) || "-1";
    let newIndex: number = parseInt(Index) + 1;

    const userIndex = await env.KV.get(
      `users:${interaction.member?.user.id}` as string
    );
    if (userIndex) newIndex = parseInt(userIndex);

    await env.KV.put("teams:index" as string, newIndex.toString() as string);

    const user = await getGuildUser(
      interaction.member?.user.id as string,
      interaction.guild_id as string,
      env as Env
    );
    if (user === null) return;
    const roles: Array<string> = user.roles;

    for (const role of Object.values(teams)) {
      if (roles.includes(role)) {
        await removeRole(
          interaction.member?.user.id as string,
          interaction.guild_id as string,
          role as string,
          "[TEAMS] Removed from team." as string,
          env as Env
        );
        return <Message ephemeral>You have left {`<@&${role}>`}</Message>;
      }
    }

    await addRole(
      interaction.member?.user.id as string,
      interaction.guild_id as string,
      Object.values(teams)[newIndex] as string,
      "[TEAMS] Added to team." as string,
      env as Env
    );

    if (!userIndex)
      await env.KV.put(
        `users:${interaction.member?.user.id}` as string,
        newIndex.toString() as string
      );

    return (
      <Message ephemeral>
        You have joined {`<@&${Object.values(teams)[newIndex]}>`}
      </Message>
    );
  });

  return () => (
    <Message>
      {(content as string) || "Click the button below to join a team!"}
      <Row>
        <Button id={teamButton}>{(label as string) || "🪴"}</Button>
      </Row>
    </Message>
  );
}
