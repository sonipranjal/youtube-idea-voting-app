import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const votingRouter = createTRPCRouter({
  getAllIdeasWithVotes: publicProcedure.query(async ({ ctx: { db } }) => {
    const getAllIdeasFromDb = await db.videoIdea.findMany({
      select: {
        votes: {
          select: {
            id: true,
            isUpvote: true,
          },
        },
        name: true,
        description: true,
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return { getAllIdeasFromDb };
  }),

  createUpvote: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        videoIdeaId: z.number(),
      }),
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const { userId, videoIdeaId } = input;
      const upvote = await db.vote.create({
        data: {
          userId,
          videoIdeaId,
          isUpvote: true,
        },
      });
      return { upvote };
    }),

  createDownvote: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        videoIdeaId: z.number(),
      }),
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const { userId, videoIdeaId } = input;
      const downvote = await db.vote.upsert({
        where: {
          userId_videoIdeaId: {
            userId,
            videoIdeaId,
          },
        },
        update: { isUpvote: false },
        create: {
          userId,
          videoIdeaId,
          isUpvote: false,
        },
      });
      return { downvote };
    }),

  createIdea: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const { name, description, userId } = input;
      const newIdea = await db.videoIdea.create({
        data: {
          name,
          description,
          userId,
        },
      });
      return { newIdea };
    }),
});
