import Head from "next/head";
import { RouterOutputs, api } from "@/utils/api";
import { useEffect, useMemo, useState } from "react";

const localStorageKey = "clubofcoders-voting-app-user-id";

const UpvoteDownvote = ({
  userId,
  videoIdeaId,
  votes,
}: {
  userId: string;
  videoIdeaId: number;
  votes: RouterOutputs["voting"]["getAllIdeasWithVotes"]["getAllIdeasFromDb"][number]["votes"];
}) => {
  const utils = api.useUtils();

  const upvoteIdea = api.voting.createUpvote.useMutation();
  const createDownvote = api.voting.createDownvote.useMutation();

  const countedVoted = useMemo(() => {
    const upvotes = votes.filter((x) => x.isUpvote);
    const downVotes = votes.filter((x) => !x.isUpvote);

    return { upvotesCount: upvotes.length, downVotesCount: downVotes.length };
  }, [votes]);

  return (
    <div>
      <button
        disabled={upvoteIdea.isPending}
        onClick={() => {
          upvoteIdea.mutate(
            {
              userId,
              videoIdeaId,
            },
            {
              onSuccess: async () => {
                await utils.invalidate();
              },
            },
          );
        }}
      >
        {countedVoted.upvotesCount}{" "}
        {upvoteIdea.isPending ? "loading..." : "upvote"}
      </button>
      <button
        disabled={createDownvote.isPending}
        onClick={() => {
          createDownvote.mutate(
            {
              userId,
              videoIdeaId,
            },
            {
              onSuccess: async () => {
                await utils.invalidate();
              },
            },
          );
        }}
      >
        {countedVoted.downVotesCount} downvote
      </button>
    </div>
  );
};

export default function Home() {
  const [randomUserId, setRandomUserId] = useState<string | undefined>(
    undefined,
  );

  const utils = api.useUtils();

  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
  });

  const createIdea = api.voting.createIdea.useMutation();
  const getAllIdeasWithVotes = api.voting.getAllIdeasWithVotes.useQuery();

  useEffect(() => {
    const gotUserId = localStorage.getItem(localStorageKey);
    if (gotUserId) {
      setRandomUserId(gotUserId);
    } else {
      const randomId = crypto.randomUUID();
      localStorage.setItem(localStorageKey, randomId);
      setRandomUserId(randomId);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Video Idea Voting App</title>
        <meta name="description" content="Created using create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <form
        className="m-10 flex max-w-xl flex-col space-y-4 rounded-xl bg-white shadow-xl"
        onSubmit={(e) => {
          e.preventDefault();

          // basic validation
          if (
            !randomUserId ||
            formValues.name.trim() === "" ||
            formValues.description.trim() === ""
          ) {
            return alert("please enter correct values!");
          }

          createIdea.mutate(
            {
              userId: randomUserId,
              name: formValues.name.trim(),
              description: formValues.description.trim(),
            },
            {
              onSuccess: async () => {
                await utils.invalidate();
              },
            },
          );
        }}
      >
        <input
          type="text"
          name="idea-name"
          id="idea-name"
          className="ring-offset-gray flex h-10 w-full rounded-md border border-black bg-gray-100 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={formValues.name}
          onChange={(e) =>
            setFormValues((p) => ({ ...p, name: e.target.value }))
          }
        />
        <input
          type="text"
          name="idea-description"
          className="ring-offset-gray flex h-10 w-full rounded-md border border-black bg-gray-100 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          id="idea-description"
          value={formValues.description}
          onChange={(e) =>
            setFormValues((p) => ({ ...p, description: e.target.value }))
          }
        />
        <button type="submit">submit an idea</button>
      </form>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Youtube Idea Voting App
          </h1>
          <div className="grid w-full grid-cols-1 gap-4">
            {getAllIdeasWithVotes.isSuccess &&
              getAllIdeasWithVotes.data.getAllIdeasFromDb.map((idea) => (
                <div
                  key={idea.id}
                  className="flex w-full items-center justify-between rounded-xl bg-white p-6"
                >
                  <div>
                    <div className="text-xl">{idea.name}</div>
                    <div className="text-sm font-light">{idea.description}</div>
                  </div>
                  {randomUserId && (
                    <div>
                      <UpvoteDownvote
                        userId={randomUserId}
                        videoIdeaId={idea.id}
                        votes={idea.votes}
                      />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </main>
    </>
  );
}
