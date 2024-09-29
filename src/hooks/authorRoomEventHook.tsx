import { useSuiClientInfiniteQuery } from "@mysten/dapp-kit";
import { SuiEvent } from "@mysten/sui.js/client";
import { useMemo } from "react";

export default function authorRoomEventHook(packageid: string, module: string, eventname: string) {

  const {
    data: write3Events,
    refetch: refetchEvents,
    fetchNextPage,
    hasNextPage,
  } = useSuiClientInfiniteQuery(
    "queryEvents",
    {
      query: {
        MoveModule: {
          package: packageid,
          module: module,
        },
      },
      order: "descending",
    },
    {
      refetchInterval: 30000,
    }
  );

  const authorRoomEvents = useMemo(() => {
    return (
      write3Events?.pages.map((pEvent) =>
        pEvent.data.filter((event) => event.type.includes(eventname))
      ) || []
    ).flat(Infinity) as SuiEvent[];
  }, [write3Events]);

  // if (authorRoomEvents) {
  //   console.log('authorRoomEvents', authorRoomEvents);
  // }

  return {
    authorRoomEvents,
    authorRoomID: (authorRoomEvents[0]?.parsedJson as { id: string })?.id || '' as string,
    refetchEvents, fetchNextPage, hasNextPage
  };

}