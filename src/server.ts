import helmet from "@fastify/helmet";
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { ReadStream, createReadStream } from "node:fs";
import { basename } from "node:path";
import { getPort } from "./env";
import { verifySharePath } from "./file";
import { schemas } from "./server.schemas";
import { ShareService } from "./share.service";

const contentDisposition = (fileName: string): string => {
  const asciiFallback = fileName
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
};

const server = fastify();

await server.register(helmet);

server.get(
  "/:hash",
  schemas.get,
  (
    request: FastifyRequest<{
      Params: {
        hash: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const sendNotFound = () => reply.status(404).send("not found");

    const hash = request.params.hash;
    const share = ShareService.getByHash(hash);

    if (!share) {
      return sendNotFound();
    }

    if (share.expires_at !== "Never") {
      const expiresAt = new Date(share.expires_at);
      if (Number.isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
        return sendNotFound();
      }
    }

    let resolvedPath: string;
    try {
      resolvedPath = verifySharePath(share.path);
    } catch (error) {
      return sendNotFound();
    }

    let readStream: ReadStream;
    try {
      readStream = createReadStream(resolvedPath);
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
      .header("Content-Disposition", contentDisposition(basename(resolvedPath)))
      .send(readStream);
  }
);

try {
  const address = await server.listen({ port: getPort(), host: "0.0.0.0" });
  console.log(`Server is running on ${address}`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
