import type {
  APIChannel,
  APIGuildMember,
  APIMessage,
  Snowflake,
} from "discord-api-types/v10";

const BASE_URL = "https://discord.com/api/v10";

export async function getGuildUser(
  user: Snowflake,
  guild: Snowflake,
  env: Env
): Promise<APIGuildMember> {
  return (await (
    await fetch(`https://discord.com/api/v10/guilds/${guild}/members/${user}`, {
      method: "GET",
      headers: { Authorization: "Bot " + env.TOKEN },
    })
  ).json()) as APIGuildMember;
}

export async function addRole(
  user: Snowflake,
  guild: Snowflake,
  role: Snowflake,
  reason: string,
  env: Env
): Promise<any> {
  const res = await fetch(
    `${BASE_URL}/guilds/${guild}/members/${user}/roles/${role}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${env.TOKEN}`,
        "X-Audit-Log-Reason": reason,
      },
    }
  );

  if (res.status !== 204) {
    throw new Error(`${res.status} ${res.text}`);
  }
}

export async function removeRole(
  user: Snowflake,
  guild: Snowflake,
  role: Snowflake,
  reason: string,
  env: Env
): Promise<any> {
  const res = await fetch(
    `${BASE_URL}/guilds/${guild}/members/${user}/roles/${role}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bot ${env.TOKEN}`,
        "X-Audit-Log-Reason": reason,
      },
    }
  );

  if (res.status !== 204) {
    throw new Error(`${res.status} ${res.text}`);
  }
}

export async function sendDM(
  user: Snowflake,
  content: string,
  env: Env
): Promise<APIMessage> {
  const channel = (await (
    await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: {
        Authorization: env.TOKEN,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        recipient_id: user,
      }),
    })
  ).json()) as APIChannel;
  const message = (await (
    await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
      method: "POST",
      headers: { Authorization: env.TOKEN, "content-type": "application/json" },
      body: JSON.stringify({ content }),
    })
  ).json()) as APIMessage;
  return message;
}

export async function updateUsername(username: string, env: Env): Promise<any> {
  const res = await fetch(`${BASE_URL}/users/@me`, {
    method: "PATCH",
    headers: {
      Authorization: "Bot " + env.TOKEN,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      username: username,
    }),
  });

  if (res.status !== 200) {
    throw new Error(`${res.status} ${res.text}`);
  }

  return username;
}

export async function updateAvatar(
  url: string,
  contentType: string,
  env: Env
): Promise<any> {
  const img = await fetch(url);
  const arrayBuffer = await img.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

  const uri = `data:${contentType};base64,${base64}`;

  const res = await fetch(`${BASE_URL}/users/@me`, {
    method: "PATCH",
    headers: {
      Authorization: "Bot " + env.TOKEN,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      avatar: uri,
    }),
  });

  if (res.status !== 200) {
    throw new Error(`${res.status}`);
  }

  return uri;
}
