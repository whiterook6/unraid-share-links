import helmet from "@fastify/helmet";
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { ReadStream, createReadStream } from "node:fs";
import { basename } from "node:path";
import { getDatabase } from "./database";
import { verifyFile } from "./file";
import { schemas } from "./server.schemas";

const server = fastify();

await server.register(helmet);

server.get(
  "/:hash",
  schemas.get,
  async (
    request: FastifyRequest<{
      Params: {
        hash: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const hash = request.params.hash;
    const database = getDatabase();
    const share = database
      .prepare("SELECT * FROM shares WHERE hash = ?")
      .get(hash) as
      | {
          hash: string;
          path: string;
          created_at: string;
          expires_at: string | null;
        }
      | undefined;

    if (!share) {
      return reply.status(404).send({
        error: "share not found",
      });
    }

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return reply.status(410).send({
        error: "share expired",
      });
    }

    try {
      verifyFile(share.path);
    } catch (error) {
      return reply.status(404).send({
        error: "file not found",
      });
    }

    let readStream: ReadStream;
    try {
      readStream = createReadStream(share.path);
    } catch (error) {
      return reply.status(500).send({
        error: "internal server error",
      });
    }
    if (!readStream) {
      return reply.status(500).send({
        error: "internal server error",
      });
    }

    return reply
      .header(
        "Content-Disposition",
        `attachment; filename="${basename(share.path)}"; filename*=UTF-8''${encodeURIComponent(basename(share.path))}`
      )
      .send(readStream);
  }
);

try {
  const address = await server.listen({ port: 3000, host: "0.0.0.0" });
  console.log(`Server is running on ${address}`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
