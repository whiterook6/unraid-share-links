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
  "/:key",
  schemas.get,
  (
    request: FastifyRequest<{
      Params: {
        key: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const sendNotFound = (message: string = "not found") => reply.status(404).send(message);
    const sendExpired = (message: string = "expired") => reply.status(410).send(message);
    const sendInternalServerError = (error: string = "internal server error") => reply.status(500).send(error);

    const key = request.params.key;
    const database = getDatabase();
    const share = database
      .prepare("SELECT * FROM shares WHERE key = ?")
      .get(key) as
      | {
          key: string;
          filesize: number;
          path: string;
          created_at: string;
          expires_at: string | null;
        }
      | undefined;

    if (!share) {
      return sendNotFound();
    }

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return sendExpired();
    }

    let filesize: number;
    try {
      filesize = verifyFile(share.path);
    } catch (error) {
      return sendNotFound("file not found");
    }

    if (filesize !== share.filesize) {
      return sendExpired("file contents changed");
    }

    let readStream: ReadStream;
    try {
      readStream = createReadStream(share.path);
    } catch (error) {
      return sendInternalServerError();
    }
    if (!readStream) {
      return sendInternalServerError();
    }

    return reply
      .header("Content-Length", filesize)
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
